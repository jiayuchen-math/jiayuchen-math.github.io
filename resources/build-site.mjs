import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Deployment only: leave authored notes, original records and their tests intact.
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const destination = path.join(root, '_site');
const extensions = new Set(['.html','.css','.js','.json','.pdf','.tex','.md','.png','.jpg','.jpeg','.svg','.webp','.gif','.ico','.woff','.woff2','.ttf','.otf','.txt','.zip']);
const rewritten = new Set(['.html','.css','.js','.json']);

export function migrateURLs(text) {
  return text
    .replaceAll('https://jiayuchen-math.github.io/en/', 'https://jiayuchen-math.github.io/')
    .replace(/https:\/\/(github\.com|raw\.githubusercontent\.com)\/jiayuchen-math\/en(?=[/#?]|$)/g,
      'https://$1/jiayuchen-math/jiayuchen-math.github.io')
    // Only root-relative strings: never rewrite another site's /en/ language path.
    .replace(/(["'`])\/en(?=\/|["'`?#])/g, '$1');
}

// Compatibility pages contain no copied notes, assets or downloads.
export function legacyRedirectPage(relative) {
  const target='/'+encodeURI(relative.replace(/index\.html$/, ''));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><link rel="canonical" href="https://jiayuchen-math.github.io${target}"><title>Page moved</title><script>location.replace(${JSON.stringify(target)}+location.search+location.hash);</script></head><body><p>This page has moved. <a href="${target}">Continue to the current page</a>.</p></body></html>`;
}

export function notFoundPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found · Jiayu Chen</title><style>:root{color-scheme:light dark}body{max-width:720px;margin:60px auto;padding:0 24px;font:18px/1.8 Georgia,serif}a{color:light-dark(#1458a6,#8ab4f8)}</style></head><body><h1>Page not found</h1><p id="message">The address may have changed.</p><p><a id="current" href="/">Go to the homepage</a></p><script>if(location.pathname.startsWith('/en/')){const target=location.pathname.slice(3)+location.search+location.hash;document.getElementById('current').href=target;document.getElementById('current').textContent='Continue to the current address';document.getElementById('message').textContent='This file has moved.';location.replace(target);}</script></body></html>`;
}

export function publicFiles(directory=root, prefix='') {
  const found=[];
  for (const item of fs.readdirSync(directory,{withFileTypes:true})) {
    if(item.name.startsWith('.') || ['node_modules','_site'].includes(item.name)) continue;
    const relative=prefix+item.name;
    if(item.isSymbolicLink()) throw new Error('Symlink is not a deployable file: '+relative);
    if(item.isDirectory()) {
      if(!prefix && !['notes','resources'].includes(item.name)) continue;
      found.push(...publicFiles(path.join(directory,item.name),relative+'/'));
    } else if(extensions.has(path.extname(item.name).toLowerCase()) &&
      (prefix || ['index.html','disclaimer.html'].includes(item.name))) found.push(relative);
  }
  return found.sort();
}

export function buildSite() {
  // Do not delete directories. Remove stale *files* only inside the fixed output.
  if(fs.existsSync(destination)) {
    const clean=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
      const file=path.join(directory,entry.name);
      if(entry.isSymbolicLink()) throw new Error('Unexpected symlink in deployment output');
      if(entry.isDirectory()) clean(file); else fs.unlinkSync(file);
    }};
    clean(destination);
  }
  const files=publicFiles();
  for(const relative of files) {
    const source=fs.readFileSync(path.join(root,relative));
    let bytes=rewritten.has(path.extname(relative).toLowerCase())
      ? Buffer.from(migrateURLs(source.toString('utf8'))) : source;
    if(relative.endsWith('.html')) {
      const canonical='https://jiayuchen-math.github.io/'+encodeURI(relative.replace(/index\.html$/, ''));
      bytes=Buffer.from(bytes.toString('utf8').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'')
        .replace('</head>',`<link rel="canonical" href="${canonical}"></head>`));
    }
    const target=path.join(destination,relative);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,bytes);
    // Legacy HTML retains a no-JS link; query strings and fragments survive JS redirects.
    // Other old /en/ requests use the small custom 404 instead of duplicated binaries.
    if(relative.endsWith('.html')) {
      const legacy=path.join(destination,'en',relative);
      fs.mkdirSync(path.dirname(legacy),{recursive:true});
      fs.writeFileSync(legacy,legacyRedirectPage(relative));
    }
  }
  fs.writeFileSync(path.join(destination,'404.html'),notFoundPage());
  fs.writeFileSync(path.join(destination,'.nojekyll'),'');
  return {files:files.length,compatibilityPrefix:'/en/',legacyMode:'html redirects and 404 fallback',canonicalBase:'/'};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(buildSite()));
