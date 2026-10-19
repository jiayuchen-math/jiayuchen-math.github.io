import fs from 'node:fs';import assert from 'node:assert/strict';
import {libraryCounts,countLabel,updateLibraryCards} from './data/library-counts.mjs';
import {relatedSubjects} from './data/learning-paths.mjs';
// Count rendered cards, not the inert Chinese HTML stored in a JSON script.
const read=p=>fs.readFileSync(p,'utf8').replace(/<script type="application\/json" id="page-translations">[\s\S]*?<\/script>/g,''),catalogue=JSON.parse(read('notes/reading-notes/library/catalogue.json'));
const key=work=>work.url.replace(/\/$/,'');
// Independent expected sets use actual catalogue assignments and explicit cross-references.
const expected=new Map(catalogue.topics.map(t=>[t.id,new Set(t.books.map(key))]));
for(const topic of catalogue.topics)for(const work of topic.books)for(const related of relatedSubjects[work.title]||[])expected.get(related).add(key(work));
const unique=new Map();for(const topic of catalogue.topics)for(const work of topic.books){const id=key(work);if(!unique.has(id))unique.set(id,{...work,topic:topic.title});else unique.get(id).topic+='|'+topic.title}
for(const work of unique.values())for(const id of relatedSubjects[work.title]||[]){const title=catalogue.topics.find(t=>t.id===id).title;if(!work.topic.split('|').includes(title))work.topic+='|'+title}
const counts=libraryCounts(catalogue,[...unique.values()]);assert.equal(counts.total,new Set(catalogue.topics.flatMap(t=>t.books.map(key))).size);
const escape=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function checkCard(html,href,count){const card=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].find(m=>m[1].includes('href="'+href+'"')&&/class="card"/.test(m[1]));assert(card,'Missing card '+href);assert(card[2].includes(`data-resource-count="${count}">${countLabel(count)}</span>`),'Stale resource badge '+href);assert.equal([...card[2].matchAll(/data-resource-count=/g)].length,1);assert(!card[2].includes('full-text resource'),'Count incorrectly promises full-text access '+href)}
let subjectsChecked=0;
for(const topic of catalogue.topics){const count=expected.get(topic.id).size;assert.equal(counts.byTopic[topic.id],count);const groupHTML=read('notes/reading-notes/library/'+topic.group+'.html');checkCard(groupHTML,topic.route,count);assert.equal([...groupHTML.matchAll(/resource-count-policy:start/g)].length,0,'Do not repeat count methodology on every subject page');
 const subjectHTML=read('notes/reading-notes/library/'+topic.route);for(const id of expected.get(topic.id))assert(subjectHTML.includes('href="'+escape(id)+'"')||subjectHTML.includes('href="'+escape(id+'/')+'"'),'Counted work not linked on '+topic.id+': '+id);subjectsChecked++;
}
const entrance=read('notes/reading-notes/library.html');assert.equal([...entrance.matchAll(/resource-count-policy:start/g)].length,0,'The actual count remains on cards without a methodology paragraph');
for(const group of catalogue.groups){const union=new Set(catalogue.topics.filter(t=>t.group===group.id).flatMap(t=>[...expected.get(t.id)]));assert.equal(counts.byGroup[group.id],union.size);checkCard(entrance,'library/'+group.id+'.html',union.size)}
const fixture=`<a href='subject.html' class='extra card'><strong>Sample</strong>\n<span>1 full-text resource</span></a>`,map=new Map([['subject.html',12]]),updated=updateLibraryCards(fixture,map);
assert(updated.includes('12 resources'));assert.equal(updated,updateLibraryCards(updated,map));assert(updateLibraryCards(fixture,new Map([['subject.html',1]])).includes('>1 resource</span>'));assert(updateLibraryCards(fixture.replace('1 full-text resource','2 resources'),map).includes('12 resources'));
const description=`<a class="card" href="subject.html"><strong>Sample</strong><span>Descriptive text stays intact</span></a>`;assert(updateLibraryCards(description,map).includes('Descriptive text stays intact'));assert.throws(()=>updateLibraryCards(description,new Map([['absent.html',7]])),/target card missing/);
const report=JSON.parse(read('resources/build-report.json'));assert.deepEqual(report.libraryCardCounts,counts);
console.log(JSON.stringify({areaCards:catalogue.groups.length,subjectCards:subjectsChecked,uniqueWorks:counts.total,areaCounts:counts.byGroup,regressions:'singular/plural, attribute order, cross-references, missing targets, preserved descriptions and idempotence passed'}));
