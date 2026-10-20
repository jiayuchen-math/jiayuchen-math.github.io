// Render Markdown for weeks 3–5 and retain the earlier authored HTML as sources.
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
import{createMarkdown}from'./knowledge-markdown.mjs';
import{courseMath,courseNotePage,legacyCourseNote}from'./course-note-layout.mjs';
export const noteDirectory='notes/mathematical-notes/calculus';
const imageLabels={'w3-secant':'Secant and tangent slopes','w3-oscillation':'Oscillating functions near zero','w3-differential':'Differential and function increment','w4-local-global':'Local and global extrema','w4-refraction':'Refraction and least travel time','w4-rolle':"Rolle's theorem",'w4-oscillation':'Oscillation of the derivative','w4-convex':'Convexity and tangent lines','w4-cuberoot':'The cube-root curve','w4-sketch':'Curve sketch for a rational function','w4-newton':"Newton's method",'w5-riemann':'A tagged Riemann sum','w5-upper-lower':'Upper and lower Riemann sums'};
export function renderCourseNote(raw,week){
 const normalized=raw.replaceAll('\r\n','\n'),front=normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!front)throw Error('Missing note metadata');
 const subtitle=front[1].match(/^subtitle:\s*"([^"]+)"$/m)?.[1]||'',imageWidths=new Map();
 const body=front[2].replace(/^\\newpage\s*$/gm,'').replace(/!\[([^\]]*)\]\(([^)]+)\)\{width=(\d+)%\}/g,(_,alt,url,width)=>{imageWidths.set(url,Number(width));return '!['+alt+']('+url+')'});
 const md=createMarkdown(),math=[],images=[],contents=[],used=new Set();
 md.renderer.rules.math_inline=(tokens,i)=>courseMath(tokens[i].content,false);
 md.renderer.rules.math_block=(tokens,i)=>'<div class="formula">'+courseMath(tokens[i].content,true)+'</div>\n';
 const imageRule=md.renderer.rules.image;
 md.renderer.rules.image=(tokens,i,options,env,self)=>{const token=tokens[i],url=token.attrGet('src');if(!/^note-images\/[\w-]+\.png$/.test(url))throw Error('Unexpected note image: '+url);const alt=imageLabels[path.basename(url,'.png')];if(!alt)throw Error('Missing figure label: '+url);token.content=alt;token.children=[{type:'text',content:alt}];token.attrSet('alt',alt);token.attrSet('loading','lazy');token.attrSet('style','width:'+imageWidths.get(url)+'%;max-width:100%;height:auto');images.push(url);return imageRule(tokens,i,options,env,self)};
 const tokens=md.parse(body,{});
 for(let i=0;i<tokens.length;i++){
  const token=tokens[i];if(token.type==='heading_open'){
   const label=tokens[i+1].content;let id=label.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'section',n=2,base=id;while(used.has(id))id=base+'-'+n++;used.add(id);token.attrSet('id',id);const level=Math.min(6,Number(token.tag.slice(1))+1);token.tag='h'+level;tokens[i+2].tag=token.tag;contents.push({id,label,level});
  }
  if(token.type==='math_block')math.push({source:token.content,display:true});
  for(const child of token.children||[])if(child.type==='math_inline')math.push({source:child.content,display:false});
 }
 return {html:md.renderer.render(tokens,md.options,{}),subtitle,contents,math,images,body};
}
export function buildCourseNotes(root){
 const report=[],legacy=JSON.parse(fs.readFileSync(path.join(root,'resources/data/course-note-presentation.json'),'utf8')).legacy;
 for(const week of[1,2,3,4,5]){
  const name='MAweek'+week,source=legacy.find(e=>e.week===week),rendered=week<3?legacyCourseNote(fs.readFileSync(path.join(root,source.original),'utf8'),week):renderCourseNote(fs.readFileSync(path.join(root,noteDirectory,name+'.md'),'utf8'),week);
  for(const url of rendered.images||[])if(!fs.existsSync(path.join(root,noteDirectory,url)))throw Error('Missing image '+url);
  const html=courseNotePage(root,week,rendered);fs.writeFileSync(path.join(root,noteDirectory,name+'.html'),html);
  report.push({week,formulas:rendered.math.length,images:rendered.images?.length||0,headings:rendered.contents.length,htmlBytes:Buffer.byteLength(html)});
 }
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(buildCourseNotes(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'))));
