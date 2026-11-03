import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL('./data/'+name,import.meta.url),'utf8'));
export const bananaWorks=read('library-banana.json');
export const bananaSupplements=read('library-banana-supplements.json');
export const bananaAudit=read('library-banana-audit.json');
export const priorLibraryFiles=Object.fromEntries(Object.entries(bananaAudit.snapshots).map(([file,e])=>[file,e.archive]));
export function enrichFromBanana(book){return {...book,...(bananaSupplements[book.url.replace(/\/$/,'')]||{})};}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const subjectBooks={
 'real-analysis':['数学分析'],'linear-algebra':['线性代数'],
 'abstract-algebra':['抽象代数','代数学讲义'],'point-set-topology':['拓扑学'],
 'algebraic-topology':['代数拓扑基础'],'probability':['概率与数理统计']
};
const routeBooks={'analysis-pde':['数学分析'],'complex-harmonic-analysis':['数学分析'],'representation-theory':['抽象代数'],'topology':['拓扑学','代数拓扑基础'],'probability':['概率与数理统计'],'algebraic-geometry':['代数学讲义']};
const paired=(en,zh)=>'<span data-language-content="en">'+en+'</span><span data-language-content="zh" lang="zh-Hans" hidden>'+zh+'</span>';
export function bananaStudyReading(file){
 const route=file.match(/^resources\/library-paths\/routes\/([^/]+)\.html$/)?.[1];
 const subject=file.match(/^notes\/reading-notes\/library\/(?:[^/]+\/)*([^/]+)\.html$/)?.[1];
 const names=routeBooks[route]||subjectBooks[subject];if(!names)return '';
 const entries=names.map(name=>bananaWorks.find(b=>b.originalTitle===name));
 return '<!-- banana-study:start --><section class="supplementary-reading"><h2>'+paired('Chinese lecture notes','中文讲义')+'</h2><ul>'+entries.map(b=>{
  if(!b)throw Error('Missing supplementary lecture');
  const link='<a href="'+escape(b.url)+'" target="_blank" rel="noopener noreferrer">'+escape(b.originalTitle)+'</a>';
  return '<li><p>'+link+' — '+escape(b.author)+'. '+paired(escape(b.use),escape(b.translation.use))+'</p></li>';
 }).join('')+'</ul></section><!-- banana-study:end -->';
}
