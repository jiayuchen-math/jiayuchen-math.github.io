// Page-specific annotations: preserve original titles, authors and access facts.
const {dictionary,records}=await import('./library-copy-data.js?v='+new URL(import.meta.url).searchParams.get('data'));
const translate=value=>{
 if(dictionary[value])return dictionary[value];
 const parts=value.split(' · ');if(parts.length>1)return parts.map(translate).join(' · ');
 for(const [prefix,zh] of [['Preparation: ','先修：'],['Use: ','用途：'],['Access: ','获取方式：'],['Version: ','版本：'],['Free edition: ','免费版本：'],['Checked ','原核查：'],['Legacy entry retained from ','保留的旧条目，原记录日期：'],['Original title: ','原文题名：']])if(value.startsWith(prefix))return zh+translate(value.slice(prefix.length));
 return value;
};
const managed=new Map();let queued=false;
const observer=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(apply)}});
function apply(){
 queued=false;observer.disconnect();const zh=document.documentElement.dataset.interfaceLanguage==='zh';
 document.querySelectorAll('article.portal-entry').forEach(article=>{
  if(!records[article.id])return;
  const walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   if(node.parentElement.closest('h2,h3,script,style,code,pre,textarea,[data-language-content]'))continue;
   const source=node.textContent,trimmed=source.trim(),translated=translate(trimmed);if(trimmed===translated)continue;
   const fragment=document.createDocumentFragment(),en=document.createElement('span'),cn=document.createElement('span');
   en.dataset.languageContent='en';en.textContent=source;cn.dataset.languageContent='zh';cn.lang='zh-Hans';cn.textContent=source.replace(trimmed,translated);
   en.hidden=zh;cn.hidden=!zh;fragment.append(en,cn);node.replaceWith(fragment);managed.set(en,cn);
  }
 });
 for(const [en,cn]of managed){if(!en.isConnected){managed.delete(en);continue;}en.hidden=zh;cn.hidden=!zh;}
 observer.observe(document.body,{subtree:true,childList:true});
}
document.addEventListener('interface-language-change',apply);apply();
