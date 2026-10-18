import {escape as E, markdown} from './knowledge-markdown.mjs';
import {
  algebraicGeometryTopicData as topic,
  algebraicGeometrySourceChecks as sourceChecks,
  algebraicGeometryPrerequisites as subjectLinks,
} from './data/algebraic-geometry-topic.mjs';

// Pure renderer: no filesystem writes, registration, build or publication.
// The caller supplies its final catalogue objects, after access overrides.
// workIds maps existing stable work IDs to those objects; books is optional
// cross-checking of their membership in the same catalogue.
const normalize = url => String(url).replace(/\/$/, '');
const readingURL = book => book?.readingUrl || book?.url;
const chineseConcepts = {
  'localization-commutative-ring': '交换环的局部化',
  'algebraic-prime-spectrum': '交换环的素谱',
  scheme: '概形', sheaf: '层',
  'chain-complex-modules': '模的链复形',
  'short-exact-sequence-modules': '模的短正合列',
  'module-ext-group': '模的Ext群', 'spectral-sequence': '谱序列',
  'representable-functor': '可表函子', 'categorical-pullback': '范畴中的拉回',
  'fpqc-descent-quasi-coherent-sheaves': '拟凝聚层的fpqc下降',
  'algebraic-space': '代数空间', 'algebraic-stack': '代数叠',
  'quotient-stack': '商叠', 'grothendieck-site': 'Grothendieck景',
  'grothendieck-topos': 'Grothendieck拓扑斯',
  'galois-extension': '伽罗瓦扩张', 'etale-fundamental-group': 'étale基本群',
  'etale-cohomology': 'étale上同调', 'crystalline-cohomology': '晶体上同调',
  'tensor-product-modules': '模的张量积', 'simplicial-set': '单纯集',
  'cotangent-complex': '余切复形', 'derived-scheme': '导出概形',
  'stable-infinity-category': '稳定无穷范畴', 'infinity-topos': '无穷拓扑斯',
  'higher-category': '高阶范畴', 'perfectoid-field': 'perfectoid域',
  'perfectoid-space': 'perfectoid空间',
  'tilting-perfectoid-spaces': 'perfectoid空间的倾斜',
  'prism-p-adic-geometry': 'p进几何中的棱镜',
  'prismatic-cohomology': '棱镜上同调',
};

/**
 * Render the same six anchored sections in English or Simplified Chinese.
 * Returns a body fragment for the existing article shell, not a full document.
 * Missing selected works/concepts fail explicitly instead of creating empty
 * links or silently substituting another edition with incompatible locators.
 */
export function algebraicGeometryTopic({books = [], workIds = {}, knowledge, readings = [], locale = 'en'} = {}) {
  if (!['en', 'zh'].includes(locale)) throw new Error('AG topic: unsupported locale ' + locale);
  if (!Array.isArray(books) || !knowledge || !Array.isArray(knowledge.articles) || !Array.isArray(readings)) {
    throw new Error('AG topic: expected catalogue books, knowledge.articles and concept readings');
  }
  const zh = locale === 'zh', t = value => {
    const result = value?.[locale];
    if (typeof result !== 'string' || !result.trim()) throw new Error('AG topic: missing ' + locale + ' copy');
    return result;
  };
  const copy = (en, chinese) => zh ? chinese : en;
  const prose = value => markdown.render(t(value));
  const https = value => {
    let url;
    try { url = new URL(value); } catch { throw new Error('AG topic: invalid external URL ' + value); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('AG topic: unsafe source URL ' + value);
    return url.href;
  };
  const external = (url, label) => `<a href="${E(https(url))}" target="_blank" rel="noopener noreferrer">${E(label)}</a>`;
  const internal = (href, label, context = false) => {
    if (!href.startsWith('/en/')) throw new Error('AG topic: unexpected internal URL ' + href);
    const url = new URL(href, 'https://jiayuchen-math.github.io');
    if (context) url.searchParams.set('fromPath', 'algebraic-geometry');
    if (zh) url.searchParams.set('lang', 'zh');
    return `<a href="${E(url.pathname + url.search + url.hash)}">${E(label)}</a>`;
  };
  const articles = new Map(knowledge.articles.filter(e => e.status !== 'draft').map(e => [e.id, e]));
  const guides = new Map(readings.filter(e => e.status !== 'draft').map(e => [e.id, e]));
  const terms = new Map((knowledge.terms || []).filter(e => e.status !== 'draft').map(e => [e.id, e]));
  function concept(id) {
    const entry = articles.get(id) || guides.get(id) || terms.get(id);
    if (!entry) throw new Error('AG topic: missing published concept ' + id);
    const title = zh ? entry.chinese || chineseConcepts[id] || entry.title || entry.english : entry.title || entry.english;
    const directory = articles.has(id) || guides.has(id) ? 'encyclopedia' : 'terminology';
    return internal(`/en/resources/${directory}/${id}/`, title, true);
  }
  const prerequisite = id => subjectLinks[id]
    ? internal(subjectLinks[id].url, t(subjectLinks[id].title), true)
    : concept(id);

  function reading(selection, sectionId, index) {
    const id = selection.workId;
    if (!Object.hasOwn(workIds, id)) throw new Error('AG topic: missing stable catalogue work ' + id);
    const book = workIds[id], check = sourceChecks[id];
    if (!book || !check || (book.id && book.id !== id)) throw new Error('AG topic: invalid catalogue binding ' + id);
    const url = https(readingURL(book));
    if (normalize(url) !== normalize(check.fullText)) throw new Error('AG topic: selected edition changed; recheck locators for ' + id);
    if (books.length && !books.some(e => normalize(readingURL(e)) === normalize(url))) throw new Error('AG topic: work absent from final catalogue ' + id);
    const access = book.readingAccess || book.fields?.readingAccess;
    if (access && access !== 'Free to read') throw new Error('AG topic: full-text access needs rechecking for ' + id);
    const title = selection.label ? t(selection.label) : book.title;
    const author = book.author || book.subtitle;
    if (!title || !author) throw new Error('AG topic: missing catalogue title/author for ' + id);
    const destination = selection.target || url;
    // The project has one stable work ID. Tags select passages, not new works.
    if (selection.target && (id !== 'work-0551' || !/^https:\/\/stacks\.math\.columbia\.edu\/tag\/[A-Z0-9]{4}$/.test(selection.target))) {
      throw new Error('AG topic: unverified passage URL for ' + id);
    }
    const source = book.source || book.sourceUrl;
    const catalogue = `/en/notes/reading-notes/library/catalogue.html#${id}`;
    const actions = [internal(catalogue, copy('Catalogue entry', '书库条目'))];
    if (source && normalize(source) !== normalize(destination)) actions.push(external(source, copy('Author / source page', '作者／来源页')));
    const format = id === 'work-0551' ? copy('Open online text', '公开在线全文') : copy('Open full PDF', '公开PDF全文');
    const checked = `<time datetime="${E(check.checked)}">${E(check.checked)}</time>`;
    return `<article class="portal-entry" id="${sectionId}-reading-${index + 1}" data-work-id="${id}">
<h3>${external(destination, title)}</h3>
<p class="entry-meta">${E(author)} · ${E(t(selection.role))}</p>
${prose(selection.purpose)}
<p><strong>${copy('Read:', '选读：')}</strong> ${E(t(selection.locator))}</p>
<p class="meta">${E(t(check.kind))} · ${E(t(check.version))} · ${copy('English', '英文')} · ${format}<br>${copy('Source and reading location checked', '来源及阅读位置核查于')} ${checked}</p>
<p class="entry-actions">${actions.join(' · ')}</p>
</article>`;
  }

  const contents = topic.sections.map(section => ({id: section.id, label: t(section.title)}));
  const sections = topic.sections.map(section => `<section id="${section.id}" aria-labelledby="${section.id}-title">
<h2 id="${section.id}-title">${E(t(section.title))}</h2>
${prose(section.problem)}
<p><strong>${copy('Before reading:', '需要的基础：')}</strong> ${section.prerequisites.map(prerequisite).join(' · ')}</p>
${prose(section.note)}
${section.readings.map((entry, index) => reading(entry, section.id, index)).join('\n')}
<p class="concept-links"><strong>${copy('Related concepts:', '相关概念：')}</strong> ${section.concepts.map(concept).join(' · ')}</p>
</section>`).join('\n');
  const navigation = [
    internal('/en/resources/library-paths/routes/algebraic-geometry.html', copy('Algebraic geometry learning route', '代数几何学习路线')),
    internal('/en/notes/reading-notes/library/algebra/algebraic-geometry.html', copy('First-course reading and exercises', '入门读物与练习'), true),
    internal('/en/notes/reading-notes/library/catalogue.html?topic=Algebraic+Geometry&readingAccess=Free+to+read', copy('Algebraic geometry in the library', '书库中的代数几何资料')),
  ];
  const body = `<div class="ag-topic" lang="${zh ? 'zh-Hans' : 'en'}" data-topic-id="${topic.id}">
${prose(topic.introduction)}
<p class="entry-actions">${navigation.join(' · ')}</p>
${prose(topic.selectionNote)}
${sections}
<footer class="editorial-note"><p>${E(t(topic.attribution))}</p><p class="meta">${copy('Compiled', '编选日期')} <time datetime="${topic.edited}">${topic.edited}</time> · ${internal('/en/resources/encyclopedia/contributing.html', copy('Suggest a correction or reading', '纠错与推荐读物'))}</p></footer>
</div>`;
  return {title: t(topic.title), body, contents, summary: t(topic.summary), aliases: [...topic.aliases]};
}
