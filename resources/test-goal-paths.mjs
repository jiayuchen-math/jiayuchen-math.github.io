import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {goalPaths,goalPathPages} from './goal-paths.mjs';
import {nodes} from './data/learning-paths.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const topics=JSON.parse(read('notes/reading-notes/library/catalogue.json')).topics;
const pages=goalPathPages({topics,nodes});
assert.equal(goalPaths.length,12);
assert.equal(new Set(goalPaths.map(r=>r.id)).size,goalPaths.length);
const index=read('resources/library-paths/index.html');
assert.equal((index.match(/<article class="goal-card">/g)||[]).length,12);
assert(index.includes('Individual subject preparation'));
for(const topic of topics){
 assert(index.includes('library-paths/'+topic.id+'.html'));
 assert(fs.existsSync(path.join(root,'resources/library-paths/'+topic.id+'.html')));
}
for(const [file,page] of pages){
 const html=read(file);
 assert(html.includes('library-browse.css'));
 assert(html.includes('portal-content:start'));
 for(const match of page.body.matchAll(/href="(\/en\/[^"#?]*)(?:[?#][^"]*)?"/g)){
  const local=match[1].slice(4);
  assert(fs.existsSync(path.join(root,local.endsWith('/')?local+'index.html':local)),file+' → '+local);
 }
}
for(const r of goalPaths){
 const html=read('resources/library-paths/routes/'+r.id+'.html');
 assert.equal((html.match(/class="route-stage"/g)||[]).length,r.stages.length);
 assert(html.includes('Route stages'));
 assert(html.includes('Preparation &amp; skip guidance'));
 assert(html.includes('Enter at the first unfamiliar stage'));
}
const catalogue=read('notes/reading-notes/library/catalogue.html');
assert(catalogue.includes('Browse subject cards'));
const cards=read('notes/reading-notes/library.html');
assert.equal((cards.match(/<a class="card"/g)||[]).length,7);
assert(cards.includes('library/catalogue.html'));
assert(cards.includes('library-browse.css'));
for(const area of ['foundations','algebra','analysis','geometry-topology','number-theory','discrete-mathematics','probability-dynamics'])
 assert(read('notes/reading-notes/library/'+area+'.html').includes('library-browse.css'));
assert.equal(JSON.parse(read('resources/portal-report.json')).counts.library,576+JSON.parse(read('resources/data/library-banana.json')).length);
const hub=read('resources/index.html');
assert(hub.includes('<ul class="subject-links">'));
const subjectNavigation=hub.match(/<ul class="subject-links">([\s\S]*?)<\/ul>/)[1];
assert.equal((subjectNavigation.match(/<li><a href="\/en\/notes\/reading-notes\/library\//g)||[]).length,9);
assert(hub.includes('entrances.css'));
const reading=read('notes/reading-notes/reading-notes.html');
assert(reading.includes('No reading notes have been published yet.'));
assert(!/<a\b[^>]*href="#"/.test(reading));
assert(reading.includes('entrances.css'));
console.log(JSON.stringify({passed:true,goalRoutes:12,prerequisiteReviews:topics.length,libraryViews:['searchable list','subject cards'],resources:576}));
