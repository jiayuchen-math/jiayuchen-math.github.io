export const referenceIndexFile = 'resources/encyclopedia/reference-index.html';

export const referenceIndexBody = `
<p lang="zh-Hans">按中文条目名、Stacks 标签或英文关键词检索。索引收录 1,831 个香蕉空间百科页与 21,446 个 Stacks 标签。结果跳转原出处，和本站百科正文分别计数。</p>
<p>Search 1,831 Banana Space encyclopedia pages and 21,446 Stacks Project tags. The results open the source pages and are counted separately from this encyclopedia.</p>
<p><a href="https://github.com/banana-space/banana/tree/5ded0a9a106b310c2b3c914a2fc55e09a23389c3/content/wiki" target="_blank" rel="noopener noreferrer">Banana Space source snapshot · 香蕉空间源目录</a> · <a href="https://github.com/stacks/stacks-project/blob/a04446e57ec1fbc252a871afcec7752fb2807b14/tags/tags" target="_blank" rel="noopener noreferrer">Stacks source snapshot · 标签源文件</a></p>
<form id="reference-search" class="controls" role="search" hidden>
 <label>Keyword or tag / 关键词或标签 <input id="reference-query" type="search"></label>
 <label>Source / 来源 <select id="reference-source">
  <option value="">Both / 全部</option>
  <option value="banana">Banana Space / 香蕉空间</option>
  <option value="stacks">Stacks Project</option>
 </select></label>
</form>
<p id="reference-status" class="meta" role="status" tabindex="-1"></p>
<button type="button" id="reference-retry" hidden>Retry / 重试</button>
<ul id="reference-results"></ul>
<nav id="reference-pagination" class="static-pagination" aria-label="Search result pages / 搜索结果页" hidden>
 <button type="button" id="reference-previous">Previous / 上一页</button>
 <button type="button" id="reference-next">Next / 下一页</button>
</nav>
<noscript><p>Use the source snapshot links to browse without JavaScript. / 禁用脚本时，可用上方链接查看原始索引。</p></noscript>
`;
