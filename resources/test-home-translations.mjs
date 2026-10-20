import fs from 'node:fs';
import assert from 'node:assert/strict';
import {homeTranslationBlocks} from './home-translations.mjs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/<script type="application\/json" id="page-translations">([\s\S]*?)<\/script>/)?.[1]||'null');
assert.deepEqual(data?.blocks,homeTranslationBlocks(html));
assert(!Object.hasOwn(data.blocks,'home-tagline'),'Removed tagline must not remain in translations');
assert(data.blocks.about.includes('香港中文大学（深圳）'));assert(data.blocks.about.includes('代数几何'));assert(data.blocks.about.includes('学习笔记'));
const matches=(s,re)=>[...s.matchAll(re)].map(m=>m[1]);
for(const id of ['about','notes','contact']){
 const original=html.match(new RegExp('<section id="'+id+'">([\\s\\S]*?)</section>'))[1];
 assert.deepEqual(matches(data.blocks[id],/href="([^"]+)"/g),matches(original,/href="([^"]+)"/g),id+' identical link destinations');
 assert.equal(matches(html,new RegExp('id="('+id+')"','g')).length,1,'Single live section');
 assert.equal(matches(data.blocks[id],/(<p\b)/g).length,matches(original,/(<p\b)/g).length,'Every paragraph retained');
}
assert.equal(matches(html,/id="(home-tagline)"/g).length,0);assert.equal(matches(html,/id="(page-translations)"/g).length,1);
assert(!html.includes('Undergraduate mathematics student'),'Removed homepage tagline');
assert(html.includes('<h1>Jiayu Chen</h1>'),'Do not invent a Chinese personal name');
assert(!html.includes('<h2>Education</h2>'));assert(!data.blocks.contact.includes('/zh'));assert(data.blocks.contact.includes('CUHKSZ MathPi'));
assert.throws(()=>homeTranslationBlocks(html.replace('This website brings together','A changed introduction brings together')),/needs translation review/);
console.log(JSON.stringify({homeTranslated:true,sections:3,englishAndAllLinksRetained:true,oneLanguageControl:true}));
