import {decodeHTML} from 'entities';
import {escape as E} from './knowledge-markdown.mjs';

// Translate the existing homepage; its links, sections and English remain the source.
const copy={
 'About Me':'关于我',
 'I am an undergraduate mathematics student at The Chinese University of Hong Kong, Shenzhen. I am interested in pure mathematics, particularly algebraic geometry and related fields.':'我是香港中文大学（深圳）数学专业的本科生，对纯数学感兴趣，尤其是代数几何及相关领域。',
 'This website brings together my study notes and a growing collection of resources for learning mathematics.':'这里有我的学习笔记，也有我陆续整理的数学学习资料。',
 'Notes & Resources':'笔记与资源',
 'Personal study notes and curated resources for learning mathematics.':'个人学习笔记，以及整理的数学学习资料。',
 'Course Notes':'课程笔记',
 '— Notes from my undergraduate courses, organized by week.':'——本科课程笔记，按周整理。',
 'Mathematics Resources':'数学资源',
 '— Books, lecture notes, learning links, and information on further study and academic careers.':'——书籍、讲义、学习网站，以及升学和学术发展相关信息。',
 'Contact':'联系',
 'Email':'邮箱'
};
const unchanged=new Set(['GitHub','LinkedIn','CUHKSZ MathPi','·']);
export function homeTranslationBlocks(body){
 const blocks={},used=new Set();
 for(const id of ['about','notes','contact']){
  const source=body.match(new RegExp('<section id="'+id+'">([\\s\\S]*?)</section>'))?.[1];
  if(!source)throw Error('Missing homepage section: '+id);
  blocks[id]=source.replace(/>([^<>]+)</g,(_,value)=>{
   const text=decodeHTML(value).trim();if(!text)return '>'+value+'<';
   if(copy[text]){used.add(text);return '>'+value.replace(value.trim(),E(copy[text]))+'<'}
   if(!unchanged.has(text))throw Error('Homepage text needs translation review: '+text);
   return '>'+value+'<';
  });
 }
 if(used.size!==Object.keys(copy).length)throw Error('Homepage changed: review its translations');
 return blocks;
}
