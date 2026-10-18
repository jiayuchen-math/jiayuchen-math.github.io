import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createLearningTools} from './learning-tools.mjs';
import {
  SHELF_KEY, COMPARE_KEY, MAX_IMPORT_BYTES, MAX_ITEMS, PAGE_SIZE,
  isShelfEntry, normalizeEntries, normalizePrograms, entryKey, parseShelf,
  validateShelf, mergeShelves, addShelfItem, readShelf, writeShelf,
  normalizeSelection, addComparison, readComparison, selectionFromURL,
  selectionURL, searchPage, safeURL, initLearningTools,
} from './assets/learning-tools.js';

const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
// Fixtures are snapshots of repository evidence, not assertions of live facts.
const library = json('./search/index/library.json');
const guides = json('./search/index/guides.json');
const notes = json('./search/index/notes.json');
const encyclopedia = json('./search/index/encyclopedia.json');
const programRecords = json('./data/programs.json');
const learning = [...library, ...encyclopedia, ...notes, ...guides];
const entry = library[0];
const empty = () => ({version:1, items:[]});
const item = (overrides = {}) => ({type:entry.type, id:entry.id, status:'plan', position:'', ...overrides});
const shelf = (...items) => ({version:1, items});
function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {reads:0, writes:0, getItem(key) { this.reads++; return map.get(key) ?? null; }, setItem(key, value) { this.writes++; map.set(key, value); }, map};
}

test('generator is pure, returns the two pages, assets and bounded learning registries', () => {
  const before = JSON.stringify({learning, programRecords});
  const output = createLearningTools({learningEntries:learning, programs:programRecords});
  assert.equal(JSON.stringify({learning, programRecords}), before);
  assert.deepEqual(output.pages.map(p => p.file), ['resources/bookshelf/index.html', 'resources/study-careers/compare/index.html']);
  assert.deepEqual(output.files.map(f => f.file), [
    'resources/catalogue-data/learning-tools/entries.json', 'resources/catalogue-data/learning-tools/programs.json',
    'resources/assets/learning-tools.js', 'resources/assets/learning-tools.css',
  ]);
  const entries = JSON.parse(output.files[0].content), programs = JSON.parse(output.files[1].content);
  assert(entries.length > 500);
  assert.equal(programs.length, programRecords.length);
  assert.equal(new Set(entries.map(entryKey)).size, entries.length);
  assert(entries.every(isShelfEntry));
  assert(!entries.some(e => ['programs','researchers'].includes(e.type)));
  assert(entries.filter(e => e.type === 'guides').every(e => /^\/en\/resources\/(?:library-paths|topics)\//.test(e.url)));
  assert.equal(entries.filter(e => e.type === 'guides' && e.url.startsWith('/en/resources/topics/')).length,1,'Only the verified algebraic geometry topic is added');
  for (const e of entries) assert(Object.keys(e).every(key => ['id','type','title','url','summary','area','readingUrl'].includes(key)));
  for (const p of output.pages) {
    assert.deepEqual(p.scripts, [{src:'/en/resources/assets/learning-tools.js', type:'module'}]);
    assert.match(p.head, /\/en\/resources\/assets\/learning-tools.css/);
    assert.match(p.body, /data-learning-ui hidden/);
    assert.match(p.body, /data-learning-fallback/);
    assert.match(p.body, /<details class="learning-settings">/);
    assert(!p.body.includes('Confirm fees'));
  }
  for (const href of ['/en/notes/reading-notes/library/catalogue.html','/en/resources/encyclopedia/','/en/notes/','/en/resources/library-paths/']) assert(output.pages[0].body.includes(href));
  assert(output.pages[1].body.includes(programRecords[0].sources[0].url.replaceAll('&','&amp;')));
  assert.match(output.pages[1].body, /target="_blank" rel="noopener noreferrer"/);
  assert.throws(() => createLearningTools({learningEntries:{}}), TypeError);
});

test('only learning-path guide URLs are eligible, including short guides and prerequisite reviews', () => {
  const route = guides.find(e => e.url.includes('/library-paths/'));
  assert(route);
  assert(isShelfEntry(route));
  for (const url of ['/en/resources/library-paths/routes/algebraic-geometry.html','/en/resources/library-paths/guides/reading.html','/resources/library-paths/reviews/proofs.html']) assert(isShelfEntry({...route,url}));
  for (const url of ['/en/resources/study-careers/guides.html','/en/resources/links/study-advice.html','/en/resources/encyclopedia/paths.html','https://example.org/en/resources/library-paths/','//example.org/library-paths/','/en/resources/library-paths/../study-careers/guides.html','/en/resources/library-paths/%2e%2e/study-careers/guides.html']) assert(!isShelfEntry({...route,url}));
  assert(!isShelfEntry({...entry,type:'programs'}));
  assert(!isShelfEntry({...entry,type:'researchers'}));
  const differentType = {...entry,type:'encyclopedia'};
  assert.equal(normalizeEntries([entry,entry,differentType]).length,2);
});

test('shelf import validates all entries atomically, strips extra data and preserves unknown IDs', () => {
  const missing = item({id:'retired-catalogue-id', status:'reading',position:'Chapter 4, page 32', applicationAnswers:'discard'});
  const parsed = parseShelf(JSON.stringify(shelf(item(), missing, item())));
  assert.equal(parsed.items.length,2);
  assert.deepEqual(parsed.items[1], {type:'library',id:'retired-catalogue-id',status:'reading',position:'Chapter 4, page 32'});
  assert(!JSON.stringify(parsed).includes('applicationAnswers'));
  assert.equal(parsed.items[1].position,'Chapter 4, page 32');
  for (const bad of [null, [], {}, {version:2,items:[]}, shelf(item({status:'done'})), shelf(item({type:'programs'})), shelf(item({id:'../unsafe'})), shelf(item({position:99})), shelf(item({position:'x'.repeat(501)})), shelf(item(),null)]) assert.throws(() => validateShelf(bad));
  assert.throws(() => parseShelf('{broken'));
  assert.throws(() => parseShelf(' '.repeat(MAX_IMPORT_BYTES + 1)));
  assert.throws(() => parseShelf('界'.repeat(Math.ceil(MAX_IMPORT_BYTES / 3))));
  assert.throws(() => validateShelf(shelf(...Array.from({length:MAX_ITEMS+1}, () => item()))));
  const dangerousText = '<img src=x onerror=alert(1)>';
  assert.equal(validateShelf(shelf(item({position:dangerousText}))).items[0].position,dangerousText);
});

test('stable type + ID merge keeps existing progress and respects the combined limit', () => {
  const existing = shelf(item({status:'finished',position:'Appendix B'}));
  const merged = mergeShelves(existing,shelf(item({status:'plan'}),item({type:'notes'}),item({id:'missing-from-current-registry'})));
  assert.equal(merged.items.length,3);
  assert.equal(merged.items[0].position,'Appendix B');
  assert.equal(merged.items[0].status,'finished');
  assert.deepEqual(addShelfItem(existing,entry),existing);
  assert.equal(existing.items.length,1);
  assert.throws(() => addShelfItem(existing,{...entry,type:'researchers'}));
  const full = shelf(...Array.from({length:MAX_ITEMS},(_,i)=>item({id:`missing-${i}`})));
  assert.throws(() => mergeShelves(full,shelf(item())));
});

test('a full exported shelf with maximally escaped positions remains importable', () => {
  const full=shelf(...Array.from({length:MAX_ITEMS},(_,i)=>item({id:`entry-${i}-`+'a'.repeat(180),position:'\u0000'.repeat(500)})));
  const exported=JSON.stringify(validateShelf(full),null,2);
  assert(new TextEncoder().encode(exported).length<=MAX_IMPORT_BYTES);
  assert.deepEqual(parseShelf(exported),full);
});

test('denied, malformed, unknown-version and quota storage never throw or overwrite on read', () => {
  const storage = memoryStorage();
  assert.deepEqual(readShelf(storage).shelf,empty());
  assert(writeShelf(storage,shelf(item())));
  assert.deepEqual(readShelf(storage).shelf,shelf(item()));
  for (const value of ['{bad','null',JSON.stringify({version:99,items:[]})]) {
    const damaged = memoryStorage({[SHELF_KEY]:value});
    const result = readShelf(damaged);
    assert.equal(result.writable,false);
    assert.equal(damaged.writes,0);
    assert.equal(damaged.map.get(SHELF_KEY),value);
    assert(result.warning.includes('not been replaced'));
  }
  const denied = {getItem(){throw new Error('denied')}, setItem(){throw new Error('quota')}};
  assert.equal(readShelf(denied).writable,false);
  assert.equal(writeShelf(denied,shelf(item())),false);
  assert.equal(writeShelf(storage,shelf(item({type:'programs'}))),false);
  assert.equal(readComparison(denied).writable,false);
  assert.equal(readComparison(memoryStorage({[COMPARE_KEY]:'{bad'})).writable,false);
});

test('comparison is deduplicated, capped at three and can round-trip readable URL IDs', () => {
  const ids = programRecords.slice(0,4).map(p=>p.id);
  assert.deepEqual(addComparison(ids.slice(0,3),ids[0]),ids.slice(0,3));
  assert.throws(() => addComparison(ids.slice(0,3),ids[3]), /three/);
  assert.throws(() => normalizeSelection(['bad id']));
  const url = selectionURL('https://example.org/resources/study-careers/compare/?view=table#selected',ids.slice(0,3));
  assert.deepEqual(selectionFromURL(url),ids.slice(0,3));
  assert.equal(new URL(url).searchParams.get('view'),'table');
  assert.equal(new URL(url).hash,'#selected');
  assert.equal(selectionFromURL('https://example.org/resources/study-careers/compare/'),null);
  assert.throws(() => selectionFromURL('https://example.org/?'+ids.map(id=>'program='+id).join('&')));
  assert.deepEqual(readComparison(memoryStorage({[COMPARE_KEY]:JSON.stringify({version:1,ids:[ids[0],'retired-program']})})).ids,[ids[0],'retired-program']);
});

test('real program evidence retains exact historical wording, status, field sources and unknowns', () => {
  const original = programRecords.find(p => p.audit?.fields?.tuition?.status === 'Historical');
  assert(original,'Expected repository historical-fee evidence fixture');
  const [record] = normalizePrograms([original]);
  for (const field of ['title','institution','degree','country','duration','language','preparation','selection','application','tuition','fundingDetail','cycle','checked','admissionsAuditStatus']) assert.equal(record[field],original[field]);
  assert.equal(record.audit.fields.tuition.status,'Historical');
  assert.equal(record.audit.fields.tuition.source,original.audit.fields.tuition.source);
  assert.equal(record.audit.fields.cycle.status,original.audit.fields.cycle.status);
  assert.equal(record.evidence[0].text,original.evidence[0].text);
  assert.equal(record.sources[0].label,original.sources[0].label);
  const [unknown] = normalizePrograms([{id:original.id,title:original.title}]);
  assert.equal(unknown.tuition,'');
  assert.deepEqual(unknown.sources,[]);
});

test('search defaults to 25 results and matches learning subjects and program countries', () => {
  assert.equal(PAGE_SIZE,25);
  assert.equal(searchPage(library).items.length,25);
  assert.equal(searchPage(library,{page:2}).items[0].id,library[25].id);
  assert.equal(searchPage(library,{query:'no-such-title-a9cf'}).total,0);
  const found = searchPage(learning,{query:notes[0].title,type:'notes'});
  assert(found.items.some(e=>e.id===notes[0].id));
  assert(searchPage(programRecords,{query:programRecords[0].country}).total>0);
  assert.equal(searchPage([], {page:999}).page,1);
  assert.equal(searchPage(library,{size:-5}).items.length,1);
});

test('links reject executable URLs and generator escapes text and attribute injection', () => {
  for (const value of ['javascript:alert(1)','data:text/html,bad','//evil.example/x','/..//evil.example/x','/\\evil.example/x','https://user:pass@example.org','https://example.org/\nattack']) assert.equal(safeURL(value),'');
  assert.equal(safeURL('https://example.org/book.pdf'),'https://example.org/book.pdf');
  const dangerous = {...programRecords[0],title:'<img src=x onerror=alert(1)>',url:'javascript:alert(1)'};
  const {pages} = createLearningTools({programs:[dangerous]});
  assert(!pages[1].body.includes('<img'));
  assert(!pages[1].body.includes('javascript:'));
  assert(pages[1].body.includes('&lt;img'));
});

// Minimal DOM double: enough for exercising actual shared handlers and tool
// renderers without a browser dependency or touching any generated files.
class Node {
  constructor(tag, doc) { this.tagName=tag.toUpperCase(); this.nodeType=1; this.doc=doc; this.attributes=new Map(); this.children=[]; this.parentNode=null; this.dataset={}; this.events=new Map(); this.hidden=false; this.disabled=false; this.value=''; this._text=''; }
  set textContent(text) { this._text=String(text); this.children=[]; }
  get textContent() { return this._text+this.children.map(n=>typeof n==='string'?n:n.textContent).join(''); }
  set innerHTML(_) { throw new Error('Unsafe HTML rendering attempted'); }
  setAttribute(key,value) { this.attributes.set(key,String(value)); if(key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value); }
  hasAttribute(key) { return this.attributes.has(key); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  append(...nodes) { for(const n of nodes) { if(typeof n!=='string')n.parentNode=this; this.children.push(n); } }
  replaceChildren(...nodes) { this.children=[]; this._text=''; this.append(...nodes); }
  matches(selector) { return selector.split(',').some(part=>{
    const s=part.trim(); if(s.startsWith('#'))return this.getAttribute('id')===s.slice(1);
    const attr=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if(attr)return this.hasAttribute(attr[1])&&(attr[2]===undefined||this.getAttribute(attr[1])===attr[2]);
    return this.tagName.toLowerCase()===s;
  }); }
  closest(selector) { return this.matches(selector)?this:this.parentNode?.closest(selector)||null; }
  querySelectorAll(selector) { return this.children.flatMap(n=>typeof n==='string'?[]:[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0]||null; }
  addEventListener(type,fn) { const all=this.events.get(type)||[]; all.push(fn); this.events.set(type,all); }
  async fire(type,event={}) { for(const fn of this.events.get(type)||[])await fn({target:this,currentTarget:this,preventDefault(){},...event}); }
  focus() { this.doc.activeElement=this; }
  select() { this.selected=true; }
  remove() { if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this); }
  click() { return this.fire('click'); }
}
function browser(mode, {local=memoryStorage(),session=memoryStorage(),href='https://example.org/en/resources/study-careers/compare/'}={}) {
  const doc = {events:new Map(), activeElement:null};
  doc.createElement=tag=>new Node(tag,doc); doc.body=doc.createElement('body');
  doc.querySelector=s=>doc.body.querySelector(s); doc.querySelectorAll=s=>doc.body.querySelectorAll(s);
  doc.addEventListener=(type,fn)=>{const all=doc.events.get(type)||[];all.push(fn);doc.events.set(type,all);};
  doc.fire=async(type,event)=>{for(const fn of doc.events.get(type)||[])await fn(event);};
  const make=(tag,attrs={},parent=doc.body)=>{const node=doc.createElement(tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);parent.append(node);return node;};
  let root;
  if(mode) {
    root=make('div',{'data-learning-tool':mode});
    const ui=make('div',{'data-learning-ui':''},root);ui.hidden=true;
    make('p',{'data-tool-message':''},ui);
    make('h2',{id:mode==='shelf'?'shelf-heading':'comparison-heading'},ui);
    for(const attr of mode==='shelf'?['data-shelf-export','data-shelf-import','data-shelf-clear','data-shelf-items']:['data-compare-clear','data-compare-link','data-compare-share','data-comparison'])make(attr.includes('items')||attr.includes('share')||attr==='data-comparison'?'div':'button',{[attr]:''},ui);
    const form=make('form',{'data-learning-search':''},ui);form.elements={q:{value:''},type:{value:''}};
    for(const attr of ['data-learning-count','data-learning-results','data-learning-prev','data-learning-next','data-learning-page'])make('div',{[attr]:''},ui);
    make('div',{'data-learning-fallback':''},root);
  }
  const win={localStorage:local,sessionStorage:session,events:new Map(),fetches:[],observers:[],setTimeout:fn=>{queueMicrotask(fn);return 0;},confirm:()=>true,location:{href},history:{replaceState(_a,_b,url){win.location.href=url;}}};
  win.addEventListener=(type,fn)=>win.events.set(type,fn);
  win.MutationObserver=class {constructor(fn){this.fn=fn;win.observers.push(this);}observe(){}};
  win.fetch=async url=>{win.fetches.push(url);return{ok:true,json:async()=>url.includes('entries.json')?learning:programRecords};};
  return {doc,win,root,make,local,session};
}
const settle = async () => { for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve)); };

test('ordinary pages reveal late controls with zero preloads and no duplicate initialization', async () => {
  const b=browser();
  const first=b.make('button',{'data-save-learning':'','data-learning-id':entry.id,'data-learning-type':entry.type});first.hidden=true;
  initLearningTools(b.doc,b.win);
  initLearningTools(b.doc,b.win);
  assert.equal(first.hidden,false);
  assert.equal(b.win.fetches.length,0);
  assert.equal(b.local.reads,0);assert.equal(b.session.reads,0);
  assert.equal(b.win.observers.length,1);
  assert.equal(b.doc.events.get('click').length,1);
  const late=b.make('button',{'data-compare-program':'','data-program-id':programRecords[0].id});late.hidden=true;
  b.win.observers[0].fn([{addedNodes:[late]}]); await settle();
  assert.equal(late.hidden,false);assert.equal(b.win.fetches.length,0);
  await b.doc.fire('click',{target:first});await settle();
  assert.equal(b.win.fetches.length,1);assert.match(b.win.fetches[0],/learning-tools\/entries.json$/);
  assert.equal(readShelf(b.local).shelf.items[0].id,entry.id);
  assert.equal(first.getAttribute('aria-pressed'),'true');
  await b.doc.fire('click',{target:first});await settle();
  assert.equal(b.win.fetches.length,1);assert.equal(readShelf(b.local).shelf.items.length,1);
  await b.doc.fire('click',{target:late});await settle();
  assert.equal(b.win.fetches.length,2);
  assert.deepEqual(readComparison(b.session).ids,[programRecords[0].id]);
  assert.equal(b.doc.querySelectorAll('[role="status"]').length,1);
});

test('explicit refresh reveals directory controls without loading registries', async () => {
  const b=browser();initLearningTools(b.doc,b.win);
  const late=b.make('button',{'data-save-learning':'','data-learning-type':'guides','data-learning-id':'guide-existing-digest'});late.hidden=true;
  await b.doc.fire('learning-tools:refresh',{});
  assert.equal(late.hidden,false);assert.equal(b.win.fetches.length,0);
  const invalid=b.make('button',{'data-save-learning':'','data-learning-type':'programs','data-learning-id':programRecords[0].id});
  await b.doc.fire('learning-tools:refresh',{});assert.equal(invalid.hidden,true);
});

test('shelf renders imported text safely, retains missing IDs, changes status/position, removes with focus', async () => {
  const text='<img src=x onerror=alert(1)>';
  const b=browser('shelf',{local:memoryStorage({[SHELF_KEY]:JSON.stringify(shelf(item({position:text}),item({id:'missing-resource'})))})});
  initLearningTools(b.doc,b.win);await settle();
  assert.equal(b.root.querySelector('[data-learning-ui]').hidden,false);
  assert.equal(b.win.fetches.length,1);assert.match(b.win.fetches[0],/entries.json$/);
  assert.equal(b.root.querySelectorAll('[data-save-learning]').length,25);
  assert.equal(b.root.querySelectorAll('[data-shelf-key]').length,2);
  const position=b.root.querySelector('[data-field="position"]');assert.equal(position.value,text);
  assert(b.root.textContent.includes('missing-resource'));
  const status=b.root.querySelector('[data-field="status"]');status.value='finished';await status.fire('change');
  position.value='Chapter 3';await position.fire('change');await settle();
  assert.equal(readShelf(b.local).shelf.items[0].status,'finished');
  assert.equal(readShelf(b.local).shelf.items[0].position,'Chapter 3');
  const remove=b.root.querySelector('[data-field="remove"]');await remove.fire('click');await settle();
  assert.equal(readShelf(b.local).shelf.items.length,1);
  assert.equal(b.doc.activeElement.getAttribute('data-field'),'remove');
});

test('comparison renders real field statuses, missing programs and unknown values; uses session only', async () => {
  const p=programRecords.find(p=>p.audit?.fields?.tuition?.status==='Historical');
  const b=browser('compare',{href:selectionURL('https://example.org/en/resources/study-careers/compare/',[p.id,'missing-program'])});
  initLearningTools(b.doc,b.win);await settle();
  assert.equal(b.root.querySelector('[data-learning-ui]').hidden,false);
  const table=b.root.querySelector('[data-comparison]');
  assert(table.textContent.includes(p.tuition));
  assert(table.textContent.includes('Evidence status: Historical'));
  assert(table.textContent.includes('Unknown / not recorded'));
  assert(table.textContent.includes('missing-program'));
  assert.equal(b.local.reads,0);assert.equal(b.local.writes,0);
  assert.deepEqual(readComparison(b.session).ids,[p.id,'missing-program']);
  await b.root.querySelector('[data-remove-program]').fire('click');await settle();
  assert.deepEqual(selectionFromURL(b.win.location.href),['missing-program']);
  assert.equal(b.doc.activeElement.getAttribute('data-remove-program'),'missing-program');
});

test('load failures keep fallbacks visible and retry, while damaged stored data stays intact', async () => {
  const local=memoryStorage({[SHELF_KEY]:'broken-json'}),b=browser('shelf',{local});
  const fetch=b.win.fetch;b.win.fetch=async()=>({ok:false});
  initLearningTools(b.doc,b.win);await settle();
  assert.equal(b.root.querySelector('[data-learning-ui]').hidden,true);
  assert.equal(b.root.querySelector('[data-learning-fallback]').hidden,false);
  const retry=b.root.querySelector('[data-learning-fallback]').querySelector('button');assert(retry);
  b.win.fetch=fetch;await retry.fire('click');await settle();
  assert.equal(b.root.querySelector('[data-learning-ui]').hidden,false);
  const save=b.root.querySelector('[data-save-learning]');await b.doc.fire('click',{target:save});await settle();
  assert.equal(local.map.get(SHELF_KEY),'broken-json');
  assert.equal(local.writes,0);
  assert(b.root.querySelector('[data-tool-message]').textContent.includes('not been replaced'));
  await b.root.querySelector('[data-shelf-clear]').fire('click');await settle();
  assert.deepEqual(readShelf(local).shelf,empty());
});

test('file imports enforce byte limits before reading and merge valid progress without destructive failures', async () => {
  const b=browser('shelf',{local:memoryStorage({[SHELF_KEY]:JSON.stringify(shelf(item({status:'finished'})))})});
  initLearningTools(b.doc,b.win);await settle();
  const input=b.root.querySelector('[data-shelf-import]');let read=false;
  input.files=[{size:MAX_IMPORT_BYTES+1,text:async()=>{read=true;return '{}';}}];
  await input.fire('change');await settle();assert.equal(read,false);
  assert.equal(readShelf(b.local).shelf.items[0].status,'finished');
  input.files=[{size:10,text:async()=>'{broken'}];await input.fire('change');await settle();
  assert.equal(readShelf(b.local).shelf.items.length,1);
  const incoming=JSON.stringify(shelf(item({status:'plan'}),item({id:'missing-import-id',position:'Section 5'})));
  input.files=[{size:incoming.length,text:async()=>incoming}];await input.fire('change');await settle();
  assert.equal(readShelf(b.local).shelf.items.length,2);
  assert.equal(readShelf(b.local).shelf.items[0].status,'finished');
  assert.equal(readShelf(b.local).shelf.items[1].id,'missing-import-id');
  assert.equal(b.doc.activeElement,input);
});

test('finishing a position edit preserves another tab’s added entries and changed status', async () => {
  const b=browser('shelf',{local:memoryStorage({[SHELF_KEY]:JSON.stringify(shelf(item()))})});
  initLearningTools(b.doc,b.win);await settle();
  const position=b.root.querySelector('[data-field="position"]');position.focus();position.value='Page 17';
  b.local.setItem(SHELF_KEY,JSON.stringify(shelf(item({status:'reading'}),item({id:'added-in-other-tab'}))));
  b.win.events.get('storage')({key:SHELF_KEY});await settle();
  await position.fire('change');await b.doc.fire('focusout',{target:position});await settle();
  const saved=readShelf(b.local).shelf;
  assert.equal(saved.items.length,2);
  assert.equal(saved.items[0].status,'reading');assert.equal(saved.items[0].position,'Page 17');
});

test('denied storage getters and quota writes leave the tools usable in memory', async () => {
  const b=browser('shelf');Object.defineProperty(b.win,'localStorage',{get(){throw new Error('denied');}});
  initLearningTools(b.doc,b.win);await settle();
  await b.doc.fire('click',{target:b.root.querySelector('[data-save-learning]')});await settle();
  assert.equal(b.root.querySelectorAll('[data-shelf-key]').length,1);
  assert(b.root.querySelector('[data-tool-message]').textContent.includes('memory'));
  const quota=memoryStorage();quota.setItem=()=>{throw new Error('quota');};
  const q=browser('shelf',{local:quota});initLearningTools(q.doc,q.win);await settle();
  await q.doc.fire('click',{target:q.root.querySelector('[data-save-learning]')});await settle();
  assert.equal(q.root.querySelectorAll('[data-shelf-key]').length,1);
  assert(q.root.querySelector('[data-tool-message]').textContent.includes('full'));
});
