import fs from 'node:fs';
import path from 'node:path';
import {escape as E,markdown,renderArticle} from './knowledge-markdown.mjs';
import {chineseCompanion} from './localization.mjs';
import {translatedGuide,renderTranslatedGuide,translateGuideLabels,guideSubjectTitle} from './guide-translations.mjs';

const external=(url,label)=>`<a href="${E(url)}" target="_blank" rel="noopener noreferrer">${E(label)}</a>`;
const safeURL=url=>{const value=new URL(url);if(value.protocol!=='https:'||value.username||value.password)throw Error('Unsafe learning reference');return url};
const read=(root,file)=>JSON.parse(fs.readFileSync(path.join(root,'resources',file),'utf8'));
export function loadLearningEdition(root){
 return {subjects:read(root,'data/learning-editorial.json').subjects,checks:read(root,'content/learning-checks.json').subjects,guides:read(root,'data/learning-guides.json').guides,revisions:read(root,'data/learning-revisions.json').entries};
}
export function validateLearningEdition(edition,topics,oldChecks){
 const ids=new Set(topics.map(t=>t.id)),seen=new Set();
 if(Object.keys(edition.subjects).length!==topics.length)throw Error('Every subject needs an editorial entrance');
 let comparisons=0,worked=0;
 for(const topic of topics){
  const e=edition.subjects[topic.id];
  if(!e?.opening||!e.readingApproach||e.comparison?.length<2||e.comparison.length>3||!e.continueWith?.length)throw Error('Incomplete editorial subject '+topic.id);
  for(const destination of e.continueWith)if(!ids.has(destination.subjectId)||!destination.reason)throw Error('Unknown continuation '+topic.id);
  const titles=new Set();
  for(const r of e.comparison){
   for(const field of ['title','author','url','style','preparation','use','limits','practice','access','sourceUrl','locator','checked'])if(!r[field])throw Error(topic.id+' missing comparison '+field);
   safeURL(r.url);safeURL(r.sourceUrl);if(titles.has(r.title))throw Error('Duplicate comparison '+topic.id);titles.add(r.title);comparisons++;
  }
  const all=combinedChecks(oldChecks[topic.id],edition.checks[topic.id]);
  if(!all.length||(['algebraic-geometry','real-analysis','probability'].includes(topic.id)&&all.length<2))throw Error('Missing worked checks '+topic.id);
  for(const check of all){
   if(!check.id||seen.has(check.id)||!check.prompt||!check.hint||!check.solution)throw Error('Invalid learning check '+topic.id);
   seen.add(check.id);markdown.render(check.hint);markdown.render(check.solution);worked++;
   for(const target of check.nextSteps||[])if(!ids.has(target.subjectId)||!target.reason)throw Error('Unknown remedial subject');
  }
 }
 if(worked<32)throw Error('Expected at least32 preserved and new worked checks');
 const guideIds=new Set();
 for(const guide of edition.guides){
  if(guideIds.has(guide.id)||!guide.title||!guide.summary||!guide.references?.length||!/^resources\/content\/learning-guides\/[a-z0-9-]+\.md$/.test(guide.file))throw Error('Invalid editorial guide');
  guideIds.add(guide.id);for(const id of guide.subjectIds)if(!ids.has(id))throw Error('Unknown guide subject');
  for(const ref of guide.references){safeURL(ref.url);if(!ref.author||!ref.locator||!ref.checked)throw Error('Missing guide evidence')}
 }
 if(edition.guides.length!==7)throw Error('Expected five study guides and two connecting essays');
 return {subjectEntrances:topics.length,comparisonEntries:comparisons,workedChecks:worked,studyGuides:edition.guides.filter(g=>g.kind==='Study guide').length,connectingGuides:edition.guides.filter(g=>g.kind==='Connecting ideas').length};
}
export function combinedChecks(original=[],added=[]){
 const prompts=new Set(original.map(c=>c.prompt));return [...original,...added.filter(c=>!prompts.has(c.prompt))];
}
export const subjectURL=(id,topics)=>'/en/notes/reading-notes/library/'+topics.find(t=>t.id===id).route;
export function renderComparisons(entry){
 return `<section class="reading-choices" id="choose-reading"><h3>Choosing what to read</h3><p>${E(entry.readingApproach)}</p><div class="reading-comparison">${entry.comparison.map(r=>`<article class="reading-choice"><h4>${external(r.url,r.title)}</h4><p class="entry-meta">${E(r.author)}</p><p>${E(r.use)}</p><dl><dt>How it reads</dt><dd>${E(r.style)}</dd><dt>What it expects</dt><dd>${E(r.preparation)}</dd><dt>What to keep in mind</dt><dd>${E(r.limits)}</dd><dt>Practice</dt><dd>${E(r.practice)}</dd></dl><p class="entry-meta">${E(r.access)}</p><details><summary>Edition, reading range and source</summary><p>${E(r.locator)}</p><p>${external(r.sourceUrl,'Source')} · Checked ${E(r.checked)}</p></details></article>`).join('')}</div></section>`;
}
export function renderContinuations(entry,topics){
 return `<section id="continue-learning"><h3>Where this can lead</h3><ul>${entry.continueWith.map(r=>`<li><a href="${E(subjectURL(r.subjectId,topics))}">${E(topics.find(t=>t.id===r.subjectId).title)}</a> — ${E(r.reason)}</li>`).join('')}</ul></section>`;
}
export function editorialGuidePages(root,edition,topics,locale='en'){
 return edition.guides.map(original=>{
  const chinese=locale==='zh',guide=chinese?translatedGuide(original):original;
  const source=fs.readFileSync(path.join(root,guide.file),'utf8');
  const rendered=chinese?renderTranslatedGuide(root,guide.id,source):renderArticle(source.replace(/^# [^\n]+\n+/,''));
  const sourceList=`<section id="reading-sources"><h2>Sources and further reading</h2><ul class="source-list">${guide.references.map(r=>`<li>${external(r.url,r.title)} — ${E(r.author)}.<span class="source-locator">${E(r.locator)} · Checked ${E(r.checked)}</span></li>`).join('')}</ul></section>`;
  const connections=`<p class="concept-links">${guide.subjectIds.map(id=>`<a href="${E(subjectURL(id,topics))}">${E(chinese?guideSubjectTitle(id,topics.find(t=>t.id===id).title):topics.find(t=>t.id===id).title)}</a>`).join(' · ')}</p>`;
  const contributions=`<p class="knowledge-meta">Editorial guide · Revised ${E(guide.reviewed)} · ${external('https://github.com/jiayuchen-math/jiayuchen-math.github.io/edit/main/'+guide.file,'Suggest an edit')} · ${external('https://github.com/jiayuchen-math/jiayuchen-math.github.io/issues/new?template=math-correction.yml','Report a correction')}</p><details><summary>Writing and reuse</summary><p>This guide was prepared with AI-assisted drafting and source review. It does not describe Jiayu Chen’s personal experience. Original editorial text: ${external('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0')}; cited works retain their own terms.</p></details>`;
  const body=`<div lang="${chinese?'zh-Hans':'en'}"><p class="knowledge-meta">${E(guide.kind)}</p><p>${E(guide.summary)}</p><div class="direction-introduction">${rendered.html}</div></div>${connections}${sourceList}${contributions}`;
  return {file:`resources/library-paths/guides/${guide.id}.html`,title:guide.title,body:chinese?translateGuideLabels(body):body,contents:[...rendered.contents,{id:'reading-sources',label:chinese?'参考资料与延伸阅读':'Sources and further reading'}],guide};
 });
}
export function renderRevisionList(entries){
 return `<section class="recent-edits" id="recent-edits"><h2>Recently edited</h2><ul>${entries.slice(0,3).map(e=>`<li><a href="${E(e.url)}">${E(e.title)}</a><p>${E(e.summary)}</p><time datetime="${E(e.date)}">${E(e.date)}</time></li>`).join('')}</ul></section>`;
}
