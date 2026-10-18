// Compiled translations of this page, not generated or fetched translations.
// Reuse the same elements and canonical anchors in both languages.
export function createPageTranslator(doc){
 const source=doc.getElementById('page-translations');if(!source)return null;
 const data=JSON.parse(source.textContent),saved=new Map();
 if(data.version!==1||!data.blocks||typeof data.blocks!=='object')throw Error('Invalid page translation data');
 const translate=language=>{
  for(const [id,html]of Object.entries(data.blocks)){
   const target=doc.getElementById(id);if(!target)continue;
   let state=saved.get(id);
   if(!state){state={english:target.innerHTML,language:'en',lang:target.getAttribute('lang')};saved.set(id,state)}
   if(state.language===language)continue;
   const open=[...target.querySelectorAll('details')].map(d=>d.open);
   target.innerHTML=language==='zh'?html:state.english;
   target.querySelectorAll('details').forEach((d,i)=>{if(i<open.length)d.open=open[i]});
   if(language==='zh')target.setAttribute('lang','zh-Hans');else if(state.lang)target.setAttribute('lang',state.lang);else target.removeAttribute('lang');
   state.language=language;
  }
 };
 translate.coverage=data.coverage||{status:data.blocks['study-guide']?'partly-translated':'body-translated',scope:data.blocks['study-guide']?'learning-sections':'page'};
 return translate;
}
