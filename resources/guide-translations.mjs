import fs from 'node:fs';
import path from 'node:path';
import {decodeHTML} from 'entities';
import {renderArticle,escape as E} from './knowledge-markdown.mjs';
import {subjectTranslations} from './subject-translations.mjs';
import {guides,labels} from './data/translations/guides.mjs';
export {guides as guideTranslations};
export const guideSubjectTitle=(id,original)=>subjectTranslations[id]?.title||original;
export const stripGuideTitle=source=>source.replace(/^# [^\n]+\n+/, '');
export function translatedGuide(guide){
 const entry=guides[guide.id];
 if(!entry?.summary||entry.locators?.length!==guide.references.length)throw Error('Missing guide metadata translation: '+guide.id);
 return {...guide,title:entry.title,summary:entry.summary,references:guide.references.map((r,i)=>({...r,locator:entry.locators[i]}))};
}
export function renderTranslatedGuide(root,id,englishSource){
 const entry=guides[id];if(!entry)throw Error('Missing guide translation: '+id);
 const file=path.join(root,'resources/content/guide-translations-zh',id+'.md');
 const source=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
 const original=renderArticle(stripGuideTitle(englishSource.replaceAll('\r\n','\n'))),result=renderArticle(stripGuideTitle(source));
 const headings=[...original.html.matchAll(/<h([23]) id="([^"]+)">/g)];let index=0;
 result.html=result.html.replace(/<h([23]) id="[^"]+">/g,(_,level)=>{
  const heading=headings[index++];if(!heading||heading[1]!==level)throw Error('Guide translation heading structure: '+id);
  return '<h'+level+' id="'+heading[2]+'">';
 });
 if(index!==headings.length||result.contents.length!==original.contents.length)throw Error('Incomplete guide translation: '+id);
 result.contents=result.contents.map((h,i)=>({...h,id:original.contents[i].id}));
 return result;
}
export function translateGuideLabels(html){
 return html.replace(/>([^<>]+)</g,(_,value)=>{
  const text=decodeHTML(value).trim();let translated=labels[text];
  if(!translated&&/^Editorial guide · Revised \d{4}-\d{2}-\d{2} ·$/.test(text))translated=text.replace('Editorial guide · Revised','编选文章 · 修订日期');
  if(!translated)return '>'+value+'<';
  return '>'+value.replace(value.trim(),E(translated))+'<';
 }).replace(/Checked (\d{4}-\d{2}-\d{2})/g,'核查日期 $1');
}
