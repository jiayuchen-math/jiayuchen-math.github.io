import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {escape as E} from './knowledge-markdown.mjs';

export const editionDate='2026-10-19';
export const focusedPages=[
 ['resources/index.html','Mathematics Resources','数学资源','page'],
 ['notes/reading-notes/library.html','Library by subject','按学科浏览书库','page'],
 ['notes/reading-notes/library/algebra/algebraic-geometry.html','Algebraic geometry study guide','代数几何学习说明','learning-sections'],
 ['notes/reading-notes/library/analysis/differential-equations.html','Differential equations study guide','微分方程学习说明','learning-sections'],
 ['notes/reading-notes/library/probability-dynamics/probability.html','Probability study guide','概率论学习说明','learning-sections'],
 ['resources/library-paths/routes/algebraic-geometry.html','Algebraic geometry path','代数几何学习路线','page'],
 ['resources/library-paths/routes/analysis-pde.html','Analysis and PDE path','分析与 PDE 学习路线','page'],
 ['resources/library-paths/routes/probability.html','Probability path','概率学习路线','page'],
 ['resources/topics/algebraic-geometry/index.html','Algebraic geometry topics','代数几何专题','page'],
 ['resources/encyclopedia/contributing.html','Contribute and correct','投稿与纠错','page']
];
export function sourceFingerprint(value){
 // Ignore the count text that is translated directly from the same catalogue.
 const source=JSON.stringify(value,(_,v)=>typeof v==='string'?v.replace(/\r\n/g,'\n').replace(/<section id="translation-coverage">[\s\S]*?<\/section>/g,'').replace(/\d+ resources/g,'COUNT resources').replace(/\d+ distinct resources/g,'COUNT distinct resources').replace(/\d+ broad areas · \d+ subject pages · \d+ distinct resources/g,'COUNTS').replace(/data-resource-count="\d+"/g,'data-resource-count="COUNT"').trim():v);
 return createHash('sha256').update(source).digest('hex');
}
export function readTranslationApprovals(root){const file=path.join(root,'resources/data/translation-revisions.json');return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')).pages:{}}
export function translationCoverage(file,english,approvals,scope='page',untranslated=0){
 const sourceHash=sourceFingerprint(english),approved=approvals[file];
 const status=untranslated||!approved||approved.sourceHash!==sourceHash?'needs-review':scope==='page'?'body-translated':'partly-translated';
 return {status,scope,sourceHash,approvedSourceHash:approved?.sourceHash||null,reviewed:approved?.reviewed||null,...untranslated?{untranslatedSegments:untranslated}:{}};
}
export function coverageTable(records,locale='en'){
 const zh=locale==='zh';
 return '<section id="translation-coverage"><h2>'+(zh?'本轮翻译范围':'Translation coverage')+'</h2><p>'+(zh?'学习说明已译的页面，书目中的原文简介仍会保留。这里不把整个书库或百科算作已翻译。':'A translated study guide can still have catalogue annotations in their original language. This list does not describe the whole catalogue or encyclopedia as translated.')+'</p><table><thead><tr><th>'+(zh?'页面':'Page')+'</th><th>'+(zh?'范围':'Scope')+'</th></tr></thead><tbody>'+focusedPages.map(([file,en,cn,scope])=>'<tr><td><a href="/en/'+file.replace(/index\.html$/,'')+'">'+E(zh?cn:en)+'</a></td><td>'+E(records.get(file)?.status==='needs-review'?(zh?'待复核':'Needs review'):scope==='page'?(zh?'页面正文':'Page body'):(zh?'学习说明与导航；书目简介保留原文':'Study guide and navigation; catalogue annotations remain original'))+'</td></tr>').join('')+'</tbody></table><p><a href="/en/resources/data/translation-coverage.json">'+(zh?'查看完整覆盖清单（JSON）':'Full coverage inventory (JSON)')+'</a></p></section>';
}
export function compilationRecord({en,zh,locale='en'}){
 const chinese=locale==='zh';return '<section class="editorial-record"><h2>'+(chinese?'编选说明':'Editorial note')+'</h2><p>'+E(chinese?zh:en)+'</p><p class="knowledge-meta">'+(chinese?'本站编辑整理（AI 辅助）。本轮内容修订：':'Site editorial compilation (AI-assisted). Content revised: ')+editionDate+(chinese?'。来源核查日期随资料分别记录；未标注外部数学审稿。':'. Source inspection dates are recorded with readings; no external mathematical peer review is claimed.')+'</p><details><summary>'+(chinese?'本轮修订':'Revision note')+'</summary><p>'+(chinese?'补充阅读起点、例子与相关页面之间的连接，并同步整理中文内容。':'Connected reading choices, examples and related pages, with a corresponding Chinese version.')+'</p></details></section>';
}
