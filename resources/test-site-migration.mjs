import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {root,destination,publicFiles,migrateURLs,legacyRedirectPage} from './build-site.mjs';

const files=publicFiles();
assert(files.length>1000,'Full public site must be present');
assert.equal(migrateURLs('"/en/resources/"'), '"/resources/"');
assert.equal(migrateURLs('https://example.edu/en/fees'), 'https://example.edu/en/fees');
assert.equal(migrateURLs('https://github.com/jiayuchen-math/en/edit/main/a'),
  'https://github.com/jiayuchen-math/jiayuchen-math.github.io/edit/main/a');
let pdfs=0,html=0;
for(const relative of files) {
  const original=fs.readFileSync(path.join(root,relative));
  const actual=fs.readFileSync(path.join(destination,relative));
  const legacy=path.join(destination,'en',relative);
  if(relative.endsWith('.html')) {
    assert.equal(fs.readFileSync(legacy,'utf8'),legacyRedirectPage(relative),relative+' lightweight redirect');
    assert(fs.statSync(legacy).size<1500,relative+' redirect size');
  } else assert(!fs.existsSync(legacy),relative+' must not be duplicated');
  if(!/\.(html|css|js|json)$/i.test(relative)) assert.deepEqual(actual,original,relative+' protected bytes');
  if(relative.endsWith('.pdf')) pdfs++;
  if(relative.endsWith('.html')) {
    html++;
    const text=actual.toString('utf8');
    assert(!/(?:href|src|action|data-base|data-index)=["']\/en\//.test(text),relative+' old root-relative link');
    assert(!text.includes('https://github.com/jiayuchen-math/en/'),relative+' old GitHub edit link');
  }
}
assert(pdfs>0);
const home=fs.readFileSync(path.join(destination,'index.html'),'utf8');
assert(home.includes('href="/resources/'));
assert(!/<h2[^>]*>Education<\/h2>/.test(home));
assert(!home.includes('jiayuchen-math.github.io/zh'));
const search=fs.readFileSync(path.join(destination,'resources/assets/unified-search.js'),'utf8');
assert(search.includes("'/resources/search/manifest.json'"));
const weekly=fs.readFileSync(path.join(destination,'resources/assets/weekly-entrance.js'),'utf8');
assert(weekly.includes('"/notes/mathematical-notes/"'));
// Validate actual local targets across the entire deployment, including legacy paths.
const missing=[];
for(const relative of files.filter(f=>f.endsWith('.html'))) {
  const text=fs.readFileSync(path.join(destination,relative),'utf8');
  for(const match of text.matchAll(/(?:href|src|action|data-base|data-index)=["']([^"']+)["']/g)) {
    const value=match[1].replaceAll('&amp;','&');
    if(!value.startsWith('/') || value.startsWith('//')) continue;
    const url=new URL(value,'https://jiayuchen-math.github.io');
    let name=decodeURIComponent(url.pathname).slice(1);
    if(!name || name.endsWith('/')) name+='index.html';
    const target=path.join(destination,name);
    if(!fs.existsSync(target)) missing.push({from:relative,to:name});
  }
}
assert.deepEqual(missing,[],'Internal deployed links');

function runRedirect(html,pathname,search,hash) {
  let replaced;
  const nodes={current:{},message:{}};
  const location={pathname,search,hash,replace:target=>{replaced=target;}};
  for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    vm.runInNewContext(script[1],{location,document:{getElementById:id=>nodes[id]}});
  }
  return {replaced,nodes};
}
assert.equal(runRedirect(legacyRedirectPage('resources/index.html'),'/en/resources/','?lang=zh','#reading').replaced,
  '/resources/?lang=zh#reading');
assert.equal(runRedirect(legacyRedirectPage('notes/mathematical notes/page.html'),'/en/notes/mathematical%20notes/page.html','?lang=zh','#courses').replaced,
  '/notes/mathematical%20notes/page.html?lang=zh#courses');
const fallback=fs.readFileSync(path.join(destination,'404.html'),'utf8');
assert.equal(runRedirect(fallback,'/en/notes/mathematical-notes/linear-algebra/LAexercises5.pdf','?download=1','#page=2').replaced,
  '/notes/mathematical-notes/linear-algebra/LAexercises5.pdf?download=1#page=2');
assert.equal(runRedirect(fallback,'/missing.pdf','','').replaced,undefined,'No root redirect loop');
const allOutput=[];
function collect(directory){for(const item of fs.readdirSync(directory,{withFileTypes:true})){
  const name=path.join(directory,item.name);if(item.isDirectory())collect(name);else allOutput.push(name);
}}
collect(destination);
const legacyFiles=allOutput.filter(name=>path.relative(destination,name).split(path.sep)[0]==='en');
assert.equal(legacyFiles.length,html,'Only HTML compatibility pages');
assert(legacyFiles.every(name=>name.endsWith('.html')));
const size=allOutput.reduce((sum,name)=>sum+fs.statSync(name).size,0);
const legacySize=legacyFiles.reduce((sum,name)=>sum+fs.statSync(name).size,0);
console.log(JSON.stringify({passed:true,files:files.length,html,pdfs,oldURLs:'HTML redirects; binary browser redirects via custom 404',source:'unchanged',publishedBytes:size,legacyBytes:legacySize}));
