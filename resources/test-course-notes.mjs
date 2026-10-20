import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{createHash}from'node:crypto';import{fileURLToPath}from'node:url';import{decodeHTML}from'entities';import{renderCourseNote,noteDirectory}from'./build-course-notes.mjs';
import{readableNoteBody}from'./course-note-layout.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const manifest=JSON.parse(read('resources/data/course-notes-additions.json'));
export const addedCourseFiles=new Set(manifest.files.map(f=>f.path));
assert.equal(addedCourseFiles.size,25);assert.equal(manifest.entries.length,3);
for(const f of manifest.files){assert(f.path.startsWith(noteDirectory+'/'));assert(!f.path.includes('..'));assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,f.path))).digest('hex'),f.sha256,'New note remains exact: '+f.path)}
let formulas=0,images=0;
for(const e of manifest.entries){
 assert([3,4,5].includes(e.week));const html=read(e.html),rendered=renderCourseNote(read(noteDirectory+'/'+e.name+'.md'),e.week);
 assert(html.includes('<article class="course-note">'+readableNoteBody(rendered.html)+'</article>'),'Full source body preserved');
 const annotations=[...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map(m=>decodeHTML(m[1]));assert.deepEqual(annotations,rendered.math.map(m=>m.source),'Every original formula preserved');
 assert(!html.includes('katex-error'));assert(!html.includes('MathJax'));assert(!html.includes('cdn.jsdelivr'));assert(!html.includes('\\newpage'));
 for(const c of rendered.contents)assert(html.includes('id="'+c.id+'"'));for(const src of rendered.images)assert(fs.existsSync(path.join(root,noteDirectory,src)));
 for(const ext of['pdf','tex','md'])assert(html.includes('href="'+e.name+'.'+ext+'"'));assert(html.includes('weekly.html?course=calculus&amp;type=html'));
 assert(html.includes('/resources/assets/course-notes.css'));formulas+=annotations.length;images+=rendered.images.length;
}
const weekly=read('resources/assets/weekly-entrance.js');for(const week of[3,4,5])for(const ext of['pdf','html'])assert(weekly.includes('MAweek'+week+'.'+ext));
console.log(JSON.stringify({passed:true,newWeeks:3,originalFilesExact:22,staticFormulas:formulas,figures:images}));
