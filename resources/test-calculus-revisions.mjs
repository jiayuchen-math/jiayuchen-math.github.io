import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{createHash}from'node:crypto';
import{calculusRevision}from'./calculus-revisions.mjs';
import{renderCourseNote,revisedCourseOptions,noteDirectory}from'./build-course-notes.mjs';
import{readableNoteBody}from'./course-note-layout.mjs';
const root=new URL('../',import.meta.url),read=f=>fs.readFileSync(new URL(f,root),'utf8');
for(const e of calculusRevision.archives){assert.equal(createHash('sha256').update(fs.readFileSync(new URL(e.original,root))).digest('hex'),e.sha256,'Unchanged original: '+e.file);}
assert.equal(calculusRevision.archives.length,11);assert.deepEqual(calculusRevision.scope,[1,2,3]);
assert.equal(calculusRevision.editions.length,3);
for(const edition of calculusRevision.editions)for(const file of edition.files){const bytes=fs.readFileSync(new URL(file.path,root));assert.equal(bytes.length,file.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,'Current revised edition: '+file.path);}
let formulas=0,figures=0;
for(const week of[1,2,3]){
 const md=read(noteDirectory+'/MAweek'+week+'.md'),html=read(noteDirectory+'/MAweek'+week+'.html'),r=renderCourseNote(md,week,revisedCourseOptions);
 const article=html.match(/<article class="course-note revised-note">([\s\S]*?)<\/article>/)?.[1];assert(article);
 assert(article.endsWith(readableNoteBody(r.html)),'Every revised paragraph is published');
 assert(!html.includes('katex-error'));assert(!html.includes('MathJax'));assert(html.includes('calculus-revised.css'));
 assert(html.includes('href="MAweek'+week+'.md"'));assert(!md.includes('\\underline{\\hspace'));
 const prior=read('resources/content/course-revisions/2026-10-24/MAweek'+week+'.html.source');
 for(const m of prior.matchAll(/\bid="([^"]+)"/g))assert(html.includes('id="'+m[1]+'"'),'Existing anchor '+m[1]);
 for(const image of r.images)assert(fs.existsSync(new URL(noteDirectory+'/'+image,root)));
 const pdf=fs.readFileSync(new URL(noteDirectory+'/'+(week===2?'week2':'MAweek'+week)+'.pdf',root));assert(pdf.subarray(0,5).equals(Buffer.from('%PDF-')));
 formulas+=r.math.length;figures+=r.images.length;
}
const second=read(noteDirectory+'/MAweek2.md');assert(second.includes('\\inf=-1,\\qquad \\sup=\\frac12'));assert(second.includes('n^{(-1)^n}'));assert(second.includes('\\qquad\\inf=0.'));
assert(second.includes('\\frac{\\sqrt{x+\\sqrt{x+\\sqrt{x}}}}{\\sqrt{x+1}}'));
const third=read(noteDirectory+'/MAweek3.md');assert(third.indexOf('# Tutorial 2:')>third.indexOf('# Lecture 12:'));
for(const number of['1.2.1','1.2.2','1.2.4','1.2.5','1.2.6','1.2.8','1.2.9','1.2.10','1.2.11','1.2.12','1.2.13','1.2.14','1.2.17','1.2.18','1.2.19','1.2.20','1.2.22','1.2.24','1.2.27','1.2.29','1.2.31','1.2.32','1.2.33','1.2.34','1.2.36','1.2.37','1.2.41','1.2.42','1.2.43'])assert(third.includes(number),'Original example retained: '+number);
for(let n=1;n<=13;n++)assert(third.includes('**Q'+n),'Original tutorial problem retained: '+n);
console.log(JSON.stringify({passed:true,revisedWeeks:3,originalFilesArchived:11,formulas,figures,priorBaselinesUnchanged:true}));
