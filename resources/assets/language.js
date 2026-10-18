import {translateUI,languageURL} from './locale-data.js?v=20261019-learning-edition';
import {createPageTranslator} from './page-translation.js?v=20261019-learning-edition';

const KEY='jiayu.interface-language.v1';
const normalize=value=>value==='zh'||value==='zh-Hans'?'zh':value==='en'?'en':'';
export function initialLanguage(url,storage){
 const requested=normalize(new URL(url).searchParams.get('lang'));
 if(requested)return requested;
 try{return normalize(storage?.getItem(KEY))||'en'}catch{return 'en'}
}

if(typeof document!=='undefined'){
 let storage;try{storage=localStorage}catch{}
 let language=initialLanguage(location.href,storage),queued=false;
 // Bookmarks from the retired companion section resolve to the same guide.
 if(location.hash==='#subject-guide-zh')history.replaceState(history.state,'',location.pathname+location.search+'#study-guide');
 try{storage?.setItem(KEY,language)}catch{}
 // Give the initial history entry an explicit language so Back can restore it.
 if(!normalize(new URL(location.href).searchParams.get('lang')))history.replaceState(history.state,'',languageURL(location.href,language));
 const originals=new WeakMap(),attributes=new WeakMap();
 const translatePage=createPageTranslator(document);
 const switcher=document.getElementById('language-toggle');
 const uiScopes='.portal-topbar,.portal-sidebar,.portal-breadcrumbs,.portal-page-header,.portal-toc,.portal-footer,.controls,.hub-search,.search-form,#unified-search,.search-chips,.search-meanings,.search-groups > section > h2,.search-groups > section > a,.search-groups > h2,.search-groups > p,.search-groups > button,.search-groups .entry-actions,.search-result .entry-actions,.search-result .result-actions,.static-pagination,.pagination,.chips,.entry-actions,.learning-actions,.learning-settings,.learning-tools label,.learning-tools button,.learning-tools select,.learning-tools [data-learning-count],.learning-tools [data-learning-page],.learning-tools [data-tool-message],.learning-tools [data-shelf-items] > p,.learning-tools [data-comparison] > p,.learning-tools th,#result-count,#search-count,#search-pages,#portal-pagination,#no-results,summary,.subject-links,.resource-group,.hub-subjects > h2,.portal-body > p,.portal-body > h2,.portal-body > h3,.subject-guide h2,.subject-guide h3,.reading-choice dt,.study-checks summary,form[data-background] label,form[data-background] select,form[data-background] button,form[data-background] [data-background-summary]';
 function protectedNode(node){return node.parentElement?.closest('script,style,code,pre,textarea,.katex,option[data-original-title],[data-language-content="zh"],#language-toggle,.portal-entry h2,.portal-entry h3,.reading-choice h4,.article-body,.direction-introduction,.learning-results h3,.learning-saved h3,.learning-comparison thead a')}
 function translateText(node){
  if(protectedNode(node))return;
  let record=originals.get(node);
  if(!record||node.nodeValue!==record.last)record={original:node.nodeValue,last:node.nodeValue};
  const text=record.original,trimmed=text.trim(),translated=translateUI(trimmed,language);
  const next=trimmed?text.replace(trimmed,translated):text;
  if(node.nodeValue!==next)node.nodeValue=next;
  record.last=next;originals.set(node,record);
 }
 function translateAttribute(node,name){
  let values=attributes.get(node);if(!values){values={};attributes.set(node,values)}
  const current=node.getAttribute(name);if(!current)return;
  let record=values[name];if(!record||current!==record.last)record={original:current,last:current};
  const next=translateUI(record.original,language);if(current!==next)node.setAttribute(name,next);
  record.last=next;values[name]=record;
 }
 function managedPage(url){
  return url.origin===location.origin&&/^\/(?:en\/)?(?:(?:resources|notes)(?:\/|$)|(?:index\.html|disclaimer\.html)?$)/.test(url.pathname)
   &&! /\.(?:pdf|tex|md|json|png|jpe?g|svg|css|js|zip)$/i.test(url.pathname);
 }
 function apply(){
  observer.disconnect();
  translatePage?.(language);
  document.documentElement.lang=language==='zh'?'zh-Hans':'en';document.documentElement.dataset.interfaceLanguage=language;
  for(const scope of document.querySelectorAll(uiScopes)){
   if(scope.closest('[data-language-content="zh"]'))continue;
   for(const option of scope.querySelectorAll('option'))if(!option.hasAttribute('value'))option.value=option.textContent;
   const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let node;
   while((node=walker.nextNode()))translateText(node);
   for(const node of [scope,...scope.querySelectorAll('[aria-label],[placeholder],[title]')])for(const name of ['aria-label','placeholder','title'])translateAttribute(node,name);
  }
  for(const block of document.querySelectorAll('[data-language-content]'))block.hidden=block.dataset.languageContent!==language;
  for(const link of document.querySelectorAll('.portal-toc a[href^="#"]')){
   const target=document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
   const item=link.closest('li');if(item&&target?.closest('[data-language-content="en"]'))item.hidden=language==='zh';
  }
  if(switcher){switcher.hidden=false;switcher.textContent=language==='zh'?'English':'中文';switcher.lang=language==='zh'?'en':'zh-Hans';switcher.setAttribute('aria-label',language==='zh'?'Switch interface to English':'切换为简体中文界面');switcher.title=language==='zh'?'English interface':'简体中文界面'}
  const notice=document.getElementById('language-content-status');
  if(notice){
   const status=translatePage?.coverage?.status;
   notice.hidden=language!=='zh'||status==='body-translated';
   notice.textContent=status==='needs-review'?'本页译文待复核；英文内容已有变化，请对照原文阅读。':status==='partly-translated'?'学习说明已译；书目简介等内容保留原文。':'中文界面；正文与引用保留原文。';
  }
  for(const anchor of document.querySelectorAll('a[href]')){
   if(anchor.closest('[data-preserve-url]')||anchor.hasAttribute('data-language-choice'))continue;
   const raw=anchor.getAttribute('href');if(!raw||raw.startsWith('#'))continue;
   try{const url=new URL(raw,location.href);if(managedPage(url)){const next=languageURL(url,language).href;if(anchor.href!==next)anchor.href=next}}catch{}
  }
  for(const anchor of document.querySelectorAll('[data-language-choice]')){anchor.href=languageURL(location.href,anchor.dataset.languageChoice).href}
  for(const form of document.querySelectorAll('form[action]')){
   try{if(!managedPage(new URL(form.action,location.href)))continue}catch{continue}
   if((form.method||'get').toLowerCase()!=='get')continue;
   let field=form.querySelector('input[name="lang"]');if(!field){field=document.createElement('input');field.type='hidden';field.name='lang';form.append(field)}field.value=language;
  }
  observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
 }
 const observer=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;apply()})}});
 function setLanguage(next,push=false){
  language=next;try{storage?.setItem(KEY,next)}catch{}
  if(push)history.pushState(history.state,'',languageURL(location.href,next));
  apply();document.dispatchEvent(new CustomEvent('interface-language-change',{detail:{language:next}}));
 }
 switcher?.addEventListener('click',()=>setLanguage(language==='en'?'zh':'en',true));
 window.addEventListener('popstate',()=>setLanguage(initialLanguage(location.href,storage)));
 apply();
}
