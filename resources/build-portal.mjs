import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {decodeHTML} from 'entities';
import {shell} from './ui-shell.mjs';
import {loadKnowledge,areas} from './build-knowledge.mjs';
import {cleanPageCopy} from './editorial-copy.mjs';
import {backgroundForm} from './data/background-form.mjs';
import {protectedBytes} from './protected-bytes.mjs';
import {goalPathPages,goalPaths} from './goal-paths.mjs';
import {loadConceptReadings,loadDirectionIntroductions,loadCourseStudies,loadStudyChecks,validateStudyContent,renderConceptReading,renderCourseStudy} from './study-content.mjs';
import {nodes as pathNodes} from './data/learning-paths.mjs';
import {titleDestination,entryActions,showsDetails,hasDetailContent} from './assets/entry-presentation.js';
import {adviceMetadata} from './advice-readings.mjs';
import {loadLearningEdition,validateLearningEdition,editorialGuidePages,renderRevisionList} from './learning-editorial.mjs';
import {createLearningTools} from './learning-tools.mjs';
import {chineseCompanion,chineseSubjectMetadata} from './localization.mjs';
import {subjectTranslationHTML,translationPayload} from './subject-translations.mjs';
import {translateRouteLabels,routeTranslations} from './route-translations.mjs';
import {homeTranslationBlocks} from './home-translations.mjs';
import {personalNotesPage} from './personal-notes.mjs';
import {translationCoverage,readTranslationApprovals,focusedPages,coverageTable,compilationRecord} from './editorial-support.mjs';
import {translateEntranceHTML,simplifyLibraryEntrance} from './entrance-translations.mjs';
import {pilotSubjectSection,pilotRouteSection} from './learning-pilots.mjs';
import {algebraicGeometryTopic} from './algebraic-geometry-topic.mjs';
import {contributionHub} from './contribution-hub.mjs';
import {staticRouteContext} from './assets/learning-context.js';

const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=html=>decodeHTML(String(html||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const brief=(s,n=220)=>String(s||'').length>n?String(s).slice(0,n).replace(/\s+\S*$/,'')+'…':String(s||'');
const link=(url,label)=>`<a href="${E(url)}"${/^https?:/.test(url)&&!url.startsWith('https://jiayuchen-math.github.io/')?' target="_blank" rel="noopener noreferrer"':''}>${E(label)}</a>`;
const href=file=>'/en/'+file;
const pageFile=(file,n,all=false)=>n===1&&!all?file:file.replace(/\.html$/,`${all?'-all':''}-page-${n}.html`);
const strings=values=>values.filter(Boolean).join(' · ');

// The original catalogue generator edits these entrance documents in place.
// Give it just their content, not the new navigation it must never edit.
export function unwrapPortalSources(root){
 const files=['index.html','notes/reading-notes/reading-notes.html','notes/mathematical-notes/page.html'];
 const walk=dir=>{for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const file=path.posix.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.name.endsWith('.html')&&!/-(?:all-)?page-\d+\.html$/.test(file))files.push(file)}};
 walk('notes/reading-notes/library');files.push('notes/reading-notes/library.html');
 // Entrance templates only: LF avoids platform-dependent blank-line removal.
 // Authored course-note bodies are not part of this list.
 for(const file of files){const absolute=path.join(root,file),html=fs.readFileSync(absolute,'utf8').replace(/\r\n/g,'\n'),body=html.match(/<!-- portal-content:start -->([\s\S]*?)<!-- portal-content:end -->/);if(!body)continue;const title=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'Mathematics';fs.writeFileSync(absolute,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Jiayu Chen</title></head><body><main><header><h1>${title}</h1></header><nav aria-label="Breadcrumb"><a href="/en/">Home</a> · <a href="/en/resources/">Resources</a></nav>${body[1]}<footer>© 2026 Jiayu Chen · <a href="/en/disclaimer.html">Disclaimer</a></footer></main></body></html>`)}
 const entrance=path.join(root,'notes/reading-notes/library.html');let libraryHTML=fs.readFileSync(entrance,'utf8');
 if(!libraryHTML.includes('href="/en/resources/index.html">← Mathematics Resources'))fs.writeFileSync(entrance,libraryHTML.replace('</nav>',' · <a href="/en/resources/index.html">← Mathematics Resources</a></nav>'));
}

export function buildPortal({root,books,links,programs,researchers,merged,researcherFilters,applicationView,renderers}){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8');
 const save=(file,value)=>{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),value)};
 const json=file=>JSON.parse(read(file));
 const approvals=readTranslationApprovals(root),coverageRecords=new Map();
 const pilotSubjects=new Set(['algebraic-geometry','differential-equations','probability']);
 const pilotRoutes=new Set(['algebraic-geometry','analysis-pde','probability']);
 const editionStyle='<link rel="stylesheet" href="/en/resources/assets/learning-edition.css?v='+createHash('sha256').update(read('resources/assets/learning-edition.css')).digest('hex').slice(0,12)+'">';
 const digest=value=>createHash('sha256').update(value).digest('hex');
 const registryFile='resources/data/stable-ui-ids.json';
 const registry=fs.existsSync(path.join(root,registryFile))?json(registryFile):{library:{},links:{}};
 function stable(type,key){if(!registry[type][key])registry[type][key]=`${type==='library'?'work':'link'}-${String(Object.keys(registry[type]).length+1).padStart(4,'0')}`;return registry[type][key]}
 const knowledge=loadKnowledge(root),articleIds=new Set(knowledge.articles.map(a=>a.id));
 const conceptReadings=loadConceptReadings(root),introductions=loadDirectionIntroductions(root),courseStudies=loadCourseStudies(root);
 const learningEdition=loadLearningEdition(root);
 const learningCounts=validateLearningEdition(learningEdition,merged.topics,json('resources/content/study-checks.json'));
 validateStudyContent({readings:conceptReadings,introductions,courses:courseStudies,knowledge,topics:merged.topics,routeIds:goalPaths.map(r=>r.id),areas});
 const readingIds=new Set(conceptReadings.map(e=>e.id)),termIds=new Set(knowledge.terms.map(e=>e.id));
 const topicTitle=id=>merged.topics.find(t=>t.id===id)?.title||id;
 const protectedFiles=[];
 function walk(dir){const out=[];const entries=fs.readdirSync(path.join(root,dir),{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);for(const e of entries){if(['.git','node_modules'].includes(e.name))continue;const file=path.posix.join(dir,e.name);if(e.isDirectory())out.push(...walk(file));else out.push(file)}return out}
 for(const file of walk('notes'))if(/\.(?:pdf|tex|png|jpe?g|svg|webp)$/i.test(file)||/\/(?:calculus|linear-algebra)\/.*\.html$/.test(file))protectedFiles.push([file,digest(protectedBytes(fs.readFileSync(path.join(root,file)),file))]);
 const sourceHashes=walk('resources/content/encyclopedia').filter(f=>f.endsWith('.md')).map(f=>[f,digest(read(f))]);
 const report={version:1,counts:{library:books.length,encyclopedia:knowledge.articles.length,terminology:knowledge.terms.length,links:links.length,programs:programs.length,researchers:researchers.length},directories:[],protected:protectedFiles,knowledgeSources:sourceHashes};
 report.contentBreakdown={originalArticles:knowledge.articles.length,externalReadingGuides:conceptReadings.length,terminologySenses:knowledge.terms.length,directionIntroductions:Object.keys(introductions).length,subjectStudyGuides:Object.keys(courseStudies).length};
 report.learningEdition=learningCounts;
 const collections=[];
 function bodyOf(html){
  // Unwrapped legacy entrances retain the inert translation script. Remove it
  // before either extraction branch, not only from already wrapped pages.
  html=html.replace(/<script type="application\/json" id="page-translations">[\s\S]*?<\/script>/g,'');
  const marked=html.match(/<!-- portal-content:start -->([\s\S]*?)<!-- portal-content:end -->/);if(marked)return marked[1].replace(/<!-- learning-control:start -->[\s\S]*?<!-- learning-control:end -->/g,'').replace(/<script type="application\/json" id="page-translations">[\s\S]*?<\/script>/g,'').replace(/^<div id="entrance-copy">([\s\S]*)<\/div>\s*$/,'$1');
  let body=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]||html;
  return body.replace(/<header\b[^>]*>[\s\S]*?<\/header>/i,'').replace(/^\s*<nav\b[^>]*>[\s\S]*?<\/nav>/i,'').replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i,'');
 }
 function articleContents(body){
  const headings=[...body.matchAll(/<h[23][^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/g),...body.matchAll(/<section[^>]*id="([^"]+)"[^>]*>\s*<h2[^>]*>([\s\S]*?)<\/h2>/g)].sort((a,b)=>a.index-b.index);
  const unique=[...new Map(headings.map(m=>[m[1],text(m[2])])).entries()];
  return unique.length?'<nav class="contents" aria-label="Article contents"><strong>Contents</strong><ul>'+unique.map(([id,label])=>'<li>'+link('#'+id,label)+'</li>').join('')+'</ul></nav>':'';
 }
 function addPage(file,title,body,kind='directory',extra={}){
  const subjectId=merged.topics.find(t=>'notes/reading-notes/library/'+t.route===file)?.id;
  if(subjectId){
   body=body.replace(/<!-- chinese-companion:start -->[\s\S]*?<!-- chinese-companion:end -->/g,'').replace(/<script type="application\/json" id="page-translations">[\s\S]*?<\/script>/g,'');
   const topic=merged.topics.find(t=>t.id===subjectId);
   const html=subjectTranslationHTML({topic,entry:courseStudies[subjectId],editorial:learningEdition.subjects[subjectId],checks:loadStudyChecks(root)[subjectId]||[],additionalChecks:learningEdition.checks[subjectId]||[],topics:merged.topics},renderCourseStudy);
   const blocks={'study-guide':html};let coverage;
   if(pilotSubjects.has(subjectId)){
    const english=pilotSubjectSection(subjectId,{topics:merged.topics}),chinese=pilotSubjectSection(subjectId,{topics:merged.topics,locale:'zh'});
    body=body.replace(/<!-- pilot-edition:start -->[\s\S]*?<!-- pilot-edition:end -->/g,'');
    body=body.replace('<!-- subject-guide:end -->','<!-- subject-guide:end --><!-- pilot-edition:start --><div id="pilot-copy">'+english+'</div><!-- pilot-edition:end -->');
    const prep=body.match(/<!-- learning-path:start -->([\s\S]*?)<!-- learning-path:end -->/)?.[1]||'';
    if(prep){body=body.replace('<!-- learning-path:start -->'+prep+'<!-- learning-path:end -->','<!-- learning-path:start --><div id="pilot-preparation-links">'+prep+'</div><!-- learning-path:end -->');blocks['pilot-preparation-links']=translateEntranceHTML(prep).html}
    blocks['pilot-copy']=chinese;
    const note='The study guide above is translated; catalogue annotations below retain their original language.';
    body=body.replace(/<p\b[^>]*\bid="pilot-catalogue-note"[^>]*>[\s\S]*?<\/p>/g,'');
    body=body.replace('<!-- pilot-edition:end -->','<!-- pilot-edition:end --><p class="knowledge-meta" id="pilot-catalogue-note">'+note+'</p>');blocks['pilot-catalogue-note']=translateEntranceHTML('<p>'+note+'</p>').html.slice(3,-4);
    coverage=translationCoverage(file,{title:topic.title,body:renderCourseStudy(topic,courseStudies[subjectId],loadStudyChecks(root)[subjectId]||[],{editorial:learningEdition.subjects[subjectId],additionalChecks:learningEdition.checks[subjectId]||[],topics:merged.topics}),pilot:english,preparation:prep},approvals,'learning-sections');
    extra.head=(extra.head||'')+editionStyle;
   }
   body+=translationPayload(blocks,coverage);
  }
  if(/^resources\/encyclopedia\/[^/]+\/index\.html$/.test(file))body=`<!-- learning-control:start --><div class="entry-actions">${saveControl(file.split('/').at(-2),'encyclopedia')}</div><!-- learning-control:end -->`+body;
  if((file.startsWith('resources/library-paths/')||file.startsWith('resources/topics/'))&&kind==='article')body=`<!-- learning-control:start --><div class="entry-actions">${saveControl('guide-'+digest(file).slice(0,12),'guides')}</div><!-- learning-control:end -->`+body;
  if(/class="(?:subject-guide|direction-introduction)"/.test(body))extra.head=(extra.head||'')+'<link rel="stylesheet" href="/en/resources/assets/study-guides.css?v='+digest(read('resources/assets/study-guides.css')).slice(0,12)+'">';
  if(body.includes('class="katex"')&&!extra.head?.includes('katex.min.css'))extra.head=(extra.head||'')+'<link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css">';
  if(['resources/index.html','notes/reading-notes/reading-notes.html'].includes(file))extra.head=(extra.head||'')+'<link rel="stylesheet" href="/en/resources/assets/entrances.css?v='+digest(read('resources/assets/entrances.css')).slice(0,12)+'">';
  if(file==='notes/reading-notes/library.html'||/^notes\/reading-notes\/library\/(?:foundations|algebra|analysis|geometry-topology|number-theory|discrete-mathematics|probability-dynamics)\.html$/.test(file)||file.startsWith('resources/library-paths/'))extra.head=(extra.head||'')+'<link rel="stylesheet" href="/en/resources/assets/library-browse.css?v='+digest(read('resources/assets/library-browse.css')).slice(0,12)+'">';
  if(file==='notes/mathematical-notes/weekly.html')extra.head=(extra.head||'')+'<link rel="stylesheet" href="/en/resources/assets/weekly-entrance.css?v='+digest(read('resources/assets/weekly-entrance.css')).slice(0,12)+'">';
  if(extra.scripts)extra.scripts=extra.scripts.map(source=>{
   if(typeof source!=='string')return source;
   const src=source.startsWith('/en/resources/assets/')?source+'?v='+digest(read(source.slice(4))).slice(0,12):source;
   return /\/(?:portal-catalogue|unified-search)\.js$/.test(source)?{src,type:'module'}:src;
  });
  if(file.startsWith('resources/library-paths/'))extra.scripts=[...(extra.scripts||[]),'/en/resources/assets/paths.js'];
  let output=shell({title,body,url:href(file.replace(/index\.html$/,'')),kind,...extra});
  if(extra.translatedTitle)output=output.replace('<title>','<title id="translated-document-title">').replace('<h1>','<h1 id="translated-page-title">').replace('<span aria-current="page">','<span id="translated-breadcrumb-title" aria-current="page">');
  save(file,output);
  const payload=body.match(/<script type="application\/json" id="page-translations">([\s\S]*?)<\/script>/)?.[1];
  const data=payload?JSON.parse(payload):null;
  coverageRecords.set(file,data?.coverage||{status:data?(data.blocks['study-guide']?'partly-translated':'body-translated'):'interface-only',scope:data?.blocks['study-guide']?'learning-sections':data?'page':'interface'});
 }
 function bilingualPage(file,english,chinese,kind='directory',extra={}){
  const coverage=translationCoverage(file,{title:english.title,body:english.body},approvals,extra.scope||'page',extra.untranslated||0);
  const contents=p=>'<ul>'+(p.contents||[]).map(h=>'<li>'+link('#'+h.id,h.label)+'</li>').join('')+'</ul>';
  const toc=english.contents?.length?'<nav class="contents" id="translated-page-toc" aria-label="Article contents">'+contents(english)+'</nav>':'';
  const blocks={'entrance-copy':chinese.body,'translated-page-title':E(chinese.title),'translated-breadcrumb-title':E(chinese.title),'translated-document-title':E(chinese.title+' · Jiayu Chen'),...(toc?{'translated-page-toc':contents(chinese)}:{})};
  addPage(file,english.title,'<div id="entrance-copy">'+english.body+'</div>'+translationPayload(blocks,coverage),kind,{...extra,translatedTitle:chinese.title,toc,head:(extra.head||'')+editionStyle});
 }
 function saveControl(id,type){return `<button type="button" data-save-learning data-learning-id="${E(id)}" data-learning-type="${E(type)}" hidden>Save to bookshelf</button>`}
 function compareControl(id){return `<button type="button" data-compare-program data-program-id="${E(id)}" hidden>Compare program</button>`}
 const fields=(obj,names)=>Object.fromEntries(names.map(n=>[n,String(obj[n]||'')]));
 const titleSearch=e=>strings([e.title,e.chinese,e.chineseLabel,Array.isArray(e.aliases)?e.aliases.join(' '):e.aliases,e.author,e.institution,e.topics,e.originalTitle]);
 function row(e,extra){return {id:e.id,title:e.title,subtitle:'',summary:'',meta:'',fields:{},search:titleSearch(e),...extra}}
 const libraryRows=books.map(e=>row({...e,id:stable('library',e.url.replace(/\/$/,''))},{subtitle:e.author,summary:brief(e.note),meta:strings([e.level,e.readingAccess,e.access]),readingUrl:e.url,fields:fields(e,['topic','level','readingAccess','kind','language','readingMode','access']),search:strings([titleSearch(e),e.topic,e.prerequisites,e.note])}));
 const linksRows=links.map(e=>row({...e,id:stable('links',e.url)},{subtitle:strings([e.author,e.originalTitle||e.chineseLabel]),aliases:e.aliases,summary:e.section?e.note:brief(e.note),meta:strings([e.category,e.area,e.language]),readingUrl:e.url,fields:fields(e,['category','area','language']),search:strings([titleSearch(e),e.category,e.area,e.note,e.use])}));
 const programRows=programs.map(e=>{const timing=applicationView(e);return row(e,{subtitle:strings([e.institution,e.country.replaceAll('|',', '),e.degree]),summary:brief(e.note),meta:strings([e.applicationWindow?.deadlineLabel?`Deadline: ${e.applicationWindow.deadlineLabel}`:'Deadline not verified',brief(e.tuition,130),brief(e.fundingDetail,130)]),readingUrl:e.url,fields:{...fields(e,['country','degree','region','programmeForm','intakeYear','orientation','language','fees','funding']),backgroundMatch:'Eligibility not established'},applicationWindow:timing.data,applicationDates:timing.dates,background:{institution:e.institution,country:e.country,degree:e.degree,language:e.language,funding:e.funding,entryLevels:e.entryLevels,eligibilityRule:e.eligibilityRule},search:strings([titleSearch(e),e.country,e.degree,e.orientation,e.preparation,e.note])})});
 for(const r of programRows){const recorded=r.applicationDates.filter(d=>d.type==='Admission'&&d.date);if(recorded.length&&r.meta.startsWith('Deadline not verified'))r.meta=r.meta.replace('Deadline not verified','Recorded admission: '+recorded.map(d=>d.label||d.date).join('; '));}
 const researcherRows=researchers.map(e=>{const f=researcherFilters(e);return row({...e,title:e.name},{subtitle:strings([e.institution,e.country]),summary:brief(e.topics.replaceAll('|',', ')),meta:strings([e.role,e.email?'Public email available':'Email not verified']),readingUrl:e.official,email:e.email||'',fields:{...fields(f,['country','institution','area','region','availability','recent','contact','topicStatus']),topic:e.topics},search:strings([e.name,e.institution,e.country,e.topics,e.area,e.aliases||''])})});
 const conceptFields=e=>({area:areas[e.area].title,topic:topicTitle(e.topic),level:e.level,contentKind:e.contentKind||'Original explanation',coverage:articleIds.has(e.id)?'Encyclopedia explanation':readingIds.has(e.id)?'External reading guide':'Short definition only',translationStatus:e.translationStatus||''});
 const articleRows=knowledge.articles.map(e=>row(e,{chinese:e.chinese,aliases:e.aliases,summary:e.summary,meta:strings([areas[e.area].title,e.level]),fields:conceptFields(e),url:`/en/resources/encyclopedia/${e.id}/`,termUrl:`/en/resources/terminology/${e.id}/`,search:strings([titleSearch(e),e.summary,areas[e.area].title,topicTitle(e.topic)])}));
 articleRows.push(...conceptReadings.map(e=>{
  const term=knowledge.terms.find(t=>t.id===e.id),chinese=e.chinese||term?.chinese||'';
  const aliases=[...new Set([...e.aliases,...term?.aliases||[]])],author=[...new Set(e.references.map(r=>r.author))].join('; ');
  return row(e,{chinese,aliases,author,summary:e.summary,meta:strings([areas[e.area].title,e.level,'External reading guide']),fields:conceptFields(e),url:`/en/resources/encyclopedia/${e.id}/`,termUrl:termIds.has(e.id)?`/en/resources/terminology/${e.id}/`:undefined,search:strings([titleSearch(e),chinese,aliases.join(' '),e.summary,areas[e.area].title,topicTitle(e.topic),author])});
 }));
 articleRows.sort((a,b)=>a.title.localeCompare(b.title,'en'));
 const termRows=knowledge.terms.map(e=>row({...e,title:e.english},{chinese:e.chinese,aliases:e.aliases,summary:brief(text(e.definitionEn)),meta:strings([areas[e.area].title,e.level,articleIds.has(e.id)||readingIds.has(e.id)?'':'Short definition only']),fields:conceptFields(e),url:`/en/resources/terminology/${e.id}/`,encyclopediaUrl:articleIds.has(e.id)||readingIds.has(e.id)?`/en/resources/encyclopedia/${e.id}/`:undefined,search:strings([e.english,e.chinese,e.aliases.join(' '),e.definitionEn,e.definitionZh,areas[e.area].title,topicTitle(e.topic)])}));
 const articleExtract=(file)=>[...read(file).matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(m=>m[0]);
 function compactFilters(rows,filterList,defaults={},applications=false){
  const valuesFor=field=>field==='backgroundMatch'?['Potential route — confirmation needed','Documented qualification gap','Documented route mismatch','Eligibility not established']:[...new Set(rows.flatMap(r=>String(r.fields[field]||'').split('|')))].filter(Boolean).sort();
  const filterHTML=([field,label])=>{const values=valuesFor(field);const initial=values.length>40?values.filter(v=>v===defaults[field]):values;return `<label for="filter-${E(field)}"><span>${E(label)}</span><select id="filter-${E(field)}" name="${E(field)}" data-field="${E(field)}"><option value="">All</option>${initial.map(v=>`<option value="${E(v)}"${defaults[field]===v?' selected':''}>${E(v)}</option>`).join('')}</select></label>`};
  const timing=applications?`<fieldset><legend>Application time</legend><div class="filters"><label for="filter-applicationStatus"><span>Application status</span><select id="filter-applicationStatus" name="applicationStatus" data-field="applicationStatus"><option value="">All</option>${['Within reviewed window','Upcoming','Closed','Rolling','Deadline day — time unverified','Opening day — time unverified','Dates not verified'].map(v=>`<option>${E(v)}</option>`).join('')}</select></label><label for="date-type"><span>Date type</span><select id="date-type" name="date-type">${['Admission','Scholarship','Test registration','Supporting documents'].map(v=>`<option>${v}</option>`).join('')}</select></label><label for="deadline-from"><span>Deadline from</span><input type="date" name="deadline-from" id="deadline-from"></label><label for="deadline-to"><span>Deadline to</span><input type="date" name="deadline-to" id="deadline-to"></label><label for="deadline-sort"><span>Order</span><select name="deadline-sort" id="deadline-sort"><option value="">Directory order</option><option value="deadline">Earliest known selected deadline</option></select></label></div><p hidden data-date-error role="alert">The end date must not precede the start date.</p></fieldset>`:'';
  const main=filterList.slice(0,3),more=filterList.slice(3);
  const statusOptions=['Within reviewed window','Upcoming','Closed','Rolling','Deadline day — time unverified','Opening day — time unverified','Dates not verified'];
  const primary=main.map(f=>f[0]==='applicationStatus'?`<label for="filter-applicationStatus"><span>Application time</span><select id="filter-applicationStatus" name="applicationStatus" data-field="applicationStatus"><option value="">All</option>${statusOptions.map(v=>`<option>${E(v)}</option>`).join('')}</select></label>`:filterHTML(f)).join('');
  const advancedTiming=timing.replace(/<label for="filter-applicationStatus">[\s\S]*?<\/label>/,'');
  return {filters:filterList.map(([field,label])=>({field,label,values:field==='applicationStatus'?statusOptions:valuesFor(field)})),html:`<label for="search-q" class="catalogue-search"><span>Search this directory</span><input type="search" name="q" id="search-q" autocomplete="off"></label><div class="portal-filters">${primary}</div>${more.length||timing?`<details class="more-filters"><summary>More filters</summary><div class="portal-filters">${more.map(filterHTML).join('')}</div>${advancedTiming}</details>`:''}<button type="reset">Clear filters</button>`};
 }
 function summaryHTML(r,details,collection){const target=titleDestination(r),actions=entryActions(r),control=['library','exposition','encyclopedia'].includes(collection)?saveControl(r.id,collection==='exposition'?'library':collection):collection==='programs'?compareControl(r.id):'';return `<article class="portal-entry" id="${E(r.id)}"><h2>${link(target,r.title)}${r.chinese?` <span lang="zh-Hans">${E(r.chinese)}</span>`:''}</h2>${r.subtitle?`<p class="entry-meta">${E(r.subtitle)}</p>`:''}${r.meta?`<p class="entry-meta">${E(r.meta)}</p>`:''}<p class="entry-summary">${E(r.summary)}</p>${r.inlineInfo?`<p class="entry-meta">${E(r.inlineInfo)}</p>`:''}${actions.length||control?`<div class="entry-actions">${actions.map(a=>link(a.url,a.label)).join(' ')}${control}</div>`:''}${details&&showsDetails(r)?`<details data-entry-details="${E(r.id)}"><summary>Details and sources</summary><div class="entry-detail">${details.replace(new RegExp(` id="${r.id}"`),'')}</div></details>`:''}</article>`}
 const directoryFiles=new Set();
 function directory({id,title,file,rows,filterList,render,defaults={},intro='',applications=false,collection=true}){
  directoryFiles.add(file);const summaries=compactFilters(rows,filterList,defaults,applications);
  // Search/filter metadata now lives in the lightweight index, not duplicated
  // inside every full-text article. All visible facts and source links remain.
  const full=rows.map((r,i)=>{
   let html=cleanPageCopy(render?render(i):'',file).replace(/<article\b([^>]*)>/g,(_,attributes)=>'<article'+attributes.replace(/\sdata-[a-z-]+="[^"]*"/g,'')+'>');
   if(id==='researchers'&&researchers[i].emailSource&&!html.includes(E(researchers[i].emailSource)))html=html.replace('</article>','<p class="meta">'+link(researchers[i].emailSource,'Recorded contact source')+'</p></article>');
   return html;
  });
  const chunkSize=25;
  rows.forEach((r,i)=>{
   r.detail=render?`/en/resources/catalogue-data/${id}/details-${Math.floor(i/chunkSize)+1}.json`:undefined;
   r.hasDetails=hasDetailContent(full[i]);
   if(id==='library'){
    const original=books[i];r.readingUrl=original.readUrl||original.url;
    r.readingLabel=original.readUrl?'Read full text':original.readingAccess==='Free to read'?(/\.pdf(?:[?#]|$)/i.test(r.readingUrl)?'Read PDF':'Read online'):'Access page';
    r.sourceUrl=original.readUrl?original.accessSource||original.url:original.source;
   } else if(id==='links'){
    const original=links[i];r.readingLabel='Visit website';r.sourceUrl=original.source;
    if(original.section){r.readingLabel=/\.pdf(?:[?#]|$)/i.test(original.url)?'Read PDF':'Read article';r.sourceLabel=original.source.includes('zhihu.com/en/')?'Zhihu English rendering (reviewed)':'Author / source page';}
    r.inlineInfo=`Use / preparation: ${original.use||''}${original.section?' · '+adviceMetadata(original):''} · Checked ${original.checked||'Not recorded'}`;
    if(original.alternateUrl)r.alternateUrl=original.alternateUrl;
    r.hasDetails=false; // All additional link metadata is visible, not a second copy of this card.
   } else if(id==='programs')r.readingLabel='Program website';
   else if(id==='researchers')r.readingLabel='Official profile';
   r.url=r.url||href(pageFile(file,Math.floor(i/25)+1,Boolean(defaults.readingAccess)))+'#'+r.id;
  });
  for(let start=0;start<rows.length;start+=chunkSize)if(render){
   const file=`resources/catalogue-data/${id}/details-${start/chunkSize+1}.json`;
   const payload=JSON.stringify(Object.fromEntries(rows.slice(start,start+chunkSize).map((r,j)=>[r.id,full[start+j]])));
   save(file,payload);
   for(const r of rows.slice(start,start+chunkSize))r.detail=href(file)+'?v='+digest(payload).slice(0,12);
  }
  save(`resources/catalogue-data/${id}/index.json`,JSON.stringify({records:rows,filters:summaries.filters,defaults}));
  const indexVersion=digest(read(`resources/catalogue-data/${id}/index.json`)).slice(0,12);
  const isFree=r=>!defaults.readingAccess||r.fields.readingAccess===defaults.readingAccess;
  function staticSeries(all){const shown=all?rows:rows.filter(isFree),pages=Math.max(1,Math.ceil(shown.length/25));for(let n=1;n<=pages;n++){
   const name=pageFile(file,n,all),current=shown.slice((n-1)*25,n*25);
   const nav=`<nav class="static-pagination" id="portal-pagination" aria-label="Results pages">${n>1?link(href(pageFile(file,n-1,all)),'Previous'):'<span>Previous</span>'}<span>Page ${n} of ${pages}</span>${n<pages?link(href(pageFile(file,n+1,all)),'Next'):'<span>Next</span>'}</nav>`;
   const compat=n===1&&!all&&render?`<noscript><details class="legacy-bookmarks"><summary>All entry links / older bookmarks</summary>${rows.filter(r=>!current.includes(r)).map(r=>`<a id="${E(r.id)}" href="${E(r.url)}">${E(r.title)}</a>`).join(' ')}</details></noscript>`:'';
   const filters=`<form class="controls" data-portal-catalogue data-index="/en/resources/catalogue-data/${id}/index.json?v=${indexVersion}" data-base="${href(file)}" data-defaults="${E(JSON.stringify(all?{}:defaults))}" data-current-page="${n}" hidden>${all?summaries.html.replaceAll(' selected',''):summaries.html}</form><div id="active-filters" class="chips" aria-label="Selected filters"></div>`;
   const body=`${intro}${filters}<p id="result-count" class="meta" role="status" tabindex="-1" aria-live="polite">${shown.length} results · page ${n} of ${pages}</p><noscript><p>Browse every entry using the page links.${defaults.readingAccess?' '+link(href(pageFile(file,1,true)),'Browse all access types')+'.':''}</p></noscript><p id="no-results" hidden>No matching entries. Clear filters or try another keyword.</p><div id="portal-results" class="results">${current.map(r=>summaryHTML(r,full[rows.indexOf(r)],id)).join('')}</div>${nav}${compat}`;
   addPage(name,title,body,'directory',{scripts:['/en/resources/assets/portal-catalogue.js']});
   if(n===1&&!all){const target=collection?report.directories:(report.supplementaryDirectories||=[]);target.push({id,url:href(file),records:rows.length,pages,firstPageBytes:Buffer.byteLength(read(name))})}
  }}
  staticSeries(false);if(defaults.readingAccess)staticSeries(true);
  if(collection)collections.push({id,label:title,url:href(file),rows});
 }
 directory({id:'library',title:'Mathematics Library',file:'notes/reading-notes/library/catalogue.html',rows:libraryRows,filterList:[['topic','Subject'],['level','Level'],['readingAccess','Access'],['kind','Type'],['language','Language'],['readingMode','Reading purpose'],['access','Link format']],defaults:{readingAccess:'Free to read'},render:i=>renderers.library(books[i]),intro:`<p class="directory-intro">Texts and lecture notes, from first courses to research. Free to read is selected by default. ${link('/en/notes/reading-notes/library.html','Browse subject cards')} · ${link('/en/resources/library-paths/','Reading paths')} · ${link('exposition.html','Essays & popular mathematics')}</p>`});
 directory({id:'links',title:'Web Resources',file:'resources/links/index.html',rows:linksRows,filterList:[['category','Category'],['area','Area'],['language','Language']],render:i=>renderers.links(links[i]),intro:`<p class="directory-intro">Reference tools, courses and communities. Selected articles: ${link('study-advice.html','Study advice')} · ${link('../study-careers/experiences.html','Application experiences')} · ${link('advice.html','All advice articles')}.</p>`});
 directory({id:'programs',title:'Study & Careers',file:'resources/study-careers/index.html',rows:programRows,filterList:[['country','Country / territory'],['degree','Degree / opportunity'],['applicationStatus','Application time'],['backgroundMatch','Background match'],['region','Region'],['programmeForm','Programme form'],['intakeYear','Intake year'],['orientation','Focus'],['language','Language'],['fees','Fee information'],['funding','Funding information']],applications:true,render:i=>renderers.programs(programs[i]),intro:`<p class="directory-intro">Mathematics study and research routes. ${link('guides.html','Application guides')} · ${link('fee-status.html','Fee-status rules')}</p>${cleanPageCopy(backgroundForm(E),'resources/study-careers/index.html')}`});
 directory({id:'researchers',title:'Researcher Directory',file:'resources/study-careers/researchers.html',rows:researcherRows,filterList:[['country','Country / territory'],['topic','Research topic'],['institution','Institution'],['area','Broad area'],['region','Region'],['availability','Student availability'],['recent','Public student records'],['contact','Public email'],['topicStatus','Research-topic evidence']],render:i=>{let html=renderers.researchers(researchers[i]);if(researchers[i].affiliationNote)html=html.replace('</h3>','</h3><p class="meta">'+E(researchers[i].affiliationNote)+'</p>');return html},intro:`<p class="directory-intro">Search current source-linked profiles and published research topics. ${link('guides.html#contact-researchers','Contact guidance')} · ${link('coverage.html','Country coverage')}</p>`});
 directory({id:'encyclopedia',title:'Mathematics Encyclopedia',file:'resources/encyclopedia/index.html',rows:articleRows,filterList:[['area','Area'],['level','Level'],['contentKind','Entry type'],['topic','Subject']],intro:`<p class="directory-intro">${knowledge.articles.length} original explanations and ${conceptReadings.length} external reading guides. ${link('/en/resources/library-paths/','Choose a learning direction')} · ${link('contributing.html','Contribute')}</p>`});
 directory({id:'terminology',title:'Terminology & Translations',file:'resources/terminology/index.html',rows:termRows,filterList:[['area','Area'],['topic','Subject'],['level','Level'],['coverage','Explanation depth'],['translationStatus','Translation evidence']]});
 const essayRows=libraryRows.filter(r=>r.fields.readingAccess==='Free to read'&&r.fields.readingMode==='Popular / exposition').map(r=>({...r,fields:{...r.fields}}));
 directory({id:'exposition',title:'Essays & Popular Mathematics',file:'notes/reading-notes/library/exposition.html',rows:essayRows,filterList:[['topic','Subject'],['level','Level'],['language','Language']],collection:false,render:i=>renderers.library(books[libraryRows.findIndex(r=>r.id===essayRows[i].id)])});
 const coverageFile='resources/study-careers/coverage.html',coverageArticles=articleExtract(coverageFile),coverageData=json('resources/data/researcher-coverage.json').countries;
 const coverageRows=coverageData.map(c=>row({id:'country-'+c.country.toLowerCase().replace(/[^a-z0-9]+/g,'-'),title:c.country},{summary:c.gap,meta:strings([c.status,`${c.records} indexed profiles`]),fields:fields(c,['region','status']),search:strings([c.country,c.institutionLabels.join(' '),c.status,c.gap])}));
 directory({id:'coverage',title:'Researcher Directory — Country Coverage',file:coverageFile,rows:coverageRows,filterList:[['region','Region'],['status','Coverage status']],collection:false,render:i=>coverageArticles[i],intro:`<p class="directory-intro">Country counts and gaps in the indexed sample. ${link('researchers.html','Researcher directory')}</p>`});
 // Preserve every old article, source locator, formula and contribution link.
 for(const type of ['encyclopedia','terminology'])for(const concept of knowledge[type==='encyclopedia'?'articles':'terms']){
  const file=`resources/${type}/${concept.id}/index.html`,old=read(file);let body=bodyOf(old);let toc=body.match(/<nav class="contents"[^>]*>[\s\S]*?<\/nav>/)?.[0]||'';
  if(toc)body=body.replace(toc,'');else{let seq=0;body=body.replace(/<h2(?:\s+id="([^"]+)")?>([\s\S]*?)<\/h2>/g,(_,id,label)=>`<h2 id="${id||'section-'+(++seq)}">${label}</h2>`);toc='<nav class="contents" aria-label="Article contents"><strong>Contents</strong><ul>'+[...body.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(m=>`<li>${link('#'+m[1],text(m[2]))}</li>`).join('')+'</ul></nav>'}
  if(type==='terminology'&&readingIds.has(concept.id))body+='<p>'+link('/en/resources/encyclopedia/'+concept.id+'/','Open the reading guide for this concept')+'</p>';
  addPage(file,concept.title||concept.english,body,'article',{toc,head:'<link rel="stylesheet" href="/en/resources/assets/knowledge.css"><link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css">'});
 }
 for(const entry of conceptReadings){
  const file=`resources/encyclopedia/${entry.id}/index.html`,body=renderConceptReading(entry,{knowledge,readings:conceptReadings,topicTitle:topicTitle(entry.topic)});
  const toc='<nav class="contents" aria-label="Article contents"><strong>Contents</strong><ul>'+[['preparation','Preparation'],['reading','Where to read'],['connections','Connections']].map(([id,label])=>'<li>'+link('#'+id,label)+'</li>').join('')+'</ul></nav>';
  addPage(file,entry.title,body,'article',{toc,head:'<link rel="stylesheet" href="/en/resources/assets/knowledge.css"><link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css">'});
 }
 // Shared wrappers for existing resource entrances and guides. Never wrap course note bodies.
 const goalPages=goalPathPages({topics:merged.topics,nodes:pathNodes,root});
 const chineseGoalPages=goalPathPages({topics:merged.topics,nodes:pathNodes,root,locale:'zh'});
 const editorialPages=editorialGuidePages(root,learningEdition,merged.topics);
 const chineseEditorialPages=new Map(editorialGuidePages(root,learningEdition,merged.topics,'zh').map(p=>[p.file,p]));
 const managedLearning=new Set([...editorialPages.map(p=>p.file),'resources/bookshelf/index.html','resources/study-careers/compare/index.html','resources/encyclopedia/contributing.html','resources/topics/algebraic-geometry/index.html']);
 const passthrough=walk('resources').filter(f=>f.endsWith('.html')&&!managedLearning.has(f)&&!directoryFiles.has(f)&&!goalPages.has(f)&&!f.includes('/catalogue-data/')&&!/-(?:all-)?page-\d+\.html$/.test(f)&&!/^resources\/(?:encyclopedia|terminology)\/[^/]+\/index\.html$/.test(f)&&f!=='resources/index.html'&&f!=='resources/search/index.html'&&!f.startsWith('resources/data/'));
 passthrough.push(...walk('notes/reading-notes').filter(f=>f.endsWith('.html')&&!directoryFiles.has(f)&&!f.endsWith('open-reading.html')&&!/-(?:all-)?page-\d+\.html$/.test(f)),'notes/mathematical-notes/page.html','disclaimer.html');
 const guideRows=[];
 for(const file of passthrough){
  const old=read(file);if(!old.includes('<main'))continue;
  const title=text(old.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]||old.match(/<title>([\s\S]*?) · Jiayu Chen<\/title>/)?.[1]||'Mathematics');
  let body=bodyOf(old).replace(/<!-- subject-landing:start -->[\s\S]*?<!-- subject-landing:end -->/g,'');
  if(file==='notes/reading-notes/library.html'){
   body=simplifyLibraryEntrance(body);
   const translated=translateEntranceHTML(body);
   const note={en:'Use cards to find a subject when you do not yet know a title. Use the catalogue when you have a book, author or access requirement in mind. The subject guides explain a smaller starting selection; this page keeps the wider collection visible.',zh:'还不知道具体书名时，先按学科卡片找；已经有书名、作者或获取要求时，用书库检索。学科学习页会解释少量起步读物，这里保留更完整的资料范围。'};
   bilingualPage(file,{title,body:body+compilationRecord({...note})},{title:'按学科浏览书库',body:translated.html+compilationRecord({...note,locale:'zh'})},'directory',{untranslated:translated.untranslated.length});
   continue;
  }
  const category=file.match(/^notes\/reading-notes\/library\/([^/]+)\.html$/)?.[1];
  const courses=merged.topics.filter(t=>t.group===category);
  if(courses.length){
   const routeIds={foundations:['logic','higher-categories'],algebra:['algebraic-geometry','representation-theory','higher-categories'],analysis:['analysis-pde','complex-harmonic-analysis'],'geometry-topology':['geometry','topology'],'number-theory':['number-theory'],'discrete-mathematics':['combinatorics'],'probability-dynamics':['probability','dynamics']}[category];
   const related=goalPaths.filter(r=>routeIds.includes(r.id));
   const areaIds={foundations:['foundations'],algebra:['algebra','category-theory'],analysis:['analysis'],'geometry-topology':['geometry-topology'],'number-theory':['number-theory'],'discrete-mathematics':['combinatorics'],'probability-dynamics':['probability','dynamics']}[category];
   body=`<!-- subject-landing:start --><section class="subject-landing"><h2>Find a place to begin</h2><p>Choose a course guide for reading choices and worked checks, or follow a longer route.</p><h3>Course guides</h3><ul>${courses.map(t=>'<li>'+link('/en/notes/reading-notes/library/'+t.route,t.title)+'</li>').join('')}</ul><h3>Longer routes</h3><ul>${related.map(r=>'<li>'+link('/en/resources/library-paths/routes/'+r.id+'.html',r.title)+'</li>').join('')}</ul><p>Search all related material: ${areaIds.map(id=>link('/en/resources/search/?area='+encodeURIComponent(areas[id].title),areas[id].title)).join(' · ')}</p></section><!-- subject-landing:end -->`+body;
  }
  const article=file.includes('/library-paths/')||file.endsWith('guides.html')||file.endsWith('fee-status.html')||file.endsWith('contributing.html')||file.endsWith('/paths.html')||file.endsWith('/advice.html')||file.endsWith('/study-advice.html')||file.endsWith('/experiences.html');
  let toc='';if(article){toc=body.match(/<nav class="contents"[^>]*>[\s\S]*?<\/nav>/)?.[0]||'';if(toc)body=body.replace(toc,'');if(!toc.includes('href="#'))toc=articleContents(body)}
  addPage(file,title,body,article?'article':'directory',{toc,head:(file.includes('/encyclopedia/')?'<link rel="stylesheet" href="/en/resources/assets/knowledge.css"><link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css">':'')+(courses.length?'<link rel="stylesheet" href="/en/resources/assets/study-guides.css?v='+digest(read('resources/assets/study-guides.css')).slice(0,12)+'">':'')});
  const subject=merged.topics.find(t=>file==='notes/reading-notes/library/'+t.route||file==='resources/library-paths/'+t.id+'.html');
  if(article||file.includes('/library/')){
   const englishBody=body.replace(/<!-- chinese-companion:start -->[\s\S]*?<!-- chinese-companion:end -->/g,'').replace(/<script type="application\/json" id="page-translations">[\s\S]*?<\/script>/g,'');
   const chinese=file.startsWith('notes/reading-notes/library/')&&subject?chineseSubjectMetadata[subject.id]?.title:undefined;
   guideRows.push({id:'guide-'+digest(file).slice(0,12),title,url:href(file),summary:brief(text(englishBody)),...(chinese?{chinese,aliases:[chineseSubjectMetadata[subject.id].summary]}:{}),area:subject?areaForTopic(subject):'',type:'guides'});
  }
 }
 // Goal routes sit above the smaller prerequisite reviews, which keep their URLs.
 for(const [file,page] of goalPages){
  const chinese=chineseGoalPages.get(file);
  const routeId=file.match(/\/routes\/([^/]+)\.html$/)?.[1];
  if(pilotRoutes.has(routeId)){
   page.body=page.body.replace('<nav class="route-spine"','<!-- pilot-route:start -->'+staticRouteContext(pilotRouteSection(routeId,{topics:merged.topics}),routeId)+'<!-- pilot-route:end --><nav class="route-spine"');
   chinese.body=chinese.body.replace('<nav class="route-spine"','<!-- pilot-route:start -->'+staticRouteContext(pilotRouteSection(routeId,{topics:merged.topics,locale:'zh'}),routeId)+'<!-- pilot-route:end --><nav class="route-spine"');
  }
  // Preserve the old bookmark, without a second Chinese-only directory.
  if(file==='resources/library-paths/index.html'){
   const anchor='<span id="chinese-subject-guides" class="section-anchor" aria-hidden="true"></span>';
   const more=['Study guide','Connecting ideas'].map(kind=>'<section><h2>'+(kind==='Study guide'?'Questions that come up while studying':'Connections between subjects')+'</h2><ul>'+editorialPages.filter(p=>p.guide.kind===kind).map(p=>'<li>'+link(href(p.file),p.title)+'</li>').join('')+'</ul></section>').join('');
   page.body=anchor+page.body+more;
   if(chinese)chinese.body=anchor+chinese.body+translateRouteLabels(more);
  }
  const routeContents=p=>{
   const introductionLinks=(p.contents||[]).map(h=>'<li>'+link('#'+h.id,h.label)+'</li>').join('');
   const pilot=p.body.match(/<section[^>]*id="pilot-route"[^>]*>\s*<h2>([\s\S]*?)<\/h2>/);
   return p.kind==='article'?'<strong>Route stages</strong><ul>'+(p.standalone?introductionLinks:'<li>'+link('#introduction','Introduction')+(introductionLinks?'<ul>'+introductionLinks+'</ul>':'')+'</li>'+(pilot?'<li>'+link('#pilot-route',text(pilot[1]))+'</li>':'')+[...p.body.matchAll(/<section class="route-stage" id="([^"]+)"><h2>([\s\S]*?)<\/h2>/g)].map(m=>`<li>${link('#'+m[1],text(m[2]))}</li>`).join(''))+'</ul>':'';
  };
  const contents=routeContents(page),toc=contents?'<nav class="contents"'+(chinese?' id="translated-page-toc"':'')+' aria-label="Article contents">'+contents+'</nav>':'';
  const coverage=pilotRoutes.has(routeId)?translationCoverage(file,{title:page.title,body:page.body},approvals):undefined;
  const body=chinese?'<div id="route-copy">'+page.body+'</div>'+translationPayload({'route-copy':chinese.body,'translated-page-title':E(chinese.title),'translated-breadcrumb-title':E(chinese.title),'translated-document-title':E(chinese.title+' · Jiayu Chen'),...(contents?{'translated-page-toc':translateRouteLabels(routeContents(chinese))}:{})},coverage):page.body;
  addPage(file,page.title,body,page.kind,{toc,...(chinese?{translatedTitle:chinese.title}:{}),head:(page.kind==='article'?'<link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css">':'')+(pilotRoutes.has(routeId)?editionStyle:'')});
  const routeAreas={'algebraic-geometry':['algebra'],'representation-theory':['algebra'],'analysis-pde':['analysis'],'complex-harmonic-analysis':['analysis'],geometry:['geometry-topology'],topology:['geometry-topology'],'number-theory':['number-theory'],logic:['foundations'],probability:['probability'],dynamics:['dynamics'],combinatorics:['combinatorics'],'higher-categories':['category-theory','geometry-topology']};
  guideRows.push({id:'guide-'+digest(file).slice(0,12),title:page.title,url:href(file),summary:brief(text(page.body.replace(/<!-- chinese-subject-index:start -->[\s\S]*?<!-- chinese-subject-index:end -->/g,''))),...(chinese?{chinese:chinese.title,aliases:[chinese.title,...routeTranslations[routeId]?[routeTranslations[routeId].goal]:[]]}:{}),area:(routeAreas[routeId]||[]).map(id=>areas[id].title).join('|'),type:'guides'});
 }
 for(const page of editorialPages){
  const chinese=chineseEditorialPages.get(page.file);
  const contents=p=>'<ul>'+p.contents.map(h=>'<li>'+link('#'+h.id,h.label)+'</li>').join('')+'</ul>';
  const toc='<nav class="contents" id="translated-page-toc" aria-label="Article contents">'+contents(page)+'</nav>';
  const body='<div id="guide-copy">'+page.body+'</div>'+translationPayload({'guide-copy':chinese.body,'translated-page-title':E(chinese.title),'translated-breadcrumb-title':E(chinese.title),'translated-document-title':E(chinese.title+' · Jiayu Chen'),'translated-page-toc':contents(chinese)});
  addPage(page.file,page.title,body,'article',{translatedTitle:chinese.title,toc,head:'<link rel="stylesheet" href="/en/resources/assets/study-guides.css"><link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css">'});
  guideRows.push({id:'guide-'+digest(page.file).slice(0,12),title:page.title,chinese:chinese.title,aliases:[chinese.title,chinese.guide.summary],url:href(page.file),summary:page.guide.summary,area:areas[page.guide.area]?.title||page.guide.area,type:'guides'});
 }
 // The weekly entrance retains every real file and future-week slot, without its old duplicate theme script.
 const weeklyFile='notes/mathematical-notes/weekly.html',weeklyOld=read(weeklyFile);const weeklyScript=weeklyOld.match(/const courses=[\s\S]*?(?=const root=document.documentElement)/)?.[0]||(fs.existsSync(path.join(root,'resources/assets/weekly-entrance.js'))?read('resources/assets/weekly-entrance.js'):'');
 if(weeklyScript){save('resources/assets/weekly-entrance.js',weeklyScript);addPage(weeklyFile,'Weekly Notes','<p id="title" class="weekly-course">Weekly Notes</p><p id="subtitle" class="muted">Choose a week</p><p>'+link('page.html','Back to course notes')+'</p><section><h2 id="heading">Available weeks</h2><div class="weeks" id="weeks"></div><p id="empty" hidden>No materials are available for this category yet.</p></section><noscript><p>'+link('/en/notes/mathematical-notes/calculus/MAweek1.html','Calculus — week 1')+' · '+link('/en/notes/mathematical-notes/calculus/MAweek2.html','Calculus — week 2')+' · '+link('/en/notes/mathematical-notes/linear-algebra/LAweek1.html','Linear algebra — week 1')+'</p></noscript>','directory',{scripts:['/en/resources/assets/weekly-entrance.js']})}
 if(read(weeklyFile).includes('portal-content:start'))save(weeklyFile,read(weeklyFile).replace('<h1>Weekly Notes</h1>','<h1 id="title">Weekly Notes</h1>').replace(/<p id="title" class="weekly-course">[\s\S]*?<\/p>/,''));
 // Home remains a personal page; repair malformed contact markup without changing its content.
 const homeOld=read('index.html');let homeBody=bodyOf(homeOld);homeBody=homeBody.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace('</p></section> · <a href="https://jiayuchen-math.github.io/mathpi/"',' · <a href="https://jiayuchen-math.github.io/mathpi/"');
 homeBody=homeBody.replace(/<p\b(?=[^>]*\bclass="tagline")[^>]*>[\s\S]*?<\/p>/g,'');
 const homeCopy='<p class="tagline" id="home-tagline">Undergraduate mathematics student</p>'+homeBody;
 addPage('index.html','Jiayu Chen',homeCopy+translationPayload(homeTranslationBlocks(homeCopy)),'home');
 const hubGroups=[
  ['learn','Learn Mathematics',[
   ['Learning paths','/en/resources/library-paths/','Follow a direction from its first questions to more advanced reading.'],
   ['Study advice','/en/resources/links/study-advice.html','Reading books, working through proofs, writing and beginning research.'],
   ['Algebraic geometry topics','/en/resources/topics/algebraic-geometry/','From a first scheme course to later branches, with readings and the background each one needs.'],
  ]],
  ['reference','Reference & Reading',[
   ['Library','/en/notes/reading-notes/library/catalogue.html',`${books.length} books, lecture notes and papers. Free-to-read material is selected by default.`],
   ['Encyclopedia','/en/resources/encyclopedia/','Concept explanations and guides to open references.'],
   ['Terminology & Translations','/en/resources/terminology/','English–Chinese terms, their meanings and distinctions.'],
   ['Web resources','/en/resources/links/','Courses, archives, tools and mathematical communities.'],
   ['Contribute or report an issue','/en/resources/encyclopedia/contributing.html','Suggest a correction, recommend a resource, or propose a short article.'],
  ]],
  ['careers','Study & Careers',[
   ['Programs','/en/resources/study-careers/','Search degree and research routes by destination, level and application time.'],
   ['Researchers','/en/resources/study-careers/researchers.html','Find published research interests and official contact information.'],
   ['Application guides & experiences','/en/resources/study-careers/guides.html','Preparation guidance, with a separate collection of applicant accounts.'],
  ]],
 ];
 const searchForm=`<form action="/en/resources/search/" class="hub-search"><label for="hub-q">Search across the collection</label><div><input id="hub-q" name="q" type="search" placeholder="A concept, author, research topic or university"><button>Search</button></div></form>`;
 const subjectLandings={foundations:'foundations.html',algebra:'algebra.html',analysis:'analysis.html','geometry-topology':'geometry-topology.html','number-theory':'number-theory.html',combinatorics:'discrete-mathematics.html',probability:'probability-dynamics/probability.html',dynamics:'probability-dynamics/dynamics.html','category-theory':'algebra/category-theory.html'};
 const tasks='<nav aria-label="Start here"><ul class="task-links">'+[['/en/notes/reading-notes/library.html','Find course materials'],['/en/resources/library-paths/','Understand a subject'],['/en/resources/search/?type=encyclopedia','Look up a concept'],['/en/resources/study-careers/','Prepare for further study']].map(([url,label])=>'<li>'+link(url,label)+'</li>').join('')+'</ul></nav>';
 const hubBody=`<p>Texts, ideas and pathways for learning mathematics.</p>${searchForm}${tasks}<section id="subjects" class="hub-subjects"><h2>Explore by subject</h2><ul class="subject-links">${Object.entries(areas).map(([id,a])=>'<li>'+link('/en/notes/reading-notes/library/'+subjectLandings[id],a.title)+'</li>').join('\n')}</ul></section>${hubGroups.map(([id,label,cards])=>`<section class="resource-group" id="${id}"><h2>${E(label)}</h2><div class="cards">${cards.map(([title,url,description])=>`<section class="card"><h3>${link(url,title)}</h3><p>${E(description)}</p></section>`).join('')}</div></section>`).join('')}${renderRevisionList(learningEdition.revisions)}<p class="personal-notes-link">Looking for my own work? ${link('/en/notes/','Personal notes')}.</p>`;
 const hubChinese=translateEntranceHTML(hubBody),hubNote={en:'Begin with a course guide when you want to study, and a concept entry when a particular word is blocking the reading. The topic page is a selected route through existing material, not another copy of the library.',zh:'想系统学一门课，可以先看学科学习说明；只是读到一个不熟悉的词，就先查概念。专题页从已有资料中做选择，不再复制一份书库。'};
 bilingualPage('resources/index.html',{title:'Mathematics Resources',body:hubBody+compilationRecord(hubNote)},{title:'数学资源',body:hubChinese.html+compilationRecord({...hubNote,locale:'zh'})},'directory',{untranslated:hubChinese.untranslated.length});
 const workIds=Object.fromEntries(books.map(book=>[stable('library',book.url.replace(/\/$/,'')),book]));
 const topicArgs={books,workIds,knowledge,readings:conceptReadings};
 const agTopic=algebraicGeometryTopic(topicArgs),agChinese=algebraicGeometryTopic({...topicArgs,locale:'zh'}),agFile='resources/topics/algebraic-geometry/index.html';
 bilingualPage(agFile,agTopic,agChinese,'article',{head:'<link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css">'});
 guideRows.push({id:'guide-'+digest(agFile).slice(0,12),title:agTopic.title,chinese:agChinese.title,aliases:agTopic.aliases,url:href(agFile.replace(/index\.html$/,'')),summary:agTopic.summary,area:areas.algebra.title,type:'guides'});
 const contributionFile='resources/encyclopedia/contributing.html',contribution=contributionHub({}),contributionChinese=contributionHub({locale:'zh'});
 coverageRecords.set(contributionFile,translationCoverage(contributionFile,{title:contribution.title,body:contribution.body},approvals));
 contribution.body+=coverageTable(coverageRecords);contributionChinese.body+=coverageTable(coverageRecords,'zh');
 contribution.contents.push({id:'translation-coverage',label:'Translation coverage'});contributionChinese.contents.push({id:'translation-coverage',label:'本轮翻译范围'});
 bilingualPage(contributionFile,contribution,contributionChinese,'article');
 const personalNotes=personalNotesPage();
 bilingualPage('notes/index.html',personalNotes.english,personalNotes.chinese,'directory',{head:personalNotes.head});
 const notes=[];for(const file of walk('notes/mathematical-notes').filter(f=>/\/(?:MAweek\d+|LAweek\d+)\.html$/.test(f))){const html=read(file);notes.push({id:'note-'+digest(file).slice(0,12),type:'notes',title:text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||path.basename(file)),url:href(file),summary:brief(text(html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1]||''),180),area:file.includes('calculus')?areas.analysis.title:areas.algebra.title})}
 // Keep individual notes searchable and saveable without duplicating the
 // existing course/week entrances on the personal-notes landing page.
 const searchCollections=collections.map(c=>({...c,rows:c.rows.map(r=>{const item={id:r.id,type:c.id,title:r.title,url:r.url,summary:brief(r.summary,160),area:r.fields.area||r.fields.topic||'',topics:r.fields.topic||r.fields.area||'',...r.chinese?{chinese:r.chinese}:{},...r.aliases?.length?{aliases:Array.isArray(r.aliases)?r.aliases:[r.aliases]}:{}};if(c.id==='library'||c.id==='links')item.author=r.subtitle;else if(r.author)item.author=r.author;if(c.id==='researchers')item.institution=r.subtitle;if(c.id==='programs')item.institution=programs.find(p=>p.id===r.id)?.institution||r.subtitle;if(r.termUrl)item.termUrl=r.termUrl;if(r.encyclopediaUrl)item.encyclopediaUrl=r.encyclopediaUrl;return item})}));
 function areaForTopic(topic){
  if(topic.id==='category-theory')return areas['category-theory'].title;
  if(topic.group==='discrete-mathematics')return areas.combinatorics.title;
  if(topic.group==='probability-dynamics')return /dynam|ergod/i.test(topic.id)?areas.dynamics.title:areas.probability.title;
  return areas[topic.group]?.title||'';
 }
 for(const collection of searchCollections)for(const r of collection.rows){
  if(collection.id==='library'){const source=libraryRows.find(b=>b.id===r.id);r.summary=strings([source.fields.readingAccess,source.fields.access])+' — '+brief(source.summary,145);}
  if(collection.id==='library')r.area=[...new Set(merged.topics.filter(t=>r.topics.split('|').includes(t.title)).map(areaForTopic))].join('|');
  if(!r.area||!r.area.split('|').every(name=>Object.values(areas).some(a=>name===a.title))){
   const domain=String(r.area+' '+r.topics+' '+r.summary).toLowerCase();
   r.area=Object.entries({foundations:/logic|foundation|set theory|computab|model theory/,algebra:/algebra|arithmetic geometry/,analysis:/analy|pde|differential equation|calculus/,'geometry-topology':/geometr|topolog|homotop/,'number-theory':/number theory|arithmetic|automorphic/,probability:/probab|stochast|statisti/,combinatorics:/combina|discrete|graph theory/,dynamics:/dynam|ergod/,'category-theory':/categor|topos/}).filter(([,pattern])=>pattern.test(domain)).map(([id])=>areas[id].title).join('|');
  }
 }
 searchCollections.push({id:'notes',label:'Personal Notes',url:'/en/notes/mathematical-notes/page.html',rows:notes},{id:'guides',label:'Guides & Reading Paths',url:'/en/resources/library-paths/',rows:guideRows});
 const learningEntries=searchCollections.filter(c=>['library','encyclopedia','notes','guides'].includes(c.id)).flatMap(c=>c.rows.filter(r=>c.id!=='guides'||r.url.startsWith('/en/resources/library-paths/')||r.url.startsWith('/en/resources/topics/')).map(r=>({...r,...(c.id==='library'?{readingUrl:libraryRows.find(b=>b.id===r.id).readingUrl}:{})})));
 const tools=createLearningTools({learningEntries,programs});
 for(const file of tools.files)if(!file.file.startsWith('resources/assets/'))save(file.file,file.content);
 for(const page of tools.pages){
  const head=(page.head||'').replace(/<link\b[^>]*href="[^\"]*\/learning-tools\.css[^\"]*"[^>]*>/g,'');
  const scripts=(page.scripts||[]).filter(script=>String(typeof script==='string'?script:script.src).split('?')[0]!=='/en/resources/assets/learning-tools.js');
  addPage(page.file,page.title,page.body,'directory',{head,scripts});
 }
 const meanings={};
 for(const stem of ['normal','regular','complete','compact','proper','simple','dual']){
  const senses=knowledge.terms.filter(t=>t.english.toLowerCase().split(/\s+/).includes(stem)||(t.aliases||[]).some(a=>a.toLowerCase().split(/\s+/).includes(stem))).map(t=>({id:t.id,english:t.english,chinese:t.chinese,topic:topicTitle(t.topic)}));
  if(senses.length>1)meanings[stem]=senses;
 }
 // Explicitly selected ambiguous expressions, not arbitrary name prefixes.
 for(const prefix of ['正规','正则','完全','完备','紧致','简单','可分','独立','连通','对偶']){
  const senses=knowledge.terms.filter(t=>t.chinese.startsWith(prefix));
  if(prefix.length===2&&senses.length>1&&senses.length<12&&new Set(senses.map(t=>t.topic)).size>1)meanings[prefix]=senses.map(t=>({id:t.id,english:t.english,chinese:t.chinese,topic:topicTitle(t.topic)}));
 }
 save('resources/search/meanings.json',JSON.stringify(meanings));
 const manifests=[];let indexBytes=0;for(const c of searchCollections){const file=`resources/search/index/${c.id}.json`,data=JSON.stringify(c.rows);save(file,data);indexBytes+=Buffer.byteLength(data);manifests.push({id:c.id,label:c.label,url:c.url,index:href(file)})}
 const manifest={version:digest(JSON.stringify(searchCollections.map(c=>c.rows))).slice(0,16),collections:manifests};save('resources/search/manifest.json',JSON.stringify(manifest));
 addPage('resources/search/index.html','Search',`<form id="unified-search" class="controls" role="search"><label for="global-q">Search mathematics resources</label><input id="global-q" name="q" type="search" autocomplete="off" placeholder="English, 中文, an author or a research topic"><div class="portal-filters"><label for="global-type">Content type<select id="global-type" name="type"><option value="">All types</option>${manifests.map(m=>`<option value="${m.id}">${E(m.label)}</option>`).join('')}</select></label><label for="global-area">Subject<select id="global-area" name="area"><option value="">All subjects</option>${Object.values(areas).map(a=>`<option>${E(a.title)}</option>`).join('')}</select></label></div><button type="submit">Search</button> <button type="reset">Clear</button></form><div class="search-chips chips"></div><p id="search-count" role="status" aria-live="polite" tabindex="-1">Search titles, concepts, people and institutions.</p><div id="search-results"></div><nav id="search-pages" class="static-pagination" aria-label="Search result pages"></nav><section class="search-browse"><h2>Browse the collection</h2><ul>${manifests.map(m=>`<li>${link(m.url,m.label)}</li>`).join('')}</ul></section><noscript><p>Use the category links above to browse every entry. Keyword search requires JavaScript.</p></noscript>`,'directory',{scripts:['/en/resources/assets/unified-search.js']});
 save(registryFile,JSON.stringify(registry,null,2)+'\n');
 report.indexBytes=indexBytes;report.searchCollections=searchCollections.map(c=>({id:c.id,records:c.rows.length}));
 report.directoryIndexBytes=report.directories.reduce((n,c)=>n+Buffer.byteLength(read(`resources/catalogue-data/${c.id}/index.json`)),0);
 report.limits={firstPageHTML:350*1024,searchIndex:2*1024*1024};
 const translationPages=[...coverageRecords].sort(([a],[b])=>a.localeCompare(b)).map(([file,coverage])=>({file,...coverage}));
 save('resources/data/translation-coverage.json',JSON.stringify({version:1,note:'Build inventory, not a claim of human review. Partial translations identify their scope; source revisions are explicitly approved, never refreshed by the build.',pages:translationPages},null,2)+'\n');
 report.translationCoverage=Object.fromEntries(['body-translated','partly-translated','interface-only','needs-review'].map(status=>[status,translationPages.filter(p=>p.status===status).length]));
 for(const [file,hash] of protectedFiles)if(digest(protectedBytes(fs.readFileSync(path.join(root,file)),file))!==hash)throw Error('Protected note changed: '+file);
 for(const d of report.directories)if(d.firstPageBytes>report.limits.firstPageHTML)throw Error(`${d.id} first page exceeds 350KB: ${d.firstPageBytes}`);
 if(indexBytes>report.limits.searchIndex)throw Error(`Search index exceeds 2MB: ${indexBytes}`);
 save('resources/portal-report.json',JSON.stringify(report,null,2)+'\n');
 console.log('Portal UI:',JSON.stringify({counts:report.counts,indexBytes,directories:report.directories}));
}
