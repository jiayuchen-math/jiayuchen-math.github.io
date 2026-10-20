import fs from'node:fs';import path from'node:path';import{createHash}from'node:crypto';import assert from'node:assert/strict';import{fileURLToPath}from'node:url';import{decodeHTML}from'entities';import{legacyCourseNote,readableNoteBody}from'./course-note-layout.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),sha=b=>createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(read('resources/data/course-note-presentation.json'));
export const legacyCourseSources=Object.fromEntries(manifest.legacy.map(e=>[e.file,e.original]));
assert.equal(manifest.legacy.length,2);assert.deepEqual(Object.keys(legacyCourseSources).sort(),[1,2].map(n=>'notes/mathematical-notes/calculus/MAweek'+n+'.html'));
for(const e of manifest.legacy){
 assert([1,2].includes(e.week));assert.equal(sha(fs.readFileSync(path.join(root,e.original))),e.sha256,'Original pre-redesign HTML retained');
 const raw=read(e.original),r=legacyCourseNote(raw,e.week),html=read(e.file),article=html.match(/<article class="course-note">([\s\S]*?)<\/article>/)[1];assert.equal(article,readableNoteBody(r.html),'Only documented presentation transforms applied');
 const annotations=[...article.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map(m=>decodeHTML(m[1]));assert.deepEqual(annotations,r.math.map(m=>m.source));
 for(const match of raw.matchAll(/<(?:h[1-6]|img|a)\b[^>]*>/g)){const attr=match[0].match(/\b(id|src|href)="([^"]+)"/);if(attr&&attr[1]!=='href')assert(article.includes(attr[1]+'="'+attr[2]+'"'),'Original anchor / image retained')}
 assert(!html.includes('MathJax'));assert(!html.includes('cdn.jsdelivr'));
}
for(const week of[1,2,3,4,5]){
 const html=read('notes/mathematical-notes/calculus/MAweek'+week+'.html');assert(html.includes('course-notes.css?v='));assert(html.includes('<h1>Calculus — Week '+week+'</h1>'));assert(html.includes('<details class="contents">'));assert(!html.includes('katex-error'));if(week>1)assert(html.includes('href="MAweek'+(week-1)+'.html"'));if(week<5)assert(html.includes('href="MAweek'+(week+1)+'.html"'));
}
const css=read('resources/assets/course-notes.css');assert(css.includes('font:17px/1.95'));assert(css.includes('margin:0 0 24px'));assert(css.includes('.note-statement>strong:first-child{display:block'));assert(css.includes('overflow-x:auto'));assert(!/course-note[^}]*display:none/.test(css));
console.log(JSON.stringify({passed:true,unifiedWeeks:5,legacyHTMLSnapshots:2,oldAnchorsAndImagesRetained:true,displayOnly:true}));
