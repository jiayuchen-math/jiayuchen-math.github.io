import fs from 'node:fs';
import path from 'node:path';
import {escape as E, renderArticle,markdown} from './knowledge-markdown.mjs';
import {subjectFigure,nilpotentFigure} from './study-figures.mjs';
import {sectionDirectionBody} from './direction-sections.mjs';
import {combinedChecks,renderComparisons,renderContinuations,subjectURL} from './learning-editorial.mjs';
import {learningIllustrations} from './learning-illustrations.mjs';
import {renderTranslatedGuide,translateGuideLabels,guideTranslations} from './guide-translations.mjs';

const readJSON=(root,file)=>JSON.parse(fs.readFileSync(path.join(root,'resources',file),'utf8'));
export function checkedHTTPS(value){
 let url;try{url=new URL(value)}catch{throw Error('Invalid external URL: '+value)}
 if(url.protocol!=='https:'||url.username||url.password||!url.hostname)throw Error('Expected a public HTTPS URL: '+value);
 return value;
}
export const conceptFiles=['data/concept-readings-algebra.json','data/concept-readings-breadth.json'];
export function loadConceptReadings(root){
 return conceptFiles.flatMap(file=>readJSON(root,file).filter(e=>e.status!=='draft').map(e=>({...e,contentKind:'External reading guide',sourcePath:'resources/'+file})));
}
export function loadDirectionIntroductions(root){
 const result={};
 for(const file of ['content/direction-introductions-a.json','content/direction-introductions-b.json'])for(const [id,value] of Object.entries(readJSON(root,file))){
  if(result[id])throw Error('Duplicate direction introduction '+id);
  result[id]={...value,sourcePath:'resources/'+file};
 }
 return result;
}
export const loadCourseStudies=root=>readJSON(root,'data/course-study-guides.json');
export const loadStudyChecks=root=>readJSON(root,'content/study-checks.json');
export function readingPracticePage(root,locale='en'){
 const chinese=locale==='zh',source=fs.readFileSync(path.join(root,'resources/content/reading-a-mathematics-text.md'),'utf8');
 const rendered=chinese?renderTranslatedGuide(root,'reading-a-text',source):renderArticle(source);
 const body='<div class="direction-introduction">'+rendered.html+contribution('resources/content/reading-a-mathematics-text.md','reading-a-text')+'<p class="knowledge-meta" data-content-license>Original guide: '+external('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0')+'.</p></div>';
 return {title:chinese?guideTranslations['reading-a-text'].title:'Reading a mathematics text',kind:'article',standalone:true,contents:rendered.contents,body:chinese?translateGuideLabels(body):body};
}
export function validateStudyChecks(checks,courses){
 const ids=new Set();
 for(const [subject,solutions]of Object.entries(checks)){
  if(!courses[subject]||solutions.length!==courses[subject].checks.length)throw Error('Mismatched study-check set '+subject);
  solutions.forEach((item,i)=>{
   if(ids.has(item.id)||!item.id||item.prompt!==courses[subject].checks[i]||!item.hint||!item.solution)throw Error('Mismatched or incomplete study check '+subject+'/'+item.id);
   ids.add(item.id);markdown.render(item.hint);markdown.render(item.solution);
  });
 }
 return ids.size;
}
const external=(url,label)=>`<a href="${E(checkedHTTPS(url))}" target="_blank" rel="noopener noreferrer">${E(label)}</a>`;
const list=items=>'<ul>'+items.map(value=>'<li>'+markdown.renderInline(value)+'</li>').join('')+'</ul>';
const contribution=(file,id)=>`<p class="knowledge-meta">${external('https://github.com/jiayuchen-math/jiayuchen-math.github.io/edit/main/'+file,'Suggest an edit')} · ${external('https://github.com/jiayuchen-math/jiayuchen-math.github.io/issues/new?title='+encodeURIComponent('Reading correction: '+id),'Report a correction')}</p>`;
export function renderDirectionIntroduction(entry,id){
 const rendered=renderArticle(sectionDirectionBody(id,entry.body));
 const prose=id==='algebraic-geometry'?rendered.html.replace('</p>','</p>'+nilpotentFigure()):rendered.html;
 const refs='<details><summary>Sources for this introduction</summary><ul>'+entry.references.map(r=>`<li>${external(r.url,r.label||r.title)} — ${E(r.author)}. ${E(r.locator)}. Checked ${E(r.checked)}.</li>`).join('')+'</ul></details>';
 return {html:`<section class="direction-introduction" id="introduction">${prose}${refs}${contribution(entry.sourcePath,id)}<p class="knowledge-meta" data-content-license>Original introduction: ${external('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0')}.</p></section>`,contents:rendered.contents};
}
export function renderCourseStudy(topic,entry,checks=[],{editorial,additionalChecks=[],topics=[]}={}){
 if(!entry)throw Error('Missing course study guide '+topic.id);
 const reading=(r,purpose='')=>`${external(r.url,r.title)} — ${E(r.author)}. ${E(r.locator)}${purpose?' '+E(purpose):''}`;
 const illustrationParts=[...learningIllustrations(topic.id).matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map(match=>match[0]);
 const sources=[entry.primary,...entry.alternatives];
 const worked=combinedChecks(checks,additionalChecks);
 const practice=worked.length?'<ol class="study-checks">'+worked.map(item=>`<li id="check-${E(item.id)}"><p>${markdown.renderInline(item.prompt)}</p><details data-portal-disclosure><summary>A hint</summary>${markdown.render(item.hint)}</details><details data-portal-disclosure><summary>Work through the solution</summary>${markdown.render(item.solution)}${item.nextSteps?.length?'<p class="check-intro">If this was the sticking point:</p><ul>'+item.nextSteps.map(target=>`<li><a href="${E(subjectURL(target.subjectId,topics))}">${E(topics.find(t=>t.id===target.subjectId).title)}</a> — ${E(target.reason)}</li>`).join('')+'</ul>':''}</details></li>`).join('')+'</ol>':list(entry.checks);
 if(!sources.some(r=>r.url===entry.practice.url))sources.push({...entry.practice,title:entry.practice.label});
 return `<!-- subject-guide:start --><section class="subject-guide" id="study-guide">
 <h2>Studying ${E(topic.title)}</h2>
 <nav class="study-jumps" aria-label="Study guide sections"><a href="#study-guide">Start here</a>${editorial?' · <a href="#choose-reading">Choose a text</a>':''} · <a href="#practice-learning">Practice</a> · <a href="#check-learning">Check your understanding</a>${editorial?' · <a href="#continue-learning">Continue</a>':''} · <a href="#subject-bibliography">Full reading list</a></nav>
 ${editorial?'<p class="subject-opening">'+E(editorial.opening)+'</p>':''}
 <h3>What to work on</h3>${list(entry.objectives)}${illustrationParts[0]||subjectFigure(topic.id)}
 <h3>A starting text</h3><p>${reading(entry.primary)}</p>
 ${editorial?renderComparisons(editorial):''}
 ${entry.alternatives.length?'<details><summary>Other ways into the subject</summary><ul>'+entry.alternatives.map(r=>'<li>'+reading(r,r.purpose)+'</li>').join('')+'</ul></details>':''}
 <h3 id="practice-learning">Practice</h3><p>${external(entry.practice.url,entry.practice.label)}. ${E(entry.practice.locator)}. ${E(entry.practice.availability)}</p>
 <h3 id="check-learning">Try these before moving on</h3>${worked.length?'<p class="check-intro">Try a proof or calculation before opening the hint. These solutions address the checks below, not the exercises in the linked textbooks.</p>':''}${practice}
 <p><strong>Already comfortable with this?</strong> ${markdown.renderInline(entry.skip)}</p>
 ${illustrationParts[1]||''}
 <p><a href="/en/resources/library-paths/${E(topic.id)}.html">Review the prerequisites</a> · <a href="/en/notes/reading-notes/library/catalogue.html?topic=${encodeURIComponent(topic.title)}">Compare the full subject collection</a></p>
 ${editorial?renderContinuations(editorial,topics):''}
 <details><summary>Reading-source dates</summary><ul>${sources.map(r=>'<li>'+E(r.title)+' · '+E(r.checked)+'</li>').join('')}</ul></details>
 ${editorial?'<p class="knowledge-meta">Reading choices revised '+E(editorial.reviewed)+'.</p>':''}${contribution(editorial?'resources/data/learning-editorial.json':'resources/data/course-study-guides.json',topic.id)}</section><span id="subject-bibliography" class="section-anchor"></span><!-- subject-guide:end -->`;
}
export function renderConceptReading(entry,{knowledge,topicTitle,readings=[]}){
 const term=knowledge.terms.find(t=>t.id===entry.id);
 const concept=id=>{const article=knowledge.articles.find(a=>a.id===id)||readings.find(a=>a.id===id),sense=knowledge.terms.find(t=>t.id===id);if(!article&&!sense)throw Error(entry.id+': unpublished prerequisite '+id);return `<a href="/en/resources/${article?'encyclopedia':'terminology'}/${E(id)}/">${E(article?.title||sense.english)}</a>`};
 const references=entry.references.map(r=>`<li><h3>${E(r.role)}: ${external(r.url,r.title)}</h3><p>${E(r.author)} · ${E(r.kind)} · ${E(r.language)} · ${E(r.access)}</p><p>${E(r.locator)}</p>${r.purpose?'<p>'+E(r.purpose)+'</p>':''}<p class="knowledge-meta">${r.sourceUrl&&r.sourceUrl!==r.url?external(r.sourceUrl,'Source page')+' · ':''}Checked ${E(r.checked)}</p></li>`).join('');
 return `<p><a href="/en/resources/encyclopedia/">← Encyclopedia</a></p><p class="knowledge-meta">External reading guide · ${E(entry.level)}${entry.chinese?' · <span lang="zh-Hans">'+E(entry.chinese)+'</span>':''}</p><p>${E(entry.summary)}</p><section id="preparation"><h2>Before opening the references</h2><p>${entry.prerequisites.map(concept).join(' · ')}</p></section><section id="reading"><h2>Where to read</h2><ol class="source-list">${references}</ol></section><section id="connections"><h2>Continue from here</h2><p><a href="/en/notes/reading-notes/library/catalogue.html?topic=${encodeURIComponent(topicTitle)}">${E(topicTitle)} in the library</a> · <a href="/en/resources/library-paths/${E(entry.topic)}.html">Preparation and skip guidance</a>${term?' · <a href="/en/resources/terminology/'+E(entry.id)+'/">Terminology and translation evidence</a>':''}</p></section>${contribution(entry.sourcePath,entry.id)}<p class="knowledge-meta" data-content-license>Original orientation: ${external('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0')}. Linked texts retain their own licences.</p>`;
}
export function validateStudyContent({readings,introductions,courses,knowledge,topics,routeIds,areas}){
 const ids=new Set(),names=new Set(),articles=new Set(knowledge.articles.map(a=>a.id));
 const concepts=new Set([...knowledge.articles,...knowledge.terms,...readings].map(a=>a.id));
 const checked=r=>{checkedHTTPS(r.url);if(r.sourceUrl)checkedHTTPS(r.sourceUrl);if(!(r.title||r.label)||!r.author||!r.locator||!/^\d{4}-\d{2}-\d{2}$/.test(r.checked)||!Number.isFinite(Date.parse(r.checked)))throw Error('Incomplete reading evidence: '+JSON.stringify(r))};
 for(const e of readings){
  const name=e.title.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
  if(ids.has(e.id)||names.has(name)||articles.has(e.id))throw Error('Duplicate concept '+e.id);
  ids.add(e.id);names.add(name);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id)||!areas[e.area]||!topics.some(t=>t.id===e.topic)||!['Undergraduate','Graduate','Research'].includes(e.level)||!e.summary||!Array.isArray(e.aliases)||!e.prerequisites?.length||!e.references?.length||e.references.length>3)throw Error('Incomplete concept guide '+e.id);
  for(const id of e.prerequisites)if(id===e.id||!concepts.has(id))throw Error(e.id+': missing or circular self prerequisite '+id);
  for(const r of e.references){checked(r);if(r.access!=='Free full text'||!r.title||!r.kind||!r.language||!['Start here','Reference','Further reading'].includes(r.role))throw Error('Incomplete open reference '+e.id)}
 }
 for(const id of routeIds){const e=introductions[id];if(!e)throw Error('Missing direction introduction '+id);const n=e.body.split(/\s+/).filter(Boolean).length;if(n<500||n>800)throw Error(id+': expected 500–800 words, found '+n);if(!e.references?.length)throw Error('Missing introduction sources '+id);e.references.forEach(checked);renderArticle(e.body)}
 if(Object.keys(introductions).length!==routeIds.length)throw Error('Unexpected direction introductions');
 for(const topic of topics){const e=courses[topic.id];if(!e||e.objectives.length<3||e.objectives.length>6||e.checks.length<2||e.checks.length>3||!e.skip||e.alternatives.length>2||!e.practice?.url||!e.practice.locator||!e.practice.availability||!/^\d{4}-\d{2}-\d{2}$/.test(e.practice.checked))throw Error('Incomplete course guidance '+topic.id);checkedHTTPS(e.practice.url);[e.primary,...e.alternatives].forEach(checked)}
 return true;
}
