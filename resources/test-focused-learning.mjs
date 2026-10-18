import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeHTML} from 'entities';
import {focusedPages,readTranslationApprovals,sourceFingerprint,translationCoverage} from './editorial-support.mjs';
import {routeLabels,routeContext,contextualURL,staticRouteContext,publicSourcePage,issueURL} from './assets/learning-context.js';
import {pilotSubjectSection,pilotRouteSection} from './learning-pilots.mjs';
import {algebraicGeometryTopicData} from './data/algebraic-geometry-topic.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f));
const payload=h=>JSON.parse(h.match(/id="page-translations">([\s\S]*?)<\/script>/)[1]);
const live=h=>h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const ids=h=>[...h.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
const base='https://jiayuchen-math.github.io';
assert.equal(Object.keys(routeLabels).length,12);
for(const id of Object.keys(routeLabels)){
 const url=base+'/en/resources/library-paths/routes/'+id+'.html?lang=zh';
 assert.equal(routeContext(url),id);
 const next=contextualURL('/en/resources/encyclopedia/sheaf/?lang=zh#definition',url);
 assert.equal(next.searchParams.get('fromPath'),id);assert.equal(next.searchParams.get('lang'),'zh');assert.equal(next.hash,'#definition');
 assert(!contextualURL('https://example.org/a.pdf',url).searchParams.has('fromPath'));
 assert(!contextualURL('/en/notes/reading-notes/library/a.pdf',url).searchParams.has('fromPath'));
 const html=staticRouteContext('<a href="/en/resources/encyclopedia/sheaf/?lang=zh&amp;x=1#definition">x</a>',id);
 assert(html.includes('fromPath='+id));assert(!html.includes('amp%3B'));
}
for(const value of ['https://example.org/','__proto__','constructor','../probability','<script>',''])assert.equal(routeContext(base+'/resources/?fromPath='+encodeURIComponent(value)),'');
assert.equal(routeContext(base+'/resources/library-paths/routes/probability.html?fromPath=algebraic-geometry'),'probability');
assert.equal(publicSourcePage(base+'/resources/search/?q=private&token=secret#definition'),base+'/resources/search/#definition');
assert.equal(publicSourcePage('https://evil.example/a'),base+'/');
assert.equal(publicSourcePage(base+'/resources/?q=x#:~:text=private'),base+'/resources/');
const fields={'math-correction.yml':'claim','broken-link.yml':'link-text','terminology-suggestion.yml':'current-claim','resource-recommendation.yml':'reading-purpose','article-proposal.yml':'location','translation-correction.yml':'location'};
for(const [form,field]of Object.entries(fields)){
 const url=issueURL(form,base+'/resources/topics/algebraic-geometry/#derived-higher','#derived-higher');
 assert.equal(url.searchParams.get('template'),form);assert.equal(url.searchParams.get(field),'#derived-higher');
 assert.equal(url.searchParams.get('page-url'),base+'/resources/topics/algebraic-geometry/#derived-higher');
}
assert.throws(()=>issueURL('../evil',base));
const approvals=readTranslationApprovals(root),inventory=json('resources/data/translation-coverage.json');
assert.equal(focusedPages.length,10);assert.equal(new Set(focusedPages.map(p=>p[0])).size,10);
const topics=json('notes/reading-notes/library/catalogue.json').topics;
for(const [file,,,scope]of focusedPages){
 const html=read(file),data=payload(html),body=live(html),coverage=inventory.pages.find(p=>p.file===file);
 assert(html.includes('learning-context.js'));assert(html.includes('learning-edition.css'));
 assert.equal(new Set(ids(body)).size,ids(body).length,'Unique live DOM IDs: '+file);
 assert(!/katex-error|href="#"/.test(body));
 assert(data.coverage.sourceHash);assert.equal(data.coverage.scope,scope);
 assert.equal(coverage.sourceHash,data.coverage.sourceHash);
 assert.equal(data.coverage.status,scope==='page'?'body-translated':'partly-translated','Reviewed translation: '+file);
 assert.equal(approvals[file].sourceHash,data.coverage.sourceHash);assert.equal(approvals[file].reviewed,'2026-10-19');
 const own=live(html.match(/<!-- portal-content:start -->([\s\S]*?)<!-- portal-content:end -->/)[1]);
 for(const copy of [own,...Object.values(data.blocks)]){
  for(const m of copy.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)){
   const url=new URL(decodeHTML(m[1]),base+'/en/'+file);
   if(url.origin!==base)continue;
   let targetFile=decodeURIComponent(url.pathname.replace(/^\/(?:en\/)?/,''));
   if(targetFile.endsWith('/'))targetFile+='index.html';
   assert(fs.existsSync(path.join(root,targetFile)),'Internal link: '+file+' -> '+targetFile);
   // Directory record anchors are resolved by existing directory routing tests.
   if(url.hash&&!/catalogue\.html$/.test(targetFile))assert(live(read(targetFile)).includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),'Anchor: '+file+' -> '+url.href);
  }
 }
 if(scope==='learning-sections'){
  const id=topics.find(t=>'notes/reading-notes/library/'+t.route===file).id;
  assert.equal(data.blocks['pilot-copy'],pilotSubjectSection(id,{topics,locale:'zh'}));
  assert.equal((body.match(/id="pilot-copy"/g)||[]).length,1);assert(data.blocks['pilot-catalogue-note'].includes('保留原文'));
 }else if(file.includes('/routes/')){
  const id=file.split('/').at(-1).replace('.html','');
  assert(data.blocks['route-copy'].includes(staticRouteContext(pilotRouteSection(id,{topics,locale:'zh'}),id)));
 }
}
const sample={title:'A',body:'A source'};
const approved={'x.html':{sourceHash:sourceFingerprint(sample),reviewed:'2026-10-19'}};
assert.equal(translationCoverage('x.html',sample,approved).status,'body-translated');
assert.equal(translationCoverage('x.html',{...sample,body:'Changed'},approved).status,'needs-review');
assert.equal(translationCoverage('x.html',sample,approved,'page',1).status,'needs-review');
assert.equal(approved['x.html'].reviewed,'2026-10-19','Build never approves or dates a revision');
const hub=live(read('resources/index.html'));assert.equal((hub.match(/class="task-links"/g)||[]).length,1);
assert.equal((live(read('notes/reading-notes/library.html')).match(/class="editorial-record"/g)||[]).length,1);
const topic='resources/topics/algebraic-geometry/index.html',guide=json('resources/search/index/guides.json').filter(e=>e.url==='/en/'+topic.replace('index.html',''));
assert.equal(guide.length,1);assert(guide[0].aliases.includes('代数几何专题'));
assert(json('resources/catalogue-data/learning-tools/entries.json').some(e=>e.id===guide[0].id),'Topic can be saved to the existing bookshelf');
assert.equal(algebraicGeometryTopicData.sections.length,6);
const report=json('resources/portal-report.json');assert.deepEqual(report.counts,{library:576,encyclopedia:150,terminology:513,links:110,programs:225,researchers:1939});
assert(report.indexBytes<2*1024*1024);assert(report.directories.every(d=>d.firstPageBytes<350*1024));
assert(!inventory.pages.some(p=>p.status==='body-translated'&&/encyclopedia\/.+\/index/.test(p.file)),'No bulk claim that encyclopedia prose has been translated');
console.log(JSON.stringify({focusedPages:10,scope:'7 page bodies and 3 learning sections; catalogue annotations unchanged',contextWhitelist:12,issueForms:6,originalCountsPreserved:true,translationDriftDetected:true}));
