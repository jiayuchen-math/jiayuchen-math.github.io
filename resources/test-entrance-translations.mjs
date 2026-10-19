import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{fileURLToPath}from'node:url';
import {categoryTitles,interfaceTitles,translateLearningEntrance,entranceInterfaceBlocks} from './entrance-pages-zh.mjs';
import {goalPaths} from './goal-paths.mjs';import {polishFragment} from './concise-copy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f)),catalogue=json('notes/reading-notes/library/catalogue.json'),context={topics:catalogue.topics,goalPaths,books:catalogue.topics.flatMap(t=>t.books)},coverage=json('resources/data/translation-coverage.json').pages;
const payload=h=>JSON.parse(h.match(/<script type="application\/json" id="page-translations">([\s\S]*?)<\/script>/)[1]),live=h=>h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const hrefs=h=>[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).sort(),ids=h=>[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const files=[...Object.keys(categoryTitles).map(id=>'notes/reading-notes/library/'+id+'.html'),...catalogue.topics.map(t=>'resources/library-paths/'+t.id+'.html'),...Object.keys(interfaceTitles),'notes/mathematical-notes/weekly.html'];assert.equal(files.length,40);
for(const file of files){const html=read(file),p=payload(html),dom=live(html);assert.equal(p.coverage.status,'body-translated',file);assert.equal(p.coverage.reviewed,'2026-10-19');assert(!p.coverage.untranslatedSegments);assert.equal(coverage.find(v=>v.file===file).status,'body-translated');assert.equal(ids(dom).length,new Set(ids(dom)).size,'No duplicate IDs: '+file);assert(!/\u0001COPY|undefined<!--/.test(dom));}
for(const [id,title]of Object.entries(categoryTitles)){
 const html=read('notes/reading-notes/library/'+id+'.html'),p=payload(html),english=html.match(/<div id="entrance-copy">([\s\S]*?)<\/div><script type="application\/json" id="page-translations">/)[1];
 assert.equal(p.blocks['translated-page-title'],title);assert.equal(p.blocks['entrance-copy'],polishFragment(translateLearningEntrance(english,context).html,{library:true}));assert.deepEqual(hrefs(english),hrefs(p.blocks['entrance-copy']));
 assert(!/Find a place to begin|Course guides|Longer routes|Search all related material|Browse or search/.test(p.blocks['entrance-copy']));
 assert.equal([...english.matchAll(/data-resource-count="(\d+)"/g)].map(m=>m[1]).join(','),[...p.blocks['entrance-copy'].matchAll(/data-resource-count="(\d+)"/g)].map(m=>m[1]).join(','));
}
for(const topic of catalogue.topics){
 const file='resources/library-paths/'+topic.id+'.html',h=read(file),p=payload(h);assert(p.blocks['translated-page-title'].endsWith('：先修知识'));assert(!p.blocks['entrance-copy'],'Checkbox nodes must not be replaced on a language switch');
 assert(Object.keys(p.blocks).some(k=>k.startsWith('translated-entrance-text-')));assert(!Object.values(p.blocks).some(v=>/<(?:form|input|select)\b/.test(v)),'Translations only replace text, not interactive controls');
 for(const [id,zh]of Object.entries(p.blocks))if(id.startsWith('translated-entrance-text-')){const raw=h.match(new RegExp('<span id="'+id+'">([\\s\\S]*?)</span>'))?.[1];assert.notEqual(raw,undefined);assert.equal(entranceInterfaceBlocks('<p>'+raw+'</p>',context).untranslated.length,0);assert(/[\u3400-\u9fff]/.test(zh)||zh==='PDF');}
}
const search=read('resources/search/index.html'),sp=payload(search);assert(!sp.blocks['entrance-copy']);assert(search.includes('placeholder="A concept, author, research topic or university"'));assert(!Object.values(sp.blocks).some(v=>/<(?:form|input|select)\b/.test(v)));
for(const option of search.matchAll(/<option\b([^>]*)>/g))assert(/\bvalue=/.test(option[1]),'Search options retain canonical values');
const fixture='<form id="keep"><label>Subject<select><option>Analysis, Measure &amp; PDE</option></select></label><input id="query"></form>',tr=entranceInterfaceBlocks(fixture,context);assert.equal(tr.untranslated.length,0);assert(tr.html.includes('value="Analysis, Measure &amp; PDE"'));assert(!Object.values(tr.blocks).some(v=>v.includes('<input')));
for(const f of ['notes/mathematical-notes/page.html','notes/reading-notes/reading-notes.html'])assert(!payload(read(f)).blocks['entrance-copy'],'Navigation links keep their identity');
const weekly=read('resources/assets/weekly-entrance.js');for(const name of ['MAweek1.pdf','MAweek1.html','Homework1.pdf','week2.pdf','MAweek2.html','Homework2.pdf','LAweek1.pdf','LAweek1.html','LAexercises1.pdf','LAexercises2.pdf'])assert(weekly.includes(name));assert(weekly.includes('interface-language-change'));assert(weekly.includes('第 '));assert(weekly.includes('week<=12'));
console.log(JSON.stringify({translatedEntrances:40,categories:7,prerequisiteReviews:29,otherInterfaces:4,internalAndExternalLinksPreserved:true,canonicalSearchValues:true,interactiveNodesPreserved:true}));
