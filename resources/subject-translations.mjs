import foundations from './data/translations/subjects-foundations.mjs';
import algebra from './data/translations/subjects-algebra.mjs';
import analysis from './data/translations/subjects-analysis.mjs';
import geometry from './data/translations/subjects-geometry.mjs';
import numberTheory from './data/translations/subjects-number-theory.mjs';
import discrete from './data/translations/subjects-discrete.mjs';
import {zh} from './assets/locale-data.js';
import {figures,descriptions,figureLabels} from './data/translations/subject-figures.mjs';
import {markdown,escape as E} from './knowledge-markdown.mjs';

// Text-only overlays; source facts and stable IDs always come from English.
export const subjectTranslations={...foundations,...algebra,...analysis,...geometry,...numberTheory,...discrete};
const sharedAccess={'Complete public PDF.':'公开的完整 PDF。','Complete public HTML text.':'公开的完整 HTML 教材。'};
const labels={...zh,
 'What to work on':'学习内容','A starting text':'起步读物','Start here':'从这里开始',
 'Choose a text':'选择读物','Check your understanding':'自测','Continue':'继续学习',
 'Full reading list':'完整书目','Other ways into the subject':'其他起步读物',
 'Try these before moving on':'继续之前，先试试这些题','A hint':'提示','Work through the solution':'查看解答',
 'Try a proof or calculation before opening the hint. These solutions address the checks below, not the exercises in the linked textbooks.':'打开提示前，先尝试证明或计算。这里的解答对应下方自测题，不是链接教材的习题答案。',
 'If this was the sticking point:':'如果卡在这里，可以复习：','Already comfortable with this?':'已经掌握这些内容？',
 'Review the prerequisites':'复习前置知识','Compare the full subject collection':'比较本学科的完整书目',
 'Reading-source dates':'读物来源核查日期','Edition, reading range and source':'版本、阅读范围与来源'
};
function requireText(value,path){if(typeof value!=='string'||!value.trim())throw Error('Missing Chinese translation: '+path);return value}
function translatedArray(original,translated,path){
 if(!Array.isArray(translated)||original.length!==translated.length)throw Error('Translation count differs: '+path);
 return original.map((_,i)=>requireText(translated[i],path+'/'+i));
}
export function translatedSubjectInputs({topic,entry,editorial,checks=[],additionalChecks=[],topics=[]}){
 const t=subjectTranslations[topic.id];if(!t)throw Error('Missing subject translation '+topic.id);
 const worked=[...checks,...additionalChecks.filter(c=>!checks.some(o=>o.prompt===c.prompt))];
 if(t.checks.length!==worked.length)throw Error('Worked-check translation count differs: '+topic.id);
 const byPrompt=new Map();
 const translatedChecks=worked.map((c,i)=>{
  const tr=t.checks[i],out={...c};for(const k of ['prompt','hint','solution'])out[k]=requireText(tr[k],topic.id+'/checks/'+i+'/'+k);
  if(c.nextSteps)out.nextSteps=c.nextSteps.map((step,j)=>({...step,reason:requireText(tr.nextSteps?.[j],topic.id+'/checks/'+i+'/next/'+j)}));
  byPrompt.set(c.prompt,out.prompt);return out;
 });
 const primary={...entry.primary,locator:requireText(t.primary,topic.id+'/primary')};
 const practice={...entry.practice,label:requireText(t.practice[0],topic.id+'/practice/label'),locator:requireText(t.practice[1],topic.id+'/practice/locator'),availability:requireText(t.practice[2],topic.id+'/practice/availability')};
 if((t.alternatives||[]).length!==entry.alternatives.length)throw Error('Alternative count differs: '+topic.id);
 const alternatives=entry.alternatives.map((r,i)=>({...r,locator:requireText(t.alternatives[i].locator,topic.id+'/alternative/locator'),purpose:requireText(t.alternatives[i].purpose,topic.id+'/alternative/purpose')}));
 if(t.comparisons.length!==editorial.comparison.length)throw Error('Comparison count differs: '+topic.id);
 const comparison=editorial.comparison.map((r,i)=>{
  const tr=t.comparisons[i],out={...r};
  for(const k of ['style','preparation','use','limits'])out[k]=requireText(tr[k],topic.id+'/comparison/'+i+'/'+k);
  out.locator=requireText(tr.locator||(r.locator===entry.primary.locator?primary.locator:''),topic.id+'/comparison/'+i+'/locator');
  out.practice=requireText(tr.practice||(r.practice===entry.practice.availability+' '+entry.practice.locator?practice.availability+' '+practice.locator:''),topic.id+'/comparison/'+i+'/practice');
  out.access=requireText(tr.access||sharedAccess[r.access],topic.id+'/comparison/'+i+'/access');return out;
 });
 if(t.continuations.length!==editorial.continueWith.length)throw Error('Continuation count differs: '+topic.id);
 return {
  topic:{...topic,title:t.title},
  entry:{...entry,objectives:translatedArray(entry.objectives,t.objectives,topic.id+'/objectives'),primary,alternatives,practice,skip:requireText(t.skip,topic.id+'/skip'),checks:entry.checks.map((p,i)=>requireText(t.checkPrompts?.[i]||byPrompt.get(p),topic.id+'/check-prompt/'+i))},
  editorial:{...editorial,opening:requireText(t.opening,topic.id+'/opening'),readingApproach:requireText(t.readingApproach,topic.id+'/readingApproach'),comparison,continueWith:editorial.continueWith.map((r,i)=>({...r,reason:t.continuations[i]}))},
  checks:translatedChecks,additionalChecks:[],topics:topics.map(p=>({...p,title:subjectTranslations[p.id]?.title||p.title}))
 };
}
export function subjectTranslationHTML(input,render){
 const translated=translatedSubjectInputs(input);
 let html=render(translated.topic,translated.entry,translated.checks,{editorial:translated.editorial,additionalChecks:[],topics:translated.topics});
 html=html.replace(/<!-- subject-guide:start -->|<!-- subject-guide:end -->/g,'').replace(/<span id="subject-bibliography"[^>]*><\/span>/,'');
 html=html.replace(/^<section[^>]*>/,'').replace(/<\/section>\s*$/,'');
 html=html.replace('Studying '+translated.topic.title,'学习'+translated.topic.title);
 // Catalogue option values stay canonical even when the visible label changes.
 html=html.replaceAll('catalogue.html?topic='+encodeURIComponent(translated.topic.title),'catalogue.html?topic='+encodeURIComponent(input.topic.title));
 html=translateSubjectFigures(html);
 // Fixed renderer labels only, never formula markup or book-title substrings.
 const bookTitles=new Set([input.entry.primary,...input.entry.alternatives,...input.editorial.comparison].map(r=>r.title));
 html=html.replace(/>([^<>]+)</g,(match,value)=>'>'+(bookTitles.has(value)?value:labels[value]||value)+'<');
 html=html.replace(/Checked (\d{4}-\d{2}-\d{2})/g,'核查日期 $1').replace(/Reading choices revised (\d{4}-\d{2}-\d{2})\./g,'选书说明修订于 $1。');
 return html;
}
export function translateSubjectFigures(html){
 return html.replace(/<figure\b[^>]*id="([^"]+)"[\s\S]*?<\/figure>/g,(figure,id)=>{
  const entry=figures[id];if(!entry)throw Error('Missing figure translation '+id);
  const originalTitle=figure.match(/<p class="figure-title">([^<]+)<\/p>/)?.[1];
  let result=figure.replace(/<figcaption>[\s\S]*?<\/figcaption>/,'<figcaption>'+markdown.renderInline(entry.caption)+'</figcaption>');
  result=result.replace(/<svg\b[\s\S]*?<\/svg>/g,svg=>{
   const id=svg.match(/<title id="([^"]+)"/)?.[1].replace(/-(?:title|label)(?:-enlarged)?$/,'');
   if(!descriptions[id])throw Error('Missing accessible figure description '+id);
   return svg.replace(/<(title|desc)([^>]*)>[\s\S]*?<\/\1>/g,(_,tag,attrs)=>`<${tag}${attrs}>${E(descriptions[id])}</${tag}>`);
  });
  if(originalTitle)result=result.replaceAll(originalTitle,E(entry.title));
  result=result.replace(/Enlarge: /g,'放大：').replace(/ — enlarged diagrams; scroll horizontally if needed/g,'——放大图，可横向滚动');
  return result.replace(/>([^<>]+)</g,(_,text)=>'>'+(figureLabels[text]?E(figureLabels[text]):text)+'<');
 });
}
export function translationPayload(blocks,coverage){
 // Inert JSON keeps just one set of live anchors. English is the no-JS fallback.
 return '<script type="application/json" id="page-translations">'+JSON.stringify({version:1,blocks,...coverage?{coverage}:{}}).replaceAll('<','\\u003c')+'</script>';
}
