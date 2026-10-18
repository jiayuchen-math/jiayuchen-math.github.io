// Small, public navigation metadata; no profile, storage or catalogue download.
export const routeLabels={
 'algebraic-geometry':['algebraic geometry','代数几何'],
 'representation-theory':['representation theory','表示论'],
 'analysis-pde':['functional analysis and PDE','泛函分析与偏微分方程'],
 'complex-harmonic-analysis':['complex and harmonic analysis','复分析与调和分析'],
 geometry:['geometry','微分几何与辛几何'],topology:['topology and homotopy','代数拓扑与同伦论'],
 'number-theory':['number theory','数论'],logic:['logic, sets and models','逻辑、集合论与模型论'],
 probability:['probability','测度论概率'],dynamics:['dynamical systems','动力系统与遍历论'],
 combinatorics:['combinatorics','组合数学'],'higher-categories':['categories and higher structures','范畴论与高阶结构']
};
export function routeContext(value){
 const url=new URL(value,'https://jiayuchen-math.github.io/');
 const own=url.pathname.match(/^\/(?:en\/)?resources\/library-paths\/routes\/([a-z-]+)\.html$/)?.[1];
 if(own&&Object.hasOwn(routeLabels,own))return own;
 const parameter=url.searchParams.get('fromPath');
 return parameter&&Object.hasOwn(routeLabels,parameter)?parameter:'';
}
export function contextualURL(value,current,route=routeContext(current)){
 const base=new URL(current),url=new URL(value,base);
 if(url.origin!==base.origin||!route||!Object.hasOwn(routeLabels,route))return url;
 if(/^\/(?:en\/)?(?:notes\/reading-notes\/library(?:\/|\.html)|resources\/(?:encyclopedia|terminology|library-paths|topics)(?:\/|$))/.test(url.pathname)&&! /\.(?:pdf|tex|md|json|js|css|svg|png|jpg)$/i.test(url.pathname))url.searchParams.set('fromPath',route);
 return url;
}
export function publicSourcePage(value,base='https://jiayuchen-math.github.io/'){
 const origin=new URL(base);let url;try{url=new URL(value,origin)}catch{return new URL(origin.pathname,origin).href}
 if(url.origin!==origin.origin||url.username||url.password||! /^\/(?:en\/)?(?:(?:resources|notes)(?:\/|$)|(?:index\.html|disclaimer\.html)?$)/.test(url.pathname))return origin.origin+'/';
 // Do not prefill background answers, searches, personal tokens or fragments of text.
 url.search='';if(url.hash.startsWith('#:~:text='))url.hash='';
 return url.href;
}
export function issueURL(template,source,position=''){
 const allowed=['math-correction.yml','broken-link.yml','terminology-suggestion.yml','resource-recommendation.yml','article-proposal.yml','translation-correction.yml'];
 if(!allowed.includes(template))throw Error('Unknown contribution form');
 const url=new URL('https://github.com/jiayuchen-math/jiayuchen-math.github.io/issues/new');
 url.searchParams.set('template',template);url.searchParams.set('page-url',source);
 const locationFields={'math-correction.yml':'claim','broken-link.yml':'link-text','terminology-suggestion.yml':'current-claim','resource-recommendation.yml':'reading-purpose','article-proposal.yml':'location','translation-correction.yml':'location'};
 if(position)url.searchParams.set(locationFields[template],position.slice(0,300));return url;
}
if(typeof document!=='undefined'){
 const current=new URL(location.href),context=routeContext(current.href);
 const prefix=current.pathname.startsWith('/en/')?'/en/':'/';
 let queued=false;
 const chinese=()=>document.documentElement.dataset.interfaceLanguage==='zh';
 const apply=()=>{
  observer.disconnect();
  const routeNotice=document.querySelector('[data-route-context]');
  if(routeNotice&&context&&!current.pathname.endsWith('/routes/'+context+'.html')){
   const target=new URL(prefix+'resources/library-paths/routes/'+context+'.html',location.origin);
   if(chinese())target.searchParams.set('lang','zh');
   const label=chinese()?'返回'+routeLabels[context][1]+'学习路线':'Back to the '+routeLabels[context][0]+' path';
   let anchor=routeNotice.querySelector('a');if(!anchor){anchor=document.createElement('a');routeNotice.append(anchor)}
   if(anchor.href!==target.href)anchor.href=target.href;if(anchor.textContent!==label)anchor.textContent=label;routeNotice.hidden=false;
  }
  for(const anchor of document.querySelectorAll('a[href]')){
   if(anchor.closest('[data-preserve-url]')||anchor.hasAttribute('data-language-choice')||anchor.closest('[data-route-context]'))continue;
   const raw=anchor.getAttribute('href');if(!raw||raw.startsWith('#'))continue;
   const next=contextualURL(raw,location.href,context);if(anchor.href!==next.href)anchor.href=next.href;
  }
  for(const anchor of document.querySelectorAll('[data-contribute-hub]')){
   const target=new URL(prefix+'resources/encyclopedia/contributing.html',location.origin);
   target.searchParams.set('page',publicSourcePage(location.href,location.href));if(chinese())target.searchParams.set('lang','zh');
   if(anchor.href!==target.href)anchor.href=target.href;
   const label=chinese()?'投稿与纠错':'Contribute or report an issue';if(anchor.textContent!==label)anchor.textContent=label;
  }
  const referred=new URL(location.href).searchParams.get('page');
  const source=publicSourcePage(referred||location.href,location.href),position=new URL(source).hash||'Whole page / 整页';
  for(const anchor of document.querySelectorAll('[data-contribution-template]')){
   const template=anchor.dataset.contributionTemplate;if(!template)continue;
   const target=issueURL(template,source,position);if(anchor.href!==target.href)anchor.href=target.href;
  }
  observer.observe(document.querySelector('.portal-body')||document.body,{subtree:true,childList:true});
 };
 const observer=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;apply()})}});
 document.addEventListener('interface-language-change',apply);
 window.addEventListener('popstate',apply);window.addEventListener('hashchange',apply);apply();
}
export function staticRouteContext(html,route){
 return html.replace(/href="([^"]+)"/g,(whole,value)=>{
  if(!value.startsWith('/en/')||!route)return whole;
  const url=contextualURL(value.replaceAll('&amp;','&'),'https://jiayuchen-math.github.io/en/resources/library-paths/routes/'+route+'.html',route);
  return 'href="'+url.pathname+url.search.replaceAll('&','&amp;')+url.hash+'"';
 });
}
