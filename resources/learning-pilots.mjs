import {escape as E, markdown} from './knowledge-markdown.mjs';
import {pilotSubjects, pilotRouteSteps, hunterSource, weakDerivativeCheck} from './data/learning-pilots.mjs';

/**
 * Additive fragments, with no file writes, build integration or browser scripts.
 * MAIN: append the subject fragment AFTER <!-- subject-guide:end --> inside an
 * independently translated #pilot-copy block. Do not put it inside #study-guide
 * or alter original course JSON, translation payloads, or existing check IDs.
 * Insert the route fragment after #introduction and before the route stages.
 * Render en/zh separately, replacing rather than appending the translated copy.
 * IDs deliberately match across languages. A caller must not mount both copies.
 * /en/ links follow the existing source convention and root-site migration.
 * fromPath carries context only; the main integration owns any return control.
 */

const routes = Object.fromEntries(Object.entries(pilotSubjects).map(([id, entry]) => [entry.route, id]));
const choose = (value, locale) => value[locale];
const para = text => markdown.render(text);
const paragraphs = lines => lines.map(para).join('');
const text = (en, zh, locale) => locale === 'zh' ? zh : en;
const a = (href, label) => `<a href="${E(href)}"${/^https:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${E(label)}</a>`;

function context(subjectId, topics, locale) {
  if (!['en', 'zh'].includes(locale)) throw new RangeError('Pilot locale must be en or zh');
  if (!Array.isArray(topics)) throw new TypeError('Pilot sections require a topics array');
  const entry = pilotSubjects[subjectId];
  const topic = topics.find(t => t.id === subjectId);
  if (!topic || !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*\.html$/.test(topic.route)) {
    throw new Error('Missing or unsafe pilot subject route: ' + subjectId);
  }
  const withContext = (url, anchor = '') => `${url}?fromPath=${entry.route}&lang=${locale}${anchor ? '#' + anchor : ''}`;
  const subject = anchor => withContext('/en/notes/reading-notes/library/' + topic.route, anchor);
  const review = anchor => withContext('/en/resources/library-paths/' + subjectId + '.html', anchor);
  const labels = {
    'primary-reading': ['Starting text', '主读物'],
    'scheme-reading': ['2025 scheme selection', '2025版概形选读'],
    'reading-comparison': ['Compare reading approaches', '比较读物用途'],
    practice: ['Exercises and available answers', '习题与可用答案'],
    'check-learning': ['Existing checks, hints and solutions', '已有自测、提示与解答'],
    'ag-gluing': ['Gluing check, hint and solution', '粘合题、提示与解答'],
    'ag-figure': ['Existing local-gluing diagram', '已有的局部粘合图'],
    'ag-two-lines': ['Two-lines check', '两条直线的自测题'],
    'ag-cusp': ['Cusp tangent-space check', '尖点切空间自测题'],
    'ag-localization-review': ['Localization preparation and skip check', '局部化先修与跳过条件'],
    'ag-sheaf-review': ['Sheaf preparation and skip check', '层的先修与跳过条件'],
    'pde-initial-value': ['Initial-value check, hint and solution', '初值题、提示与解答'],
    'pde-weak-check': ['Absolute-value check, hint and solution', '绝对值函数题、提示与解答'],
    'pde-analysis-review': ['Analysis preparation and skip check', '分析先修与跳过条件'],
    'pde-measure-review': ['Measure preparation and skip check', '测度论先修与跳过条件'],
    'pde-functional-review': ['Function-space preparation and skip check', '函数空间先修与跳过条件'],
    'prob-conditioning': ['Two-toss conditioning check, hint and solution', '两次抛币条件概率题、提示与解答'],
    'prob-figure': ['Existing conditioning diagram', '已有的条件概率图'],
    'prob-averages': ['Bernoulli-average check, hint and solution', 'Bernoulli 平均值题、提示与解答'],
    'prob-analysis-review': ['Real-analysis preparation and skip check', '实分析先修与跳过条件'],
    'prob-measure-review': ['Measure preparation and skip check', '测度论先修与跳过条件'],
    hunter: ['Hunter: weak derivatives, pp. 47–48', 'Hunter：弱导数，页47—48'],
  };
  const targets = {
    'primary-reading': subject('study-guide'), 'scheme-reading': subject('choose-reading'),
    'reading-comparison': subject('choose-reading'), practice: subject('practice-learning'),
    'check-learning': subject('check-learning'),
    'ag-gluing': subject('check-compatible-sections-on-two-principal-opens'),
    'ag-figure': subject('learning-ag-local-gluing'),
    'ag-two-lines': subject('check-two-lines-and-their-coordinate-ring'),
    'ag-cusp': subject('check-tangent-spaces-of-a-cusp'),
    'ag-localization-review': review('commutative-algebra--intro'),
    'ag-sheaf-review': review('sheaves--intro'),
    'pde-initial-value': subject('check-integrating-factor-with-initial-value'),
    'pde-weak-check': subject(weakDerivativeCheck.id),
    'pde-analysis-review': review('real-analysis--intro'),
    'pde-measure-review': review('measure-theory--research'),
    'pde-functional-review': review('functional-analysis--research'),
    'prob-conditioning': subject('check-conditioning-on-two-fair-coin-tosses'),
    'prob-figure': subject('learning-probability-conditioning'),
    'prob-averages': subject('check-bernoulli-average-mean-variance-and-weak-law'),
    'prob-analysis-review': review('real-analysis--research'),
    'prob-measure-review': review('measure-theory--research'),
    hunter: hunterSource.url + '#page=3',
  };
  const link = key => {
    if (!targets[key] || !labels[key]) throw new Error('Unknown pilot link: ' + key);
    return a(targets[key], labels[key][locale === 'zh' ? 1 : 0]);
  };
  return {entry, link, subject};
}

function revision(entry, locale) {
  return `<details class="knowledge-meta"><summary>${text('Editorial choice and revision', '编选说明与修订', locale)}</summary>${para(choose(entry.choice, locale))}<p>${text('Added', '新增', locale)} <time datetime="2026-10-19">2026-10-19</time>${text('. AI-assisted drafting; independent human mathematical review has not been recorded. Existing reading-source dates are unchanged.', '。使用 AI 辅助起草，尚无独立人工数学复核记录。原读物的来源日期不变。', locale)}</p></details>`;
}

// Original coordinate-derived drawing: one SVG, two responsive panels. Open
// endpoints mark the open domain; the two holes over x=0 do not specify g(0).
function weakDerivativeFigure(locale) {
  const t = (en, zh) => text(en, zh, locale);
  const label = (x, y, value, size = 17) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="currentColor">${E(value)}</text>`;
  const circle = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="var(--bg, Canvas)" stroke="var(--link, currentColor)" stroke-width="2"/>`;
  const axes = x => `<path d="M${x-135} 155H${x+140}M${x} 55V225" fill="none" stroke="currentColor" opacity=".4"/>${label(x+145,177,'x')}${label(x,247,'0')}${label(x-120,177,'−1')}${label(x+120,177,'1')}`;
  const title = t('Absolute value and its weak derivative', '绝对值函数及其弱导数');
  const desc = t('Left panel: the continuous V-shaped graph y=|x| on the open interval (-1,1), with vertex (0,0). Right panel: y=-1 for -1<x<0 and y=1 for 0<x<1. Open circles over zero leave g(0) unspecified; any assigned value gives the same weak derivative almost everywhere. Domain endpoints are excluded.',
    '左图是在开区间 (-1,1) 上的连续 V 形图像 y=|x|，顶点是 (0,0)。右图在 -1<x<0 时为 y=-1，在 0<x<1 时为 y=1。零点上方的两个空心圆表示没有指定 g(0)，任意赋值都给出同一个几乎处处意义的弱导数。区间两端不包含在内。');
  return `<figure class="study-figure learning-figure" id="pilot-weak-derivative-figure"><p class="figure-title">${E(title)}</p><div class="figure-panels single-panel"><div class="figure-panel"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 275" role="img" aria-labelledby="pilot-weak-derivative-title" aria-describedby="pilot-weak-derivative-desc" style="display:block;width:100%;height:auto"><title id="pilot-weak-derivative-title">${E(title)}</title><desc id="pilot-weak-derivative-desc">${E(desc)}</desc><g>${label(180,30,'u(x) = |x|',21)}${axes(180)}<path d="M60 95L180 155L300 95" fill="none" stroke="var(--link, currentColor)" stroke-width="3"/>${circle(60,95)}${circle(300,95)}${label(158,100,'1')}</g><g>${label(540,30,t('g(x) = sign(x), x ≠ 0','g(x) = sign(x)，x ≠ 0'),21)}${axes(540)}<path d="M420 215H540M540 95H660" fill="none" stroke="var(--link, currentColor)" stroke-width="3"/>${circle(420,215)}${circle(540,215)}${circle(540,95)}${circle(660,95)}${label(519,101,'1')}${label(515,220,'−1')}</g></svg></div></div><figcaption>${markdown.renderInline(t(String.raw`The left vertex belongs to the graph. The right panel specifies $g$ only away from $0$; changing $g(0)$ does not change any integral or the weak derivative. The domain is $(-1,1)$, so its endpoints are open. Original schematic drawn for this example.`, String.raw`左图包含原点。右图只指定了 $g$ 在 $0$ 以外的值；改变 $g(0)$ 不影响积分，也不改变弱导数。定义域是 $(-1,1)$，因此两端为空心点。本图为这个例子独立绘制。`))}</figcaption></figure>`;
}

function hunterReference(locale) {
  return `<p class="knowledge-meta">${a(hunterSource.url + '#page=3', hunterSource.title)} — ${E(hunterSource.author)}. ${E(choose(hunterSource.locator, locale))} ${E(choose(hunterSource.access, locale))} ${a(hunterSource.sourceUrl, text('Source page', '来源页', locale))} · ${text('Source checked', '来源核查', locale)} <time datetime="${hunterSource.checked}">${hunterSource.checked}</time>.</p>`;
}

/** Return '' for non-pilot IDs, so callers may render every subject uniformly. */
export function pilotSubjectSection(subjectId, {topics, locale = 'en'} = {}) {
  if (!Object.hasOwn(pilotSubjects, subjectId)) return '';
  const {entry, link} = context(subjectId, topics, locale);
  const lang = locale === 'zh' ? 'zh-Hans' : 'en';
  const exampleLinks = subjectId === 'algebraic-geometry' ? ['ag-figure', 'ag-gluing', 'ag-two-lines', 'ag-cusp']
    : subjectId === 'probability' ? ['prob-figure', 'prob-conditioning', 'prob-averages'] : ['pde-initial-value'];
  const reviewLinks = subjectId === 'algebraic-geometry' ? ['ag-localization-review', 'ag-sheaf-review']
    : subjectId === 'probability' ? ['prob-analysis-review', 'prob-measure-review'] : ['pde-analysis-review', 'pde-measure-review', 'pde-functional-review'];
  const check = subjectId === 'differential-equations' ? `${weakDerivativeFigure(locale)}<section id="${weakDerivativeCheck.id}"><h3>${text('Try the test-function identity', '验证测试函数恒等式', locale)}</h3>${para(choose(weakDerivativeCheck.prompt, locale))}<details data-portal-disclosure><summary>${text('A hint', '提示', locale)}</summary>${para(choose(weakDerivativeCheck.hint, locale))}</details><details data-portal-disclosure><summary>${text('Work through the solution', '解答', locale)}</summary>${paragraphs(choose(weakDerivativeCheck.solution, locale))}</details></section>${hunterReference(locale)}` : '';
  return `<section id="pilot-study" class="subject-guide" lang="${lang}"><h2>${E(choose(entry.title, locale))}</h2>${para(choose(entry.opening, locale))}<h3 id="pilot-reading">${text('What to read for this step', '这一步读什么', locale)}</h3>${paragraphs(choose(entry.reading, locale))}<p>${['primary-reading', 'reading-comparison', 'practice'].map(link).join(' · ')}</p><h3 id="pilot-example">${text('One example to keep in view', '带着这个例子读', locale)}</h3>${paragraphs(choose(entry.example, locale))}<ul>${exampleLinks.map(key => `<li>${link(key)}</li>`).join('')}</ul>${check}<h3 id="pilot-preparation">${text('When to review, when to continue', '哪些要补，哪些可以跳过', locale)}</h3>${para(choose(entry.skip, locale))}<ul>${reviewLinks.map(key => `<li>${link(key)}</li>`).join('')}</ul>${revision(entry, locale)}</section>`;
}

/** A short stage-specific companion, not a second direction introduction. */
export function pilotRouteSection(routeId, {topics, locale = 'en'} = {}) {
  if (!Object.hasOwn(routes, routeId)) return '';
  const {entry, link, subject} = context(routes[routeId], topics, locale);
  return `<section id="pilot-route" lang="${locale === 'zh' ? 'zh-Hans' : 'en'}"><h2>${text('Reading and checks along this route', '配合这条路线读什么', locale)}</h2><p>${text('Use these links at the relevant stage. The existing hints, solutions and preparation checks remain on their subject pages.', '读到相应阶段时再用这些入口。原有的提示、解答和先修检查仍在各自的学科页面，不必在这里重复读。', locale)}</p><ol>${pilotRouteSteps[routeId].map(step => `<li><p>${a('#stage-' + step.stage, choose(step.title, locale))}</p>${para(choose(step.text, locale))}<ul>${step.links.map(key => `<li>${link(key)}</li>`).join('')}</ul></li>`).join('')}</ol><p>${a(subject('pilot-study'), text('Open the subject’s worked example and reading notes', '查看这个学科的例子与选读说明', locale))}</p>${revision(entry, locale)}</section>`;
}
