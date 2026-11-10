export const stackParts = Array.from({length: 11}, (_, i) => 'stacks-' + (i + 1) + '.txt');

const normalize = text => text.normalize('NFKC').toLowerCase().replace(/[-_]+/g, ' ');
const rows = text => text.split(/\r?\n/).filter(Boolean);

export function sourceRecords(banana, stacks) {
 const entries = rows(banana).map(title => ({
  source: 'banana', label: title,
  url: 'https://bananaspace.org/wiki/' + encodeURIComponent(title) + '/',
  search: normalize(title),
 }));
 for (const line of stacks.flatMap(rows)) {
  const [tag, label] = line.split(/,(.*)/s);
  if (!/^[0-9A-Z]{4}$/.test(tag) || !label) throw new Error('Invalid Stacks tag');
  entries.push({
   source: 'stacks', label: tag + ' · ' + label,
   url: 'https://stacks.math.columbia.edu/tag/' + tag,
   search: normalize(tag + ' ' + label),
  });
 }
 return entries;
}

export function findReferences(entries, query, source) {
 const words = normalize(query).trim().split(/\s+/).filter(Boolean);
 return entries.filter(entry => (!source || entry.source === source) && words.every(word => entry.search.includes(word)));
}

const form = typeof document === 'undefined' ? null : document.querySelector('#reference-search');
if (form) {
 const status = document.querySelector('#reference-status');
 const list = document.querySelector('#reference-results');
 const retry = document.querySelector('#reference-retry');
 const previous = document.querySelector('#reference-previous');
 const next = document.querySelector('#reference-next');
 const query = document.querySelector('#reference-query');
 const source = document.querySelector('#reference-source');
 const limit = 30;
 let entries = [];
 let matches = [];
 let page = 1;

 function showPage() {
  const pages = Math.max(1, Math.ceil(matches.length / limit));
  const start = (page - 1) * limit;
  status.textContent = matches.length
   ? matches.length.toLocaleString() + ' results / 项 · ' + page + ' / ' + pages
   : 'No matches / 未找到条目';
  previous.disabled = page === 1;
  next.disabled = page >= pages;
  list.replaceChildren(...matches.slice(start, start + limit).map(entry => {
   const item = document.createElement('li');
   const link = document.createElement('a');
   link.href = entry.url;
   link.textContent = entry.label;
   link.target = '_blank';
   link.rel = 'noopener noreferrer';
   item.append(link, entry.source === 'banana' ? ' · 香蕉空间' : ' · Stacks Project');
   return item;
  }));
 }

 function search() {
  matches = findReferences(entries, query.value, source.value);
  page = 1;
  showPage();
 }

 async function loadIndex() {
  retry.hidden = true;
  status.textContent = 'Loading index… / 正在加载索引…';
  try {
   const [banana, ...stacks] = await Promise.all(['banana.txt', ...stackParts].map(async name => {
    const url = new URL('../data/reference-index/' + name, import.meta.url);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Index file unavailable');
    return response.text();
   }));
   entries = sourceRecords(banana, stacks);
   if (entries.length !== 23277) throw new Error('Incomplete index');
   form.hidden = false;
   document.querySelector('#reference-pagination').hidden = false;
   search();
  } catch {
   status.textContent = 'Could not load the index. / 索引加载失败。';
   retry.hidden = false;
  }
 }

 form.addEventListener('submit', event => { event.preventDefault(); search(); });
 query.addEventListener('input', search);
 source.addEventListener('change', search);
 previous.addEventListener('click', () => { page--; showPage(); status.focus(); });
 next.addEventListener('click', () => { page++; showPage(); status.focus(); });
 retry.addEventListener('click', loadIndex);
 loadIndex();
}
