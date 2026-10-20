// Course text is rendered from the supplied Markdown; PDF and TeX stay untouched.
import fs from 'node:fs';import path from 'node:path';import {createHash}from'node:crypto';import{fileURLToPath}from'node:url';
import {createMarkdown,escape}from'./knowledge-markdown.mjs';
import katex from 'katex';
export const noteDirectory='notes/mathematical-notes/calculus';
const imageLabels={'w3-secant':'Secant and tangent slopes','w3-oscillation':'Oscillating functions near zero','w3-differential':'Differential and function increment','w4-local-global':'Local and global extrema','w4-refraction':'Refraction and least travel time','w4-rolle':"Rolle's theorem",'w4-oscillation':'Oscillation of the derivative','w4-convex':'Convexity and tangent lines','w4-cuberoot':'The cube-root curve','w4-sketch':'Curve sketch for a rational function','w4-newton':"Newton's method",'w5-riemann':'A tagged Riemann sum','w5-upper-lower':'Upper and lower Riemann sums'};
export function renderCourseNote(raw,week){
 const normalized=raw.replaceAll('\r\n','\n'),front=normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!front)throw Error('Missing note metadata');
 const subtitle=front[1].match(/^subtitle:\s*"([^"]+)"$/m)?.[1]||'';
 const imageWidths=new Map();
 const body=front[2].replace(/^\\newpage\s*$/gm,'').replace(/!\[([^\]]*)\]\(([^)]+)\)\{width=(\d+)%\}/g,(_,alt,url,width)=>{imageWidths.set(url,Number(width));return '!['+alt+']('+url+')'});
 const md=createMarkdown(),math=[],images=[],contents=[],used=new Set();
 // KaTeX does not accept TeX's @{} array spacing. Remove only that visual
 // separator; preserve every cell and keep the exact original TeX annotation.
 const renderMath=(source,display)=>katex.renderToString(source.replaceAll('@{\\qquad}',''),{displayMode:display,throwOnError:true,trust:false,strict:'error',output:'htmlAndMathml'}).replace(/<annotation encoding="application\/x-tex">[\s\S]*?<\/annotation>/,'<annotation encoding="application/x-tex">'+escape(source)+'</annotation>');
 md.renderer.rules.math_inline=(tokens,i)=>renderMath(tokens[i].content,false);
 md.renderer.rules.math_block=(tokens,i)=>'<div class="formula">'+renderMath(tokens[i].content,true)+'</div>\n';
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
 const html=md.renderer.render(tokens,md.options,{});
 return {html,subtitle,contents,math,images,body};
}
const css=`:root{--bg:#fff;--text:#242424;--muted:#6b7280;--link:#1458a6;--line:#e5e7eb;--box:#f8fafc}:root.dark{--bg:#15171a;--text:#e8eaed;--muted:#a6adb8;--link:#8ab4f8;--line:#30343b;--box:#1b1f24}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.8 Georgia,"Times New Roman","Noto Serif SC",serif}main{width:min(760px,calc(100% - 40px));margin:auto;padding:46px 0 80px}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:26px}h1{font-size:clamp(26px,5vw,36px);line-height:1.25;margin:0;font-weight:600}h2{font-size:25px;margin:36px 0 12px}h3{font-size:21px;margin:27px 0 9px}h4{font-size:18px;margin:22px 0 7px}p{margin:8px 0 14px}.subtitle{color:var(--muted)}a{color:var(--link);text-decoration:underline;text-underline-offset:3px}a:focus-visible,button:focus-visible,summary:focus-visible{outline:2px solid var(--link);outline-offset:4px}.note-links{display:flex;flex-wrap:wrap;gap:8px 20px;font:15px/1.6 system-ui,sans-serif}.formula{min-width:0;overflow-x:auto;overflow-y:hidden;padding:6px 2px;margin:14px 0}.katex-display{margin:0}.formula .katex-display>.katex{white-space:nowrap}article{min-width:0;overflow-wrap:break-word}img{display:block;margin:18px auto;max-width:100%;height:auto}li{margin:4px 0}button{border:1px solid var(--line);background:transparent;color:var(--text);border-radius:6px;padding:5px 9px;cursor:pointer;font:15px/1.5 system-ui,sans-serif}.contents{margin:26px 0;border-block:1px solid var(--line);padding:12px 0}.contents summary{cursor:pointer;font:15px/1.6 system-ui,sans-serif}.contents ul{padding-left:22px}.contents li.subsection{margin-left:16px}footer{margin-top:40px;padding-top:18px;border-top:1px solid var(--line)}@media(max-width:560px){main{width:calc(100% - 28px);padding-top:28px}header{gap:12px}.katex{font-size:1.05em}h2{font-size:23px}h3{font-size:20px}}@media print{header button,.note-links,.contents{display:none}main{width:100%;padding:0}.formula{overflow:visible}a{color:inherit}}`;
export function buildCourseNotes(root){
 const report=[];
 for(const week of [3,4,5]){
  const name='MAweek'+week,raw=fs.readFileSync(path.join(root,noteDirectory,name+'.md'),'utf8'),rendered=renderCourseNote(raw,week);
  for(const url of rendered.images)if(!fs.existsSync(path.join(root,noteDirectory,url)))throw Error('Missing image '+url);
  const theme=fs.readFileSync(path.join(root,'resources/assets/theme.js')),themeVersion=createHash('sha256').update(theme).digest('hex').slice(0,12);
  const downloads=['pdf','tex','md'].map(ext=>'<a href="'+name+'.'+ext+'"'+(ext==='pdf'?' target="_blank" rel="noopener"':' download')+'>'+({pdf:'PDF',tex:'LaTeX',md:'Markdown'}[ext])+'</a>').join('\n');
  const previous=week===3?'MAweek2.html':'MAweek'+(week-1)+'.html',next=week<5?'<a href="MAweek'+(week+1)+'.html">Week '+(week+1)+' →</a>':'';
  const html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Calculus — Week '+week+' · Jiayu Chen</title><meta name="description" content="'+escape(rendered.subtitle)+'"><link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css"><style>'+css+'</style><script src="/en/resources/assets/theme.js?v='+themeVersion+'"></script></head><body><main><header><div><h1>Calculus — Week '+week+'</h1><p class="subtitle">'+escape(rendered.subtitle)+'</p></div><button id="theme-toggle" type="button">Dark</button></header><nav class="note-links" aria-label="Note formats and navigation"><a href="../weekly.html?course=calculus&amp;type=html">← Weekly notes</a>\n'+downloads+'</nav><details class="contents"><summary>Contents</summary><ul>'+rendered.contents.map(c=>'<li'+(c.level>2?' class="subsection"':'')+'><a href="#'+c.id+'">'+escape(c.label)+'</a></li>').join('\n')+'</ul></details><article class="course-note">'+rendered.html+'</article><footer><nav class="note-links" aria-label="Other weeks"><a href="'+previous+'">← Week '+(week-1)+'</a>\n'+next+'\n<a href="../page.html">Course notes</a></nav></footer></main></body></html>\n';
  // TeX's percentage widths suit a printed page but make figures too small on phones.
  const responsiveHTML=html.replace('</style>','@media(max-width:560px){article img{width:auto!important;max-width:100%}}</style>');
  fs.writeFileSync(path.join(root,noteDirectory,name+'.html'),responsiveHTML);
  report.push({week,formulas:rendered.math.length,images:rendered.images.length,headings:rendered.contents.length,htmlBytes:Buffer.byteLength(html)});
 }
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(buildCourseNotes(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'))));
