import {decodeHTML} from 'entities';
// A deliberately reviewed list, not a rule that removes short text or caveats.
// Source data and mathematical article bodies are never rewritten by this pass.
export const emptyRecommendations=[
 'First study with exercises; compare alternative presentations.',
 'Bridge undergraduate foundations to more advanced reading.',
 'Study selectively after the stated foundations; use the subject guide to choose a specialization.',
 'Develop proof-based undergraduate tools; compare the subject reading guide.',
 'Graduate study or selective reference after the listed preparation.',
 '入门时配合习题学习，也可以对照不同的讲法。','从本科基础继续走向进阶读物。',
 '具备所列基础后按需选读，再参考学科导读选择具体分支。','练习本科阶段以证明为主的工具，可配合学科导读阅读。','具备所列基础后，用于研究生学习或按需查阅。'
];
const emptyCopy=new Set([
 ...emptyRecommendations,...emptyRecommendations.map(s=>'Use: '+s),...emptyRecommendations.map(s=>'用途：'+s),
 'Each entry includes its suggested level and preparation.','每项资料附有建议层次和先修要求。',
 'Resources, ordered from an entry point toward more demanding reading. Check each access badge before opening.','下方资料从入门排到进阶，打开前可先看注明的获取方式。',
 'Author, university or academic-archive PDF.','作者、大学或学术档案公开的 PDF。',
 'Read online at the official text or archive.','可在官方正文页面或学术档案中在线阅读。','Official access page.','官方获取页面。',
 'The official source lists author download or online-reading routes. Follow its book link; this entry does not claim that the landing page itself is a full PDF.',
 '官方来源列出了作者提供的下载或在线阅读入口。请继续点书籍链接；当前页面本身并不是完整 PDF。',
 'Author download page, not a direct PDF.','作者下载页面，非直接 PDF。',
 'Complete PDF opens from the author’s university or personal site.','可从作者的大学网站或个人网站打开完整 PDF。',
 'Suggested preparation · editorial','Skip familiar material, review uncertain sections, or follow a bridge resource.',
 'See the preparation listed with each advanced resource.',
 'No separate universal research prerequisite is imposed here. Consult each advanced resource’s listed preparation and specialist requirements.',
 'Card counts include distinct catalogue works listed here or explicitly cross-referenced from another subject. Further print reading is separate. A work may appear in several subjects or areas but counts only once in the complete catalogue.',
 'Print references are listed under “Further print reading”.',
 'Source links and review dates accompany entries.','Review dates are shown with individual resources.',
 'Source links and review dates accompany new entries.',
 'Open edition listed by AIM; see the author route for version details','Legacy author edition; consult source for latest version',
 'AIM 收录的开放版本；具体版本信息见作者入口','保留的作者旧版；最新版本请查来源页',
 'Choose an entry point that fits your preparation.',
]);
const shortCopy=new Map([
 ['直接打开 PDF','PDF'],['官方页面，获取方式待核实','全文获取状态待核实'],['需要机构权限或购买','需购买／机构权限'],['在线正文／学术档案','在线正文'],
 ['Direct open PDF','PDF'],['Access: Direct open PDF','PDF'],['获取方式：直接打开 PDF','PDF'],
 ['Open online text / archive','Online text'],['Access: Open online text / archive','Online text'],['获取方式：在线正文／学术档案','在线正文'],
 ['Institutional / purchase access','Purchase / institutional access'],['Access: Institutional / purchase access','Purchase / institutional access'],['获取方式：需要机构权限或购买','需购买／机构权限'],
 ['Official page — verify access','Full-text access unverified'],['Access: Official page — verify access','Full-text access unverified'],['获取方式：官方页面，获取方式待核实','全文获取状态待核实'],
 ['The official source lists author download or online-reading routes. Follow its book link; this entry does not claim that the landing page itself is a full PDF.','Author download page, not a direct PDF.'],
 ['官方来源列出了作者提供的下载或在线阅读入口。请继续点书籍链接；当前页面本身并不是完整 PDF。','作者下载页面，非直接 PDF。'],
 ['AIM lists an authorized open edition and its author/download route. This link is a source page, not a direct PDF; follow its full-text link and observe the stated licence.','AIM source page with an authorized full-text link.'],
 ['AIM 列出了获授权的开放版本及作者／下载入口。当前链接是来源页，不是直接 PDF；请继续点全文链接，并遵守所注明的许可。','AIM 来源页，内有获授权的全文链接。'],
 ['Publisher access requires purchase or an eligible library subscription. Free front matter, sample chapters and previews are not the complete book.','Purchase or library subscription required; previews are not the complete book.'],
 ['出版社全文需要购买，或通过符合条件的图书馆订阅访问。免费的前言、样章和预览不是全书。','全文需购买或图书馆订阅；预览不是全书。'],
 ['The linked publisher or authorized platform requires purchase or eligible institutional access. A sample or chapter preview is not the complete book.','Purchase or institutional access required; previews are not the complete book.'],
 ['链接所指的出版社或授权平台需要购买，或通过符合条件的机构访问。样章或章节预览不是全书。','全文需购买或机构权限；预览不是全书。'],
 ['The author explicitly provides an authorized electronic edition. This title opens its download/source page, not a direct PDF; follow its stated edition and terms.','Authorized electronic edition; the link opens its download page.'],
 ['作者明确提供了获授权的电子版。书名链接打开的是下载／来源页，不是直接 PDF；请按页面注明的版本和使用条款阅读。','作者授权的电子版；链接打开下载页面。'],
]);
const text=html=>decodeHTML(html.replace(/<[^>]*>/g,'')).replace(/\s+/g,' ').trim();
const escape=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
// Mask exact mathematical bodies and non-translation scripts before prose edits.
let protectionSequence=0;
function protect(input,transform){
 const saved=[],marker='\u0001COPY'+(++protectionSequence)+'_';const keep=s=>marker+(saved.push(s)-1)+'\u0002';
 input=input.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,keep);
 const start=/<div\b[^>]*class="[^"]*\barticle-body\b[^"]*"[^>]*>/g;let m;
 while((m=start.exec(input))){const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start.lastIndex;let depth=1,end;while(depth&&(end=tags.exec(input)))depth+=end[0].startsWith('</')?-1:1;if(depth)throw Error('Unclosed protected mathematical body');const replacement=keep(input.slice(m.index,tags.lastIndex));input=input.slice(0,m.index)+replacement+input.slice(tags.lastIndex);start.lastIndex=m.index+replacement.length;}
 return transform(input).replace(new RegExp(marker+'(\\d+)\u0002','g'),(_,i)=>saved[Number(i)]);
}
export function conciseText(value){
 if(emptyCopy.has(value))return '';
 value=shortCopy.get(value)||value.replace(/^(Preparation: )Editorial preparation(?: guide)?:\s*/,'$1').replace(/^Editorial preparation(?: guide)?:\s*/,'').replace(/^先修：编选建议：/,'先修：').replace(/^编选建议：/,'');
 const preparation=value.replace(/^(?:Preparation: |先修：)/,'');
 if(['School algebra; proof-writing for the more theoretical texts.','School algebra; willingness to write complete arguments.','中学代数；阅读理论性较强的教材时，还需要会写证明。','中学代数；愿意写完整的论证。'].includes(preparation))return '';
 for(const sentence of [
  'The later examples-and-extensions companion is not counted as another edition of this book.',
  'The semester volumes are counted as one work.',
  'Screen and print versions are the same work, and the split volumes are not counted separately.',
  'Versions count once; the linked edition’s own title page governs pagination.',
  'The shorter edition and expanded edition are not counted as separate works.',
  'Other volumes of the series are not silently counted as part of this linked book.',
  '屏幕阅读版与印刷版是同一部作品，分卷也不重复计数。','章节和重印版仍按同一项文献计数。'
 ])value=value.replace(sentence,'').trim();
 return value.replace(', which is not counted again here.','.').replace('The handbook is counted once; this link does not provide all three volumes as free PDFs.','This link does not provide all three volumes as free PDFs.').replace('This is a full text, not a single probability chapter counted separately.','').replace('English and French versions are counted once.','Available in English and French.').replace('individual lecture PDFs; counted as one course, not per chapter.','individual lecture PDFs.').replace('The archive is counted as one course, including supplements.','The archive includes supplements.').replace('in multiple PDF files, counted as one book.','in multiple PDF files.').trim();
}
export function trimCopy(input){return protect(input,html=>{
 html=html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/g,(all,attrs,body)=>{
  if(/\bdata-path-state\b/.test(attrs))return '<p'+attrs.replace(/\s+hidden(?:="[^"]*")?/g,'')+' hidden></p>';
  const plain=text(body);if(!plain)return all; // Empty live regions are functional, not filler.
  const replacement=conciseText(plain);if(!replacement)return '';
  if(replacement!==plain&&!body.includes('<a '))return '<p'+attrs+'>'+escape(replacement)+'</p>';
  if(/^Review dates appear with individual entries\./.test(plain))return '<p'+attrs+'>'+body.replace(/Review dates appear with individual entries\.\s*/,'')+'</p>';
  if(/^各项资料分别注明原核查日期。/.test(plain))return '<p'+attrs+'>'+body.replace('各项资料分别注明原核查日期。','')+'</p>';
  if(/^(?:Version: Legacy author edition; consult source for latest version|版本：保留的作者旧版；最新版本请查来源页) · /.test(plain))return '<p'+attrs+'>'+escape(plain.replace(/^.*? · /,''))+'</p>';
  if(/^(?:Version: Open edition listed by AIM; see the author route for version details|版本：AIM 收录的开放版本；具体版本信息见作者入口) · /.test(plain))return '<p'+attrs+'>'+escape(plain.replace(/^.*? · /,''))+'</p>';
  return all;
 });
 return html.replace(/<!-- resource-count-policy:start -->[\s\S]*?<!-- resource-count-policy:end -->/g,'');
});}
function foldBooks(html){
 return html.replace(/<article\b([^>]*)>([\s\S]*?)<\/article>/g,(all,attrs,body)=>{
  if(!/class="[^"]*\bentry\b/.test(attrs)||/class="[^"]*\bportal-entry\b/.test(attrs))return all;
  // Unwrap only this pass's own group so repeated builds remain stable.
  body=body.replace(/<details class="bibliographic-details"><summary>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/g,'$1');
  const access='(?:PDF|Online text|Purchase / institutional access|Full-text access unverified|在线正文|需购买／机构权限|全文获取状态待核实)';
  const meta='<p class="meta">';
  body=body.replace(new RegExp(meta+'('+access+')<\\/p>'+meta+'([^<]* · [^<]*)<\\/p>','g'),(_,format,author)=>meta+author+' · '+format+'</p>');
  body=body.replace(new RegExp(meta+'([^<]* · [^<]*)<\\/p>'+meta+'('+access+')<\\/p>','g'),(_,author,format)=>meta+author+' · '+format+'</p>');
  const metadata=[];
  body=body.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/g,(p,a,b)=>{
   if(!/class="[^"]*(?:meta|muted)/.test(a))return p;
   const t=text(b);
   if(/^(?:Version:|Free edition:|Original title:|Checked |Legacy entry retained|版本：|免费版本：|原文题名：|原核查：|保留的旧条目|原核查记录确认)/.test(t)){metadata.push(p);return '';}
   return p;
  });
  if(metadata.length){const zh=/(?:先修：|获取方式：|版本：|原核查：)/.test(body+metadata.join(''));body+='<details class="bibliographic-details"><summary>'+(zh?'版本与来源':'Edition and sources')+'</summary>'+metadata.join('')+'</details>';}
  return '<article'+attrs+'>'+body+'</article>';
 });
}
export function polishFragment(html,{library=false}={}){html=trimCopy(html);return library?foldBooks(html):html;}
export function polishPage(html,file){
 if(file==='disclaimer.html')return html;
 const library=file.startsWith('notes/reading-notes/library/');
 html=html.replace(/(<script type="application\/json" id="page-translations">)([\s\S]*?)(<\/script>)/g,(_,open,raw,close)=>{const p=JSON.parse(raw);for(const id of Object.keys(p.blocks))p.blocks[id]=polishFragment(p.blocks[id],{library:library&&id==='library-copy-books'});return open+JSON.stringify(p).replace(/</g,'\\u003c')+close;});
 return protect(html,s=>library?foldBooks(trimCopy(s)):trimCopy(s));
}
