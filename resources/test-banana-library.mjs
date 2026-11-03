import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bananaWorks,bananaAudit,bananaSupplements} from './banana-library.mjs';
import {dictionary as libraryDictionary} from './assets/library-copy-data.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const beforeFiles={
 'resources/data/library-additions.json':'bf3afd72a421ba3782405796299a3427bc9ce236931e9d04a163a701216e7a1c',
 'notes/reading-notes/library/catalogue.json':'c41416f9db322ac75d04ffb4a77c9c0439c249dec788223f3ab3a6c94694a5a3'
};
for(const [file,sha]of Object.entries(beforeFiles)){
 const snapshot=bananaAudit.snapshots[file];
 assert.equal(snapshot.sha256,sha);
 assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,snapshot.archive))).digest('hex'),sha);
}
assert.equal(bananaAudit.lectures.length,15);
assert.equal(bananaWorks.length,33);assert.equal(bananaAudit.newRecords,33);
assert.equal(Object.keys(bananaSupplements).length,13);
const old=json(bananaAudit.snapshots['notes/reading-notes/library/catalogue.json'].archive),current=json('notes/reading-notes/library/catalogue.json');
const oldBooks=new Map(old.topics.flatMap(t=>t.books).map(b=>[b.url,b]));
const currentBooks=new Map(current.topics.flatMap(t=>t.books).map(b=>[b.url,b]));
assert.equal(oldBooks.size,576);assert.equal(currentBooks.size,609);
for(const [url,book]of oldBooks){
 const actual={...currentBooks.get(url)};assert(actual.title,'Existing book lost: '+url);
 for(const key of ['discoverySource','discoveryLocator','sourceVerification'])delete actual[key];
 assert.deepEqual(actual,book,'Existing bibliographic facts retained: '+book.title);
}
assert.equal(new Set(bananaWorks.map(b=>b.url)).size,33);
for(const book of bananaWorks){
 assert(!oldBooks.has(book.url),'Duplicate of existing work');
 for(const key of ['author','title','topic','note','prerequisites','use','source','discoverySource','discoveryLocator'])assert(book[key],key);
 assert.equal(book.readingAccess,'Free to read');
 assert(['Direct open PDF','Open online text / archive'].includes(book.access));
 for(const key of ['note','preparation','use','version','accessNote'])assert(book.translation[key],key);
 assert.equal(book.checked,book.verification.checked);
 assert(book.source.startsWith('https://')&&book.url.startsWith('https://'));
 assert(currentBooks.has(book.url));
}
const registry=json('resources/data/stable-ui-ids.json').library;
const beforeRegistry=json('resources/data/library-banana-registry-before.json');
for(const [url,id]of Object.entries(beforeRegistry))assert.equal(registry[url],id,'Existing bookmark or shelf ID');
const rows=json('resources/catalogue-data/library/index.json').records;
for(const book of bananaWorks){
 const row=rows.find(r=>r.id===registry[book.url.replace(/\/$/,'')]);assert(row);
 assert.equal(row.readingUrl,book.url);
 assert.equal(row.readingLabel,book.access==='Direct open PDF'?'Read PDF':'Read online');
 assert(row.search.includes(book.translation.note));
 assert(row.search.includes(book.originalTitle));
 const translated=libraryDictionary[row.summary];
 assert(translated&&/[\u3400-\u9fff]/.test(translated),'Directory excerpt has Chinese text: '+book.title);
 const detail=json(row.detail.split('?')[0].replace(/^\/en\//,''))[row.id];
 assert(!/data-search="[^"]*<span/.test(detail),'Translations must not alter HTML attributes');
 assert(detail.includes(book.source.replaceAll('&','&amp;')));
 assert(detail.includes('target="_blank"'));
 for(const m of detail.matchAll(/<a\b[^>]*href="https?:[^>]*>/g))assert(m[0].includes('noopener noreferrer')&&m[0].includes('target="_blank"'));
}
console.log(JSON.stringify({bananaLectureSeries:15,newWorks:33,reviewedExistingWorks:13,totalWorks:609,existingFactsAndIDsPreserved:true,newPDFsStored:0}));
for(const id of ['real-analysis','linear-algebra','abstract-algebra','point-set-topology','algebraic-topology','probability']){
 const topic=current.topics.find(t=>t.id===id);assert(topic);
 const html=read('notes/reading-notes/library/'+topic.route);
 assert(html.includes('<!-- banana-study:start -->'),'Chinese lecture entrance in '+id);
 assert(html.includes('data-language-content="zh"'),'Chinese reading advice in '+id);
}
