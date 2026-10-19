import fs from 'node:fs';
import path from 'node:path';
import {decodeHTML} from 'entities';
import {createHash} from 'node:crypto';
import {libraryZhCommon} from './library-zh-common.mjs';
import {conciseText} from './concise-copy.mjs';
const escape=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
export function libraryTranslationSource(book){return Object.fromEntries(['title','author','url','note','prerequisites','use','version','accessNote','archiveNote','freeVersion','level','kind','language','access','readingAccess'].map(k=>[k,book[k]||'']));}
export const librarySourceHash=book=>createHash('sha256').update(JSON.stringify(libraryTranslationSource(book))).digest('hex');
export function createLibraryTranslations(root,books,registry){
 const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
 const data=read('resources/data/library-zh-undergraduate.json'),review=read('resources/data/library-zh-sources.json');
 const selected=books.filter(b=>data.entries[registry[b.url.replace(/\/$/,'')]]);
 if(selected.length!==49||Object.keys(data.entries).length!==49)throw Error('Expected 49 distinct reviewed library translations');
 const dictionary={...libraryZhCommon},records={};
 for(const b of selected){
  const id=registry[b.url.replace(/\/$/,'')],zh=data.entries[id];
  if(review[id]!==librarySourceHash(b))throw Error('English source changed; review library translation: '+id);
  const prep=(/^Editorial preparation(?: guide)?:/.test(b.prerequisites)?'编选建议：':'')+zh.preparation;
  dictionary[b.note]=zh.note;dictionary[b.prerequisites]=prep;
  const concisePreparation=conciseText('Preparation: '+b.prerequisites).replace(/^Preparation: /,'');
  if(concisePreparation)dictionary[concisePreparation]=prep.replace(/^编选建议：/,'');
  records[id]={url:b.url,note:zh.note,preparation:prep};
  for(const key of ['use','version','accessNote','archiveNote','freeVersion'])if(b[key]&&!/^\d+$/.test(b[key])&&!dictionary[b[key]])throw Error('Missing Chinese library field '+id+' '+key+': '+b[key]);
 }
 for(const [english,chinese] of Object.entries({...dictionary})){const shortEnglish=conciseText(english),shortChinese=conciseText(chinese);if(shortEnglish&&shortEnglish!==english)dictionary[shortEnglish]=shortChinese;}
 const translate=value=>{
  if(dictionary[value])return dictionary[value];
  if(/^Further print reading \(\d+ retained references\)$/.test(value))return '纸质书参考（保留 '+value.match(/\d+/)[0]+' 项）';
  const parts=value.split(' · ');if(parts.length>1)return parts.map(p=>translate(p)).join(' · ');
  for(const [prefix,zh] of [['Preparation: ','先修：'],['Use: ','用途：'],['Access: ','获取方式：'],['Version: ','版本：'],['Free edition: ','免费版本：'],['Checked ','原核查：'],['Legacy entry retained from ','保留的旧条目，原记录日期：'],['Original title: ','原文题名：']])if(value.startsWith(prefix))return zh+translate(value.slice(prefix.length));
  return value;
 };
 // Text nodes only: never translate a title, URL, id or mathematical markup.
 const html=input=>{
  const stack=[];return input.replace(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g,token=>{
   if(token.startsWith('<!--'))return token;
   if(token.startsWith('<')){const closing=token.match(/^<\/([\w-]+)/),opening=token.match(/^<([\w-]+)/);if(closing){const i=stack.lastIndexOf(closing[1].toLowerCase());if(i>=0)stack.splice(i);}else if(opening&&!/\/>$/.test(token)&&!/^<(?:br|hr|img|input|meta|link)\b/i.test(token))stack.push(opening[1].toLowerCase());return token;}
   if(stack.some(t=>['script','style','code','pre'].includes(t))||(stack.includes('article')&&stack.some(t=>['h2','h3'].includes(t))))return token;
   const decoded=decodeHTML(token),trimmed=decoded.trim(),translated=translate(trimmed);
   return translated===trimmed?token:escape(decoded.slice(0,decoded.indexOf(trimmed))+translated+decoded.slice(decoded.indexOf(trimmed)+trimmed.length));
  });
 };
 return {scope:data.scope,records,dictionary,translate,html};
}
