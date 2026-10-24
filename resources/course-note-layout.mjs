import fs from 'node:fs';import path from 'node:path';import {createHash}from'node:crypto';import katex from'katex';import{decodeHTML}from'entities';import{escape}from'./knowledge-markdown.mjs';
export function courseMath(source,display){return katex.renderToString(source.replaceAll('@{\\qquad}',''),{displayMode:display,throwOnError:true,trust:false,strict:'error',output:'htmlAndMathml'}).replace(/<annotation encoding="application\/x-tex">[\s\S]*?<\/annotation>/,'<annotation encoding="application/x-tex">'+escape(source)+'</annotation>')}
export function readableNoteBody(html){
 // Labels get their own line; neither the statement nor its proof is shortened.
 return html.replace(/<p>\s*(?=<strong>)/g,'<p class="note-statement">');
}
export function legacyCourseNote(raw,week){
 const sourceBody=raw.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];if(sourceBody===undefined)throw Error('Missing original article');const math=[],contents=[],used=new Set();
 const keep=(tex,display)=>{const source=decodeHTML(tex);const id=math.length;math.push({source,display});return '<!-- course-math-'+id+' -->'};
 let body=sourceBody.replace(/<span\b[^>]*class="math\s+(inline|display)"[^>]*>([\s\S]*?)<\/span>/g,(_,kind,tex)=>keep(tex.trim().slice(2,-2),kind==='display'));
 body=body.replace(/(?<!\\)\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|(?<!\\)\$([^$]+?)\$/g,(_,a,b,c,d)=>keep(a??b??c??d,a!==undefined||b!==undefined));
 const prose=body.replace(/<!-- course-math-\d+ -->/g,''),orderedMath=[...body.matchAll(/<!-- course-math-(\d+) -->/g)].map(m=>math[Number(m[1])]);
 body=body.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g,(_,level,attrs,label)=>{
  let id=attrs.match(/\bid="([^"]+)"/)?.[1];if(!id){const plain=decodeHTML(label.replace(/<[^>]*>/g,' '));let base=plain.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'section';id=base;let n=2;while(used.has(id))id=base+'-'+n++;attrs+=' id="'+id+'"'}used.add(id);const newLevel=Math.min(6,Number(level)+1);
  const tocLabel=label.replace(/<!-- course-math-(\d+) -->/g,(_,n)=>escape(math[n].source.replace(/\\([a-zA-Z]+)/g,'$1'))).replace(/<[^>]*>/g,'');contents.push({id,label:decodeHTML(tocLabel),level:newLevel});return '<h'+newLevel+attrs+'>'+label+'</h'+newLevel+'>';
 });
 body=body.replace(/<!-- course-math-(\d+) -->/g,(_,n)=>{const m=math[n],h=courseMath(m.source,m.display);return m.display?'<span class="formula formula-legacy">'+h+'</span>':h});
 return {html:body,sourceBody,prose,math:orderedMath,contents,subtitle:week===1?'Lectures 1–4':'Tutorial 1 and Lectures 5–8'};
}
export function courseNotePage(root,week,rendered,options={}){
 const course=options.course||'calculus',linear=course==='linear-algebra',prefix=linear?'LAweek':'MAweek',heading=(linear?'Linear Algebra':'Calculus')+' — Week '+week+(options.review?' · Review':''),dir='notes/mathematical-notes/'+course,name=prefix+week,version=f=>createHash('sha256').update(fs.readFileSync(path.join(root,'resources/assets',f))).digest('hex').slice(0,12),pdf=!linear&&week===2?'week2.pdf':name+'.pdf',sources=!linear&&week===2?['week2.tex']:[name+'.tex',name+'.md'];
 if(options.revised&&week===2)sources.push(name+'.md');
 const downloads=[{file:pdf,label:'PDF'},...sources.filter(f=>fs.existsSync(path.join(root,dir,f))).map(f=>({file:f,label:f.endsWith('.tex')?'LaTeX':'Markdown'}))].map(({file,label})=>'<a href="'+file+'"'+(file.endsWith('.pdf')?' target="_blank" rel="noopener"':' download')+'>'+label+'</a>').join('\n');
 const previous=week>1?'<a href="'+prefix+(week-1)+'.html">← Week '+(week-1)+'</a>':'',next=week<5?'<a href="'+prefix+(week+1)+'.html">Week '+(week+1)+' →</a>':'';
 return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(heading)+' · Jiayu Chen</title><meta name="description" content="'+escape(rendered.subtitle)+'"><link rel="stylesheet" href="/en/resources/assets/katex/katex.min.css"><link rel="stylesheet" href="/en/resources/assets/course-notes.css?v='+version('course-notes.css')+'"><script src="/en/resources/assets/theme.js?v='+version('theme.js')+'"></script></head><body><main><header><div><h1>'+escape(heading)+'</h1><p class="subtitle">'+escape(rendered.subtitle)+'</p></div><button id="theme-toggle" type="button">Dark</button></header><nav class="note-links" aria-label="Note formats and navigation"><a href="../weekly.html?course='+course+'&amp;type=html">← Weekly notes</a>\n'+downloads+'</nav><details class="contents"><summary>Contents</summary><ul>'+rendered.contents.map(c=>'<li'+(c.level>2?' class="subsection"':'')+'><a href="#'+c.id+'">'+escape(c.label)+'</a></li>').join('\n')+'</ul></details><article class="course-note">'+readableNoteBody(rendered.html)+'</article><footer><nav class="note-links" aria-label="Other weeks">'+previous+'\n'+next+'\n<a href="../page.html">Course notes</a></nav></footer></main></body></html>\n';
}
