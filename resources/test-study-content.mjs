import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadKnowledge,areas} from './build-knowledge.mjs';
import {goalPaths} from './goal-paths.mjs';
import {loadConceptReadings,loadDirectionIntroductions,loadCourseStudies,validateStudyContent,checkedHTTPS,loadStudyChecks,validateStudyChecks,renderDirectionIntroduction} from './study-content.mjs';
import {prepareEntries,searchEntries} from './assets/search-core.js';
import {loadLearningEdition,combinedChecks} from './learning-editorial.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const readings=loadConceptReadings(root),introductions=loadDirectionIntroductions(root),courses=loadCourseStudies(root),knowledge=loadKnowledge(root),topics=json('notes/reading-notes/library/catalogue.json').topics;
for(const unsafe of ['javascript:alert(1)','data:text/html,hi','http://example.com','https://user:password@example.com/','not a URL'])assert.throws(()=>checkedHTTPS(unsafe));
validateStudyContent({readings,introductions,courses,knowledge,topics,routeIds:goalPaths.map(r=>r.id),areas});
const validationInput={readings,introductions,courses,knowledge,topics,routeIds:goalPaths.map(r=>r.id),areas};
const unsafeCourses=structuredClone(courses);unsafeCourses[topics[0].id].practice.url='javascript:alert(1)';
assert.throws(()=>validateStudyContent({...validationInput,courses:unsafeCourses}));
const unsafeReadings=structuredClone(readings);unsafeReadings[0].references[0].sourceUrl='javascript:alert(1)';
assert.throws(()=>validateStudyContent({...validationInput,readings:unsafeReadings}));
assert.equal(readings.length,60);
assert.equal(Object.keys(courses).length,29);
assert.deepEqual(Object.fromEntries(Object.keys(areas).map(area=>[area,readings.filter(e=>e.area===area).length])),{
 foundations:3,algebra:24,analysis:6,'geometry-topology':6,'number-theory':5,probability:4,combinatorics:3,dynamics:3,'category-theory':6,
});
const originalNames=new Set(knowledge.articles.flatMap(e=>[e.title,...e.aliases]).map(s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase()));
for(const entry of readings){
 assert(!originalNames.has(entry.title.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase()),'New guide repeats original concept '+entry.id);
 const body=read(`resources/encyclopedia/${entry.id}/index.html`);
 assert(body.includes('External reading guide'));
 assert(body.includes('data-content-license'));
 assert(!body.includes('data-entry-details'));
 for(const r of entry.references){
  assert(body.includes(r.url.replaceAll('&','&amp;')),entry.id+' missing reading link');
  if(r.sourceUrl)assert(/^https:\/\//.test(r.sourceUrl));
  assert(r.checked<='2026-10-16','Future review date '+entry.id);
 }
}
for(const route of goalPaths){
 const html=read('resources/library-paths/routes/'+route.id+'.html');
 assert.equal((html.match(/class="direction-introduction"/g)||[]).length,1);
 assert(html.includes('Sources for this introduction'));
 assert(html.includes('id="introduction"'));
 assert(html.includes('/assets/katex/katex.min.css'));
}
for(const topic of topics){
 const html=read('notes/reading-notes/library/'+topic.route);
 assert.equal((html.match(/<!-- subject-guide:start -->/g)||[]).length,1,topic.id+' duplicate study guide');
 assert(html.includes('What to work on'));
 assert(html.includes('Try these before moving on'));
 assert(!html.includes('Compare starting points'));
 for(const item of [courses[topic.id].primary,...courses[topic.id].alternatives])assert(html.includes(item.url.replaceAll('&','&amp;')),topic.id+' missing selected source');
}
const encyclopedia=json('resources/catalogue-data/encyclopedia/index.json');
assert.equal(encyclopedia.records.length,knowledge.articles.length+readings.length);
assert(encyclopedia.filters.some(f=>f.field==='contentKind'));
assert.equal(encyclopedia.records.filter(r=>r.fields.contentKind==='External reading guide').length,60);
const entries=[...json('resources/search/index/encyclopedia.json'),...json('resources/search/index/terminology.json')];
const documents=prepareEntries(entries,true);
const studyChecks=loadStudyChecks(root);
assert.equal(validateStudyChecks(studyChecks,courses),13);
const changedPrompt=structuredClone(studyChecks);changedPrompt.proofs[0].prompt='Unrelated question';
assert.throws(()=>validateStudyChecks(changedPrompt,courses),'Solutions must stay tied to their actual question');
for(const [topic,checks]of Object.entries(studyChecks)){
 const file='notes/reading-notes/library/'+topics.find(t=>t.id===topic).route,html=read(file);
 const expanded=combinedChecks(checks,loadLearningEdition(root).checks[topic]);
 assert.equal((html.match(/<summary>A hint<\/summary>/g)||[]).length,expanded.length,file+' hints');
 assert.equal((html.match(/<summary>Work through the solution<\/summary>/g)||[]).length,expanded.length,file+' solutions');
 for(const check of checks)assert(html.includes('id="check-'+check.id+'"'));
 assert(html.includes('/assets/katex/katex.min.css'),file+' math is build-time rendered');
}
for(const [id,entry]of Object.entries(introductions)){
 const rendered=renderDirectionIntroduction(entry,id),html=read('resources/library-paths/routes/'+id+'.html');
 assert(rendered.contents.length>=3,id+' missing editorial sections');
 for(const h of rendered.contents)assert(html.includes('href="#'+h.id+'"')&&html.includes('id="'+h.id+'"'),id+' section is not reachable');
}
const figures=[
 ['resources/library-paths/routes/algebraic-geometry.html','same-point-different-rings'],
 ['notes/reading-notes/library/algebra/algebraic-geometry.html','smooth-and-singular'],
 ['notes/reading-notes/library/analysis/real-analysis.html','pointwise-not-uniform'],
 ['notes/reading-notes/library/geometry-topology/algebraic-topology.html','loops-and-holes'],
];
for(const [file,id]of figures){const html=read(file);assert(html.includes('id="'+id+'"'));assert(html.includes('role="img" aria-labelledby='));assert(html.includes('<figcaption>'));assert(!/<svg[^>]*onload=/.test(html))}
assert(read('resources/library-paths/index.html').includes('reading-a-text.html'));
assert(read('resources/library-paths/reading-a-text.html').includes('Give each definition somewhere to live'));
assert(json('resources/search/index/guides.json').some(e=>e.url.endsWith('/reading-a-text.html')));
const authorMatches=searchEntries(documents,{q:'The Stacks Project Authors',type:'encyclopedia'});
assert(JSON.stringify(authorMatches).includes('grothendieck-site'),'Reference authors must remain searchable');
for(const guide of readings){
 const matches=documents.filter(d=>d.entry.id===guide.id);
 assert.equal(matches.length,1,guide.id+' duplicate unified concept');
 if(knowledge.terms.some(t=>t.id===guide.id))assert(matches[0].entry.termUrl);
 const result=searchEntries(documents,{q:guide.title,type:'encyclopedia'});
 assert(JSON.stringify(result).includes(guide.id),guide.id+' not searchable');
}
assert.equal(json('resources/catalogue-data/library/index.json').defaults.readingAccess,'Free to read');
const subjectMap=read('resources/encyclopedia/index.html').match(/<details id="encyclopedia-coverage">([\s\S]*?)<\/details>/)?.[1];
assert(subjectMap,'Encyclopedia subject map is missing');
const explained=new Set([...knowledge.articles,...readings].map(e=>e.id));
for(const [id,area] of Object.entries(areas)){
 const row=subjectMap.match(new RegExp('<tr><th scope="row"><a href="/en/resources/encyclopedia/\\?area='+encodeURIComponent(area.title).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'"[\\s\\S]*?<\\/tr>'))?.[0];
 assert(row,'Missing subject map row: '+id);
 const expected=[
  knowledge.articles.filter(a=>a.area===id).length,
  readings.filter(a=>a.area===id).length,
  knowledge.terms.filter(t=>t.area===id&&!explained.has(t.id)).length,
 ];
 assert(row.includes(expected.map(count=>'<td>'+count+'</td>').join('')),'Incorrect separate counts: '+id);
}
for(const [id,href] of [
 ['localization-commutative-ring','/encyclopedia/algebraic-prime-spectrum/#examples-and-non-examples'],
 ['algebraic-prime-spectrum','/encyclopedia/sheaf/#definition-and-conventions'],
 ['sheaf','/library-paths/routes/algebraic-geometry.html#localization-in-practice'],
 ['group','/terminology/normal-subgroup/'],
 ['uniform-convergence','/terminology/pointwise-convergence/'],
 ['finite-simple-graph','/terminology/connected-graph/'],
 ['universal-quantifier','/terminology/existential-quantifier/'],
]){
 const aside=read('resources/encyclopedia/'+id+'/index.html').match(/<aside aria-label="Follow the example">([\s\S]*?)<\/aside>/)?.[1];
 assert(aside?.includes(href)&&aside.includes('lang="zh-Hans"'),'Missing bilingual example connection: '+id);
}
const {sourceRecords,findReferences,stackParts}=await import('./assets/reference-index.js');
const sourcePath='resources/data/reference-index/';
const refs=sourceRecords(read(sourcePath+'banana.txt'),stackParts.map(name=>read(sourcePath+name)));
assert.equal(refs.filter(entry=>entry.source==='banana').length,1831);
assert.equal(refs.filter(entry=>entry.source==='stacks').length,21446);
assert.equal(new Set(refs.map(entry=>entry.url)).size,refs.length);
assert.equal(findReferences(refs,'01i6','stacks')[0]?.url,'https://stacks.math.columbia.edu/tag/01I6');
assert(findReferences(refs,'仿射概形','banana').some(entry=>entry.label==='仿射概形'));
assert(findReferences(refs,'quasi coherent','stacks').length>0);
assert(read('resources/encyclopedia/index.html').includes('/en/resources/encyclopedia/reference-index.html'));
assert(read('resources/encyclopedia/reference-index.html').includes('/en/resources/assets/reference-index.js'));
assert.deepEqual(json('resources/portal-report.json').contentBreakdown,{originalArticles:150,externalReadingGuides:60,terminologySenses:513,directionIntroductions:12,subjectStudyGuides:29});
console.log(JSON.stringify({passed:true,directionIntroductions:12,subjectStudyGuides:29,externalReadingGuides:60,originalArticles:150,terminologySenses:513}));
