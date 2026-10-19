import {translateEntranceHTML} from './entrance-translations.mjs';
import {subjectTranslations} from './subject-translations.mjs';
import {routes,preparation} from './data/translations/routes.mjs';
import {nodes} from './data/learning-paths.mjs';
import {decodeHTML} from 'entities';
export const categoryTitles={foundations:'基础与逻辑',algebra:'代数',analysis:'分析','geometry-topology':'几何与拓扑','number-theory':'数论','discrete-mathematics':'离散数学','probability-dynamics':'概率与动力系统'};
export const interfaceTitles={'resources/search/index.html':'搜索','notes/mathematical-notes/page.html':'课程笔记','notes/reading-notes/reading-notes.html':'读书笔记'};
const goals={
 proofs:'读懂带量词的命题，练习直接证明、逆否证明、反证法与数学归纳法。',
 calculus:'学习极限、导数、积分与级数，并区分计算与论证。',
 'linear-algebra':'掌握向量空间、基、线性映射、核、秩与特征值。',
 'abstract-algebra':'学习群、环、理想、商结构与域扩张。',
 'commutative-algebra':'学习模、局部化、素理想，以及利用 Noether 条件进行论证的方法。',
 'category-theory':'通过例子理解函子、自然变换、极限与伴随。',
 'homological-algebra':'学习链复形、同调、正合列与消解。',
 'representation-theory':'先学习群在向量空间上的作用与基本的表示分解，再读 Lie 理论或张量范畴方面的资料。',
 sheaves:'在所列教材中学习限制映射、茎，以及从局部到整体的粘合条件。',
 'algebraic-geometry':'从代数簇走向概形，先选一门入门课程，再读研究层次的资料。',
 'set-theory':'学习序、基数、序数，以及公理在论证中的作用。',
 logic:'学习一阶逻辑的语法、语义、量词与证明系统。',
 'model-theory':'学习结构、初等等价、紧致性与型。',
 'real-analysis':'练习证明收敛、连续、紧致以及微分和积分的基本结论。',
 'measure-theory':'建立测度、可测函数与积分，学习收敛定理。',
 'complex-analysis':'学习全纯函数、围道积分、级数与留数。',
 'functional-analysis':'学习 Banach 空间、Hilbert 空间与有界线性算子。',
 'harmonic-analysis':'学习傅里叶方法、极大算子与奇异积分。',
 'differential-equations':'先读常微分方程与偏微分方程的具体例子，再选择弱解理论或更深入的分析路线。',
 'point-set-topology':'理解开集、连续性、积空间、商空间与紧致性。',
 'algebraic-topology':'学习基本群、覆盖空间、同调与上同调。',
 'differential-geometry':'学习光滑流形、切空间、微分形式与度量。',
 'symplectic-geometry':'先学辛形式与 Hamilton 向量场，再读 Floer 理论或接触拓扑方面的资料。',
 'elementary-number-theory':'学习整除、同余、Euclid 算法与初等的互反律例子。',
 'algebraic-number-theory':'学习数域、整数环、理想与局部算术。',
 'analytic-number-theory':'结合算术函数、渐近估计与复分析方法。',
 'modular-forms':'先学习模变换、q 展开与基本例子，再读算术应用。',
 combinatorics:'学习结构计数、递推关系与图论中的论证。',
 probability:'先学习随机变量与初等的极限现象，再进入以测度论为基础的概率论。',
 dynamics:'先学习映射、流与不变性质，再读遍历论方面的资料。'
};
const labels={
 'Home':'首页','← Back to home':'← 返回首页','← Mathematics Resources':'← 数学资源',
 'PDF':'PDF','HTML':'HTML','Exercises':'习题','First Year · First Semester':'大一 · 第一学期',
 'Personal notes from my undergraduate mathematics courses.':'本科数学课程学习笔记。',
 'This section is reserved for my personal notes written while reading mathematics. Notes will be added as they become available.':'这里收录读数学书时整理的个人笔记，之后会陆续补充。',
 'Personal Reading Notes':'个人读书笔记','No reading notes have been published yet.':'目前还没有发布读书笔记。',
 'Search mathematics resources':'搜索数学资料','English, 中文, an author or a research topic':'中文、英文、作者或研究主题',
 'Content type':'内容类型','All types':'全部类型','Subject':'学科','All subjects':'全部学科','Clear':'清除',
 'Search titles, concepts, people and institutions.':'可搜索书名、概念、研究者与学校。','Browse the collection':'按栏目浏览',
 'Use the category links above to browse every entry. Keyword search requires JavaScript.':'可通过上面的栏目链接浏览全部条目；关键词搜索需要启用 JavaScript。',
 'Mathematics Library':'数学书库','Mathematics Encyclopedia':'数学百科','Terminology & Translations':'术语译解','Web Resources':'网络资源','Study & Careers':'升学与学术发展','Researcher Directory':'导师目录','Personal Notes':'个人笔记','Guides & Reading Paths':'指南与学习路线',
 'Find a place to begin':'从哪里开始',
 'Choose a course guide for reading choices and worked checks, or follow a longer route.':'想学一门课，可以先看学习说明；想按方向往下读，可以参考学习路线。',
 'Course guides':'学科学习说明','Longer routes':'学习路线','Search all related material:':'检索相关资料：',
 'Browse or search the complete catalogue →':'检索全部书目 →',
 'Entry / bridge route':'入门与衔接','Additional preparation for research reading':'进阶阅读所需的准备','All paths':'全部学习路线',
 'Research reading: additional tools':'进阶阅读：补充工具','Compare resources in this subject':'比较本学科的读物',
 'Can skip if… / selective review':'什么情况下可以跳过','Already familiar — skip this review':'已经熟悉，跳过这部分复习',
 'Choose according to the particular text, not as an obligation to complete every foundation again.':'按具体读物补所需的内容，不必把所有基础重学一遍。',
 'Open any node directly. Marking a node familiar never locks, hides or removes links. No study progress is uploaded or stored.':'可以直接打开任一环节；勾选熟悉的内容只作标记，不会隐藏链接。进度不会上传或保存。',
 'Suggested preparation for':'所需的先修知识：',
 '. Choose an entry point that fits your preparation.':'。可以按已有基础选择起点。',
 'Direct open PDF':'PDF','Open online text / archive':'在线正文','Official page — verify access':'官网入口，全文状态待核实','Institutional / purchase access':'需机构权限或购买',
 'Editorial route reviewed 2026-10-11. Linked texts provide the material and source introductions; the route and skip advice are not claims made by every author.':'路线核查于 2026-10-11。读物提供具体内容，路线与跳过建议由本站编选。',
 'Sheaves & gluing':'层与粘合'
};
export function translateLearningEntrance(html,{topics,goalPaths,books}){
 const extra={...labels};
 for(const topic of topics){const zh=subjectTranslations[topic.id]?.title;if(!zh)throw Error('Missing subject title: '+topic.id);extra[topic.title]=zh;}
 for(const route of goalPaths)extra[route.title]=routes[route.id].title;
 for(const [id,node]of Object.entries(nodes)){
  if(!goals[id]||!preparation[id])throw Error('Incomplete prerequisite translation: '+id);
  extra[node.goal]=goals[id];extra[node.skip]=preparation[id];
 }
 // Chinese labels must not change the English values used by filters and URLs.
 html=html.replace(/<option\b([^>]*)>([^<]*)<\/option>/g,(all,attrs,label)=>/\bvalue=/.test(attrs)?all:'<option'+attrs+' value="'+label.replace(/"/g,'&quot;')+'">'+label+'</option>');
 const external=[];html=html.replace(/<a\b[^>]*href="https?:[^>]*>[\s\S]*?<\/a>/g,a=>'<!-- preserved-external-'+(external.push(a)-1)+' -->');
 const authors=books.flatMap(b=>['— '+b.author+'.','— '+b.author+'. ']);
 const result=translateEntranceHTML(html,extra,authors);
 result.html=result.html.replace(/<!-- preserved-external-(\d+) -->/g,(_,i)=>external[Number(i)]);
 return result;
}
// Translate leaf text, not the form or checkbox nodes that own application state.
export function entranceInterfaceBlocks(input,context){
 let serial=0;const blocks={},untranslated=new Set(),stack=[];
 input=input.replace(/placeholder="English, 中文, an author or a research topic"/g,'placeholder="A concept, author, research topic or university"');
 const translated=raw=>{const result=translateLearningEntrance('<span>'+raw+'</span>',context);for(const value of result.untranslated)untranslated.add(value);return result.html.slice(6,-7);};
 const html=input.replace(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g,token=>{
  if(token.startsWith('<!--'))return token;
  if(token.startsWith('<')){
   const close=token.match(/^<\/([\w-]+)/),open=token.match(/^<([\w-]+)/);
   if(close){const i=stack.findLastIndex(t=>t.tag===close[1].toLowerCase());if(i>=0)stack.splice(i);return token;}
   if(!open)return token;const tag=open[1].toLowerCase(),external=tag==='a'&&/href="https?:/i.test(token);
   if(!['input','br','hr','img','link','meta'].includes(tag)&&!token.endsWith('/>')){
    const state={tag,external};if(tag==='option'){state.id='translated-entrance-option-'+(++serial);token=token.replace(/>$/,' id="'+state.id+'">');}stack.push(state);
   }return token;
  }
  if(!token.trim()||stack.some(t=>t.external||['script','style','code','pre'].includes(t.tag)))return token;
  const parent=stack.at(-1),zh=translated(token);
  if(parent?.tag==='option'){
   blocks[parent.id]=zh;return token;
  }
  if(zh===token)return token;
  const id='translated-entrance-text-'+(++serial);blocks[id]=zh;return '<span id="'+id+'">'+token+'</span>';
 });
 // Explicit canonical values stop a Chinese option label changing search filters.
 const canonical=html.replace(/<option\b([^>]*)>([^<]*)<\/option>/g,(all,attrs,label)=>/\bvalue=/.test(attrs)?all:'<option'+attrs+' value="'+decodeHTML(label).replace(/[&"]/g,c=>c==='&'?'&amp;':'&quot;')+'">'+label+'</option>');
 return {html:canonical,blocks,untranslated:[...untranslated]};
}
