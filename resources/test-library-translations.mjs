import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {withAccess} from './data/library-access.mjs';
import {createLibraryTranslations,librarySourceHash} from './library-translations.mjs';
import {polishFragment,conciseText} from './concise-copy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f));
const catalogue=json('notes/reading-notes/library/catalogue.json'),registry=json('resources/data/stable-ui-ids.json').library,copy=json('resources/data/library-zh-undergraduate.json');
const topics=catalogue.topics.filter(t=>copy.scope.includes(t.id)),books=topics.flatMap(t=>t.books.map(b=>withAccess({...b,language:b.language||'English (legacy metadata)'}))),before=JSON.stringify(books),tr=createLibraryTranslations(root,books,registry);
assert.equal(books.length,49);assert.equal(new Set(books.map(b=>b.url)).size,49);assert.equal(JSON.stringify(books),before);
const hrefs=h=>[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).sort();
for(const topic of topics){
 const built=read('notes/reading-notes/library/'+topic.route),p=JSON.parse(built.match(/<script type="application\/json" id="page-translations">([\s\S]*?)<\/script>/)[1]);
 for(const name of ['intro','books']){
  const english=built.match(new RegExp('<!-- library-copy:'+name+':start --><div id="library-copy-'+name+'">([\\s\\S]*?)</div><!-- library-copy:'+name+':end -->'))[1];
  assert.deepEqual(hrefs(p.blocks['library-copy-'+name]),hrefs(english),'All source and reading links preserved');
  assert.equal(p.blocks['library-copy-'+name],polishFragment(tr.html(english),{library:name==='books'}),'Exact compiled translation after reviewed copy edits');
  assert.equal((built.match(new RegExp('id="library-copy-'+name+'"','g'))||[]).length,1,'No nested blocks on rebuild');
 }
 for(const b of topic.books){const id=registry[b.url.replace(/\/$/,'')];assert(p.blocks['library-copy-books'].includes(conciseText(copy.entries[id].note)),id+' Chinese annotation without catalogue bookkeeping');assert(built.includes(b.title.replaceAll('&','&amp;')),id+' original title retained');}
 assert.equal(p.coverage.status,'body-translated');
 assert(!/Further print reading|Additional reading|Introductory reading|Review dates appear/.test(p.blocks['library-copy-books']));
}
assert(tr.records['work-0019'].note.includes('由恒等式刻画的代数类'));assert.equal(tr.translate('Danish'),'丹麦语');
assert(tr.translate('Publisher access requires purchase or an eligible library subscription. Free front matter, sample chapters and previews are not the complete book.').includes('不是全书'));
assert(tr.translate('Version: 1997 · Checked 2026-10-11').includes('1997 · 原核查：2026-10-11'));
const changed=structuredClone(books);changed[0].note+=' New English claim.';assert.throws(()=>createLibraryTranslations(root,changed,registry),/English source changed/);assert.notEqual(librarySourceHash(changed[0]),librarySourceHash(books[0]));
const index=json('resources/catalogue-data/library/index.json');for(const [id,b]of Object.entries(tr.records)){const row=index.records.find(r=>r.id===id);assert(row.search.includes(b.note));assert(row.search.includes(b.preparation));}
for(const file of fs.readdirSync(path.join(root,'notes/reading-notes/library')).filter(f=>/^catalogue(?:-all)?(?:-page-\d+)?\.html$/.test(f)))assert(read('notes/reading-notes/library/'+file).includes('/resources/assets/library-copy.js?v='));
console.log(JSON.stringify({libraryAnnotationsTranslated:49,subjects:3,bookTitlesPreserved:true,sourceDriftGuard:true,originalAccessAndDatesPreserved:true,ChineseDirectorySearch:true}));
