import {decodeHTML} from 'entities';
import {escape as E} from './knowledge-markdown.mjs';
import {subjectTranslations} from './subject-translations.mjs';

const text={
 'Start here':'从这里开始','Library view':'书库浏览方式',
 'Texts, ideas and pathways for learning mathematics.':'数学学习用得上的书、讲义、概念说明和阅读路线。',
 'Search across the collection':'搜索站内资料','Search':'搜索','A concept, author, research topic or university':'概念、作者、研究主题或学校',
 'Find course materials':'找课程资料','Understand a subject':'了解一个方向','Look up a concept':'查概念','Prepare for further study':'准备升学',
 'Explore by subject':'按学科浏览','Foundations & Logic':'基础与逻辑','Algebra & Algebraic Geometry':'代数与代数几何','Analysis, Measure & PDE':'分析、测度与偏微分方程','Geometry & Topology':'几何与拓扑','Number Theory':'数论','Probability':'概率论','Combinatorics':'组合数学','Dynamical Systems':'动力系统','Category Theory':'范畴论',
 'Learn Mathematics':'学习数学','Learning paths':'学习路线','Follow a direction from its first questions to more advanced reading.':'从一个方向的起步问题，读到更深入的内容。',
 'Study advice':'学习建议','Reading books, working through proofs, writing and beginning research.':'读书、做证明、写作，以及开始接触研究时的建议。',
 'Reference & Reading':'参考与阅读','Library':'书库','Encyclopedia':'数学百科','Concept explanations and guides to open references.':'概念解释，以及指向公开资料的阅读导引。',
 'Terminology & Translations':'术语译解','English–Chinese terms, their meanings and distinctions.':'中英数学术语、具体含义与容易混淆的用法。','Web resources':'网络资源','Courses, archives, tools and mathematical communities.':'课程、资料档案、工具和数学社区。',
 'Study & Careers':'升学与学术发展','Programs':'申请项目','Search degree and research routes by destination, level and application time.':'按国家、学位和申请时间寻找项目。',
 'Researchers':'导师目录','Find published research interests and official contact information.':'查看公开的研究方向、任职信息和官方联系方式。',
 'Application guides & experiences':'申请指南与经历','Preparation guidance, with a separate collection of applicant accounts.':'申请准备建议，以及单独整理的申请经历。',
 'Recently edited':'最近修订','Added a pilot guide from calculations to proofs':'新增“从计算到证明”指南',
 'Created an original study guide with an explicit convergence proof, a parameter check, and a kernel argument; recorded primary reading references and AI-assisted draft attribution.':'用收敛证明、参数讨论和核的例子说明怎样把计算写成证明，并记录资料来源与 AI 辅助起草说明。',
 'Added a reading guide connecting covers and Galois theory':'新增覆盖空间与伽罗瓦理论导读',
 'Created a comparison of subgroup correspondences with classical topological hypotheses, finite Galois assumptions, and the distinction between connected and regular covers.':'比较两套子群对应，写明拓扑空间与有限伽罗瓦扩张的假设，并区分连通覆盖和正规覆盖。',
 'Added a reading guide from linear functionals to analytic duality':'新增线性泛函与对偶导读',
 'Created a guide distinguishing algebraic and continuous duals, the canonical finite-dimensional bidual isomorphism, and Banach-space reflexivity, with explicit examples and sources.':'通过具体例子区分代数对偶、连续对偶、有限维双对偶同构和 Banach 空间的自反性，并列出参考来源。',
 'Looking for my own work?':'想看我自己的笔记？','Personal notes':'个人笔记','Mathematics Resources':'数学资源',
 'Algebraic geometry topics':'代数几何专题','From a first scheme course to later branches, with readings and the background each one needs.':'从第一门概形课程到后续分支，按问题找读物，也看看各自需要哪些准备。',
 'Contribute or report an issue':'投稿与纠错','Suggest a correction, recommend a resource, or propose a short article.':'指出具体错误、推荐资料，或者提出一篇短文的想法。',
 'Books, lecture notes and mathematical writing, grouped by subject.':'按学科整理的书籍、讲义和数学文章。',
 'Search the catalogue':'检索书库','Subject cards':'学科卡片','Browse the library':'浏览书库','Search & filter all resources':'检索与筛选全部资料',
 '— free full text is selected by default; use Reading access to include institutional or purchase references.':'——默认只显示可免费阅读全文的资料；如需查看机构权限或购买类资料，可调整获取方式筛选。',
 'Essays & Popular Mathematics':'数学随笔与科普','— mathematical ideas, stories and viewpoints.':'——数学想法、故事和不同的观察角度。',
 'Card counts include distinct catalogue works listed here or explicitly cross-referenced from another subject. Further print reading is separate. A work may appear in several subjects or areas but counts only once in the complete catalogue.':'卡片数量包括直接收录和明确交叉列出的不同文献。同一文献可以出现在多个学科中，但在总目录里只计一次；纸质参考读物另列。',
 'Algebra':'代数','Analysis':'分析','Discrete Mathematics':'离散数学','Probability & Dynamics':'概率与动力系统',
 'Proofs, logic, set theory, computability and model theory':'证明、逻辑、集合论、可计算性与模型论',
 'Linear, abstract, commutative and homological algebra; categories, representations and algebraic geometry':'线性代数、抽象代数、交换代数与同调代数；范畴、表示与代数几何',
 'Calculus, real and complex analysis, measure, functional analysis, Fourier analysis and differential equations':'微积分、实分析与复分析、测度、泛函分析、Fourier 分析及微分方程',
 'Point-set and algebraic topology, differential geometry, homotopy and symplectic geometry':'点集拓扑与代数拓扑、微分几何、同伦论与辛几何',
 'Elementary, algebraic and analytic number theory; class field theory, modular forms and arithmetic geometry':'初等数论、代数数论与解析数论；类域论、模形式与算术几何',
 'Combinatorics, graphs, enumeration and generating functions':'组合、图论、枚举与生成函数',
 'Undergraduate and measure-theoretic probability, dynamical systems and ergodic theory':'本科概率与测度论概率、动力系统与遍历论',
 'How to use this library':'怎么使用书库',
 'Choose a broad area, then a subject. Each resource includes its author, level, preparation and a short reading note. Follow the title to the text or official access page.':'先选大类，再进入具体学科。每项资料附有作者、层次、先修要求和简短说明；点书名可打开正文或官方获取页面。',
 "PDFs can be read in your browser and saved using the PDF viewer's download button. Some official sources offer HTML or require one further click to reach the PDF.":'PDF 可以在浏览器中阅读，也可以用阅读器的下载按钮保存。有些官网提供 HTML，或需要再点一次才能打开 PDF。',
 'Each entry includes its suggested level and preparation.':'每项资料均列出建议层次与先修知识。',
 'Sources & access':'来源与获取方式','Use each resource’s access badge to choose a reading option.':'根据每项资料的获取状态选择阅读方式。',
 'Print references are listed under “Further print reading”.':'纸质参考书单独列在“进一步纸质阅读”中。',
 'Two older, permitted local archives remain available on the algebraic geometry and algebraic topology pages, with version and rights information. For current reading, use the official editions.':'代数几何与代数拓扑页面仍保留两份获准存档的旧版文件，并附版本与权利说明。日常阅读请优先使用官方版本。',
 'Review dates are shown with individual resources.':'核查日期随每项资料记录。',
 'Prerequisite path':'先修知识','Preparation & skip guidance':'先修要求与跳过建议','Sheaves & gluing':'层与粘合',
 'Resources, ordered from an entry point toward more demanding reading. Check each access badge before opening.':'下方书目从入门到进阶排列，获取方式随资料注明。',
 'The study guide above is translated; catalogue annotations below retain their original language.':'上面的学习说明已译为中文；下方书目简介保留原文。'
};
for(const [id,entry]of Object.entries(subjectTranslations))if(entry.title)text[({proofs:'Proofs & Mathematical Writing','commutative-algebra':'Commutative Algebra','real-analysis':'Real Analysis','linear-algebra':'Linear Algebra',calculus:'Calculus'})[id]||id]=entry.title;
export function translateEntranceHTML(html,extraLabels={},protectedText=[]){
 const dictionary={...text,...extraLabels},keep=new Set(protectedText);
 const untranslated=new Set();
 const convert=value=>{
  if(keep.has(value))return value;
  if(dictionary[value])return dictionary[value];
  if(value.endsWith('.')&&dictionary[value.slice(0,-1)])return dictionary[value.slice(0,-1)]+'。';
  let m;if((m=value.match(/^(\d+) books, lecture notes and papers\. Free-to-read material is selected by default\.$/)))return m[1]+' 项书籍、讲义与论文，默认显示可免费阅读的资料。';
  if((m=value.match(/^(\d+) broad areas · (\d+) subject pages · (\d+) distinct resources$/)))return m[1]+' 个大类 · '+m[2]+' 个学科 · '+m[3]+' 项不同资料';
  if((m=value.match(/^(\d+) resources?$/)))return m[1]+' 项资料';
  if(/^[\s·.→—\d-]+$/.test(value))return value;
  untranslated.add(value);return value;
 };
 let result=html.replace(/>([^<>]+)</g,(_,raw)=>{const value=decodeHTML(raw).trim();return '>'+(value?raw.replace(raw.trim(),E(convert(value))):raw)+'<'});
 result=result.replace(/(placeholder|aria-label)="([^"]+)"/g,(whole,key,value)=>dictionary[decodeHTML(value)]?key+'="'+E(dictionary[decodeHTML(value)])+'"':whole);
 return {html:result,untranslated:[...untranslated]};
}
export function simplifyLibraryEntrance(body){
 let cleaned=body.replace(/<section class="editorial-record">[\s\S]*?<\/section>/g,'').replace(/<!-- resources-overview:start -->[\s\S]*?<!-- resources-overview:end -->/g,'').trim();
 // The legacy generator appends its overview after the translated container.
 // Strip that generated block first, then unwrap, so rebuilds stay idempotent.
 while(/^<div id="entrance-copy">[\s\S]*<\/div>$/.test(cleaned))cleaned=cleaned.replace(/^<div id="entrance-copy">([\s\S]*)<\/div>$/,'$1').trim();
 return cleaned
  .replace(/<p>A reading library for mathematics students:[\s\S]*?<\/p>/,'<p>Books, lecture notes and mathematical writing, grouped by subject.</p>')
  .replace(/<p><a href="library\/catalogue\.html">Browse all books and search by title, author or subject →<\/a><\/p>/,'<nav class="library-view-switch" aria-label="Library view"><a href="library/catalogue.html">Search the catalogue</a><a href="library.html" aria-current="page">Subject cards</a></nav>');
}
