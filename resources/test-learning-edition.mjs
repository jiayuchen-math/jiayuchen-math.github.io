import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadLearningEdition,validateLearningEdition,combinedChecks,editorialGuidePages} from './learning-editorial.mjs';
import {loadCourseStudies,loadStudyChecks} from './study-content.mjs';
import {learningIllustrations} from './learning-illustrations.mjs';
import {prepareEntries,searchEntries,searchState} from './assets/search-core.js';
const root=fileURLToPath(new URL('../',import.meta.url)),read=file=>fs.readFileSync(path.join(root,file),'utf8'),json=file=>JSON.parse(read(file));
const topics=json('notes/reading-notes/library/catalogue.json').topics,edition=loadLearningEdition(root),old=loadStudyChecks(root),courses=loadCourseStudies(root);
const counts=validateLearningEdition(edition,topics,old);
assert.equal(new Set(Object.values(edition.subjects).map(e=>e.opening)).size,29,'Subject openings must be individually edited');
for(const topic of topics){
 // Preserve these exact assertions for the original worked checks; additive
 // pilot checks have their own mathematics and bilingual integration tests.
 const html=read('notes/reading-notes/library/'+topic.route).replace(/<!-- pilot-edition:start -->[\s\S]*?<!-- pilot-edition:end -->/g,''),e=edition.subjects[topic.id],checks=combinedChecks(old[topic.id],edition.checks[topic.id]);
 for(const anchor of ['study-guide','choose-reading','practice-learning','check-learning','continue-learning','subject-bibliography'])assert.equal((html.match(new RegExp('id="'+anchor+'"','g'))||[]).length,1,topic.id+' duplicate/missing '+anchor);
 assert(html.includes('study-jumps'));
 assert.equal((html.match(/class="reading-choice"/g)||[]).length,e.comparison.length);
 for(const original of [courses[topic.id].primary,...courses[topic.id].alternatives])assert(html.includes(original.url.replaceAll('&','&amp;')),'Old reading location lost '+topic.id);
 for(const check of checks){assert(html.includes('id="check-'+check.id+'"'));assert.equal(typeof check.prompt,'string');assert(check.prompt.trim());}
 assert.equal((html.match(/<summary>A hint<\/summary>/g)||[]).length,checks.length);
 assert.equal((html.match(/<summary>Work through the solution<\/summary>/g)||[]).length,checks.length);
}
for(const subject of ['algebraic-geometry','real-analysis','probability']){
 const illustrations=learningIllustrations(subject);
 assert.equal((illustrations.match(/<figure\b/g)||[]).length,2,subject+' two purposeful figures');
 assert(illustrations.includes('aria-describedby=')&&illustrations.includes('<figcaption>'));
 assert(illustrations.includes('learning-enlargement'),'Native enlargement');
 const ids=[...illustrations.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,subject+' duplicate figure ID');
}
const index=json('resources/search/index/guides.json');
for(const page of editorialGuidePages(root,edition,topics)){
 const html=read(page.file);assert(html.includes('Sources and further reading'));assert(html.includes('AI-assisted drafting'));
 assert.equal(index.filter(r=>r.url==='/en/'+page.file).length,1,'Guide duplicated in search');
 for(const h of page.contents)assert(html.includes('id="'+h.id+'"')&&html.includes('href="#'+h.id+'"'));
}
const meanings=json('resources/search/meanings.json');assert(meanings.normal.length>=3);
const docs=prepareEntries([...json('resources/search/index/encyclopedia.json'),...json('resources/search/index/terminology.json')],true);
for(const meaning of meanings.normal){const matches=searchEntries(docs,{q:'normal',sense:meaning.id});assert.equal(matches.length,1,'Sense not unique '+meaning.id);assert.equal(matches[0].id,meaning.id)}
assert.equal(searchState({sense:'<script>'}).sense,'');
const registry=json('resources/catalogue-data/learning-tools/entries.json');
assert(registry.some(r=>r.type==='library'));assert(registry.some(r=>r.type==='notes'));assert(!registry.some(r=>['researchers','programs'].includes(r.type)));
assert.equal(new Set(registry.map(r=>r.type+':'+r.id)).size,registry.length);
const registryIds=new Set(registry.map(r=>r.type+':'+r.id));
for(const file of ['resources/encyclopedia/index.html','notes/reading-notes/library/catalogue.html','notes/index.html',...edition.guides.map(g=>'resources/library-paths/guides/'+g.id+'.html')]){
 for(const control of read(file).matchAll(/<button\b[^>]*data-save-learning[^>]*>/g)){
  const id=control[0].match(/data-learning-id="([^"]+)"/)?.[1],type=control[0].match(/data-learning-type="([^"]+)"/)?.[1];
  assert(registryIds.has(type+':'+id),'Unresolvable save control '+file+' '+id);
 }
}
assert.equal(json('resources/catalogue-data/learning-tools/programs.json').length,225);
const hub=read('resources/index.html');assert(hub.includes('Recently edited'));assert.equal((hub.match(/<time datetime=/g)||[]).length,3);
assert(read('resources/bookshelf/index.html').includes('data-learning-tool="shelf"'));
assert(read('resources/study-careers/compare/index.html').includes('data-learning-tool="compare"'));
assert.equal(json('resources/catalogue-data/library/index.json').defaults.readingAccess,'Free to read');
assert.deepEqual(json('resources/portal-report.json').learningEdition,counts);
console.log(JSON.stringify({passed:true,...counts,pilotFigures:6,bookshelfEntries:registry.length,comparedProgramRecords:225}));
