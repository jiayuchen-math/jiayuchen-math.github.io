// Standalone, read-only test. No build, generated pages or fixture updates.
// Run from any working directory: node <repo>/resources/test-learning-pilots.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodeHTML} from 'entities';
import {pilotSubjectSection, pilotRouteSection} from './learning-pilots.mjs';
import {pilotSubjects, pilotRouteSteps, weakDerivativeCheck, hunterSource} from './data/learning-pilots.mjs';
import {goalPaths} from './goal-paths.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const topics = json('notes/reading-notes/library/catalogue.json').topics;
const courses = json('resources/data/course-study-guides.json');
const originalChecks = json('resources/content/study-checks.json');
const editorialChecks = json('resources/content/learning-checks.json').subjects;
const editorial = json('resources/data/learning-editorial.json').subjects;
const subjectFile = id => 'notes/reading-notes/library/' + topics.find(t => t.id === id).route;
const routeFile = id => 'resources/library-paths/routes/' + id + '.html';
const ids = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const formulas = html => [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map(m => decodeHTML(m[1]));
const links = html => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(m => ({tag: m[1], href: decodeHTML(m[1].match(/\bhref="([^"]*)"/)[1])}));
const stripPayload = html => html.replace(/<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g, '');
const digest = file => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const filesBelow = dir => fs.readdirSync(path.join(root, dir), {withFileTypes: true}).flatMap(item => item.isDirectory() ? filesBelow(dir + '/' + item.name) : [dir + '/' + item.name]);
const protectedFiles = [
  'resources/data/course-study-guides.json', 'resources/content/study-checks.json',
  'resources/content/learning-checks.json', 'resources/data/learning-editorial.json',
  'resources/content/direction-introductions-a.json', 'resources/content/direction-introductions-b.json',
  'resources/subject-translations.mjs', 'resources/route-translations.mjs',
  ...filesBelow('resources/data/translations'),
];
const before = new Map(protectedFiles.map(file => [file, digest(file)]));
const originalTopics = JSON.stringify(topics);
const frozenTopics = Object.freeze(topics.map(t => Object.freeze({...t})));
const fragments = new Map();

assert.deepEqual(Object.keys(pilotSubjects).sort(), ['algebraic-geometry', 'differential-equations', 'probability']);
assert.deepEqual(Object.keys(pilotRouteSteps).sort(), ['algebraic-geometry', 'analysis-pde', 'probability']);
assert.equal(pilotSubjectSection('calculus'), '');
assert.equal(pilotRouteSection('topology'), '');
assert.equal(pilotSubjectSection('__proto__'), '');
assert.equal(pilotRouteSection('constructor'), '');
assert.throws(() => pilotSubjectSection('probability'), /topics array/);
assert.throws(() => pilotSubjectSection('probability', {topics: [], locale: 'zh'}), /Missing or unsafe/);
assert.throws(() => pilotRouteSection('analysis-pde', {topics, locale: 'fr'}), /locale/);
for (const route of ['../escape.html', 'https://example.org/evil.html', 'x.html?y=1', 'x/../../escape.html', 'x\\evil.html', 'x.html" onclick="evil']) {
  assert.throws(() => pilotSubjectSection('probability', {topics: topics.map(t => t.id === 'probability' ? {...t, route} : t)}), /Missing or unsafe/);
}

for (const [subjectId, entry] of Object.entries(pilotSubjects)) {
  const route = goalPaths.find(r => r.id === entry.route);
  assert(route, 'Existing route required: ' + entry.route);
  const originals = [...(originalChecks[subjectId] || []), ...(editorialChecks[subjectId] || [])];
  assert(originals.length, 'Preserve and link existing checks');
  for (const locale of ['en', 'zh']) {
    const subject = pilotSubjectSection(subjectId, {topics: frozenTopics, locale});
    const routeHTML = pilotRouteSection(entry.route, {topics: frozenTopics, locale});
    fragments.set(`${locale}:${subjectFile(subjectId)}`, subject);
    fragments.set(`${locale}:${routeFile(entry.route)}`, routeHTML);
    assert(subject.startsWith('<section id="pilot-study"'));
    assert(routeHTML.startsWith('<section id="pilot-route"'));
    assert.match(routeHTML, /^<section[^>]*><h2>/);
    for (const html of [subject, routeHTML]) {
      assert(html.includes(`lang="${locale === 'zh' ? 'zh-Hans' : 'en'}"`));
      assert.equal(ids(html).length, new Set(ids(html)).size, 'No duplicate fragment IDs');
      assert(!/class="study-checks"|id="study-guide"|id="introduction"|subject-guide:start/.test(html));
      assert(!/class="katex-error"|<script\b|<button\b|onclick=|href="#"/.test(html));
      assert(html.includes('2026-10-19'));
      assert(html.includes(locale === 'zh' ? 'AI 辅助起草' : 'AI-assisted drafting'));
      assert(html.includes(locale === 'zh' ? '尚无独立人工数学复核记录' : 'human mathematical review has not been recorded'));
      for (const match of html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)) {
        assert.match(match[1], /^<summary>[^<]+<\/summary>/);
        assert(match[1].replace(/<summary>[\s\S]*?<\/summary>/, '').replace(/<[^>]+>/g, '').trim(), 'No empty disclosures');
      }
      for (const link of links(html)) {
        if (link.href.startsWith('https://')) {
          assert.match(link.tag, /target="_blank"/);
          assert.match(link.tag, /rel="noopener noreferrer"/);
          assert.equal(new URL(link.href).protocol, 'https:');
        } else {
          assert(link.href.startsWith('/en/') || link.href.startsWith('#'), 'Internal convention');
          assert(!/\btarget=/.test(link.tag), 'Internal navigation stays in the same tab');
          if (link.href.startsWith('/en/')) {
            const url = new URL(link.href, 'https://jiayuchen-math.github.io');
            assert.equal(url.searchParams.get('fromPath'), entry.route);
            assert.equal(url.searchParams.get('lang'), locale);
          }
        }
      }
    }
    const subjectPage = stripPayload(read(subjectFile(subjectId))).replace(/<!-- pilot-edition:start -->[\s\S]*?<!-- pilot-edition:end -->/g,'');
    const routePage = stripPayload(read(routeFile(entry.route))).replace(/<!-- pilot-route:start -->[\s\S]*?<!-- pilot-route:end -->/g,'');
    assert(subjectPage.includes('<!-- subject-guide:end -->'), 'Integration marker must exist');
    assert(routePage.includes('id="introduction"'), 'Keep the original introduction');
    for (const id of ids(subject)) assert(!ids(subjectPage).includes(id), 'New subject ID collides: ' + id);
    for (const id of ids(routeHTML)) assert(!ids(routePage).includes(id), 'New route ID collides: ' + id);
    const simulatedSubject = subjectPage.replace('<!-- subject-guide:end -->', '<!-- subject-guide:end --><div id="pilot-copy">' + subject + '</div>');
    assert(simulatedSubject.indexOf('id="pilot-study"') > simulatedSubject.indexOf('<!-- subject-guide:end -->'));
    assert.equal((simulatedSubject.match(/id="pilot-copy"/g) || []).length, 1);
    assert(simulatedSubject.includes('id="study-guide"'));
    for (const check of originals) assert(simulatedSubject.includes('id="check-' + check.id + '"'), 'Old check ID retained');
    for (const step of pilotRouteSteps[entry.route]) {
      assert(route.stages[step.stage - 1], 'Stage exists in the current curriculum');
      assert(routeHTML.includes('href="#stage-' + step.stage + '"'));
      assert(routePage.includes('id="stage-' + step.stage + '"'));
      assert(step.links.length >= 2, 'Stage has concrete reading/task/review links');
    }
  }
  const en = fragments.get('en:' + subjectFile(subjectId));
  const zh = fragments.get('zh:' + subjectFile(subjectId));
  const enRoute = fragments.get('en:' + routeFile(entry.route));
  const zhRoute = fragments.get('zh:' + routeFile(entry.route));
  for (const [english, chinese] of [[en, zh], [enRoute, zhRoute]]) {
    assert.deepEqual(ids(english), ids(chinese), 'Stable bilingual anchors');
    // Chinese sentence order may move inline formulas; their multiset must match.
    assert.deepEqual(formulas(english).sort(), formulas(chinese).sort(), 'Identical bilingual formula sources');
    for (const tag of ['p', 'h2', 'h3', 'li', 'details', 'svg']) {
      const count = html => (html.match(new RegExp('<' + tag + '(?:>|\\s)', 'g')) || []).length;
      assert.equal(count(english), count(chinese), 'Matching bilingual structure: ' + tag);
    }
    const canonicalLinks = html => links(html).map(({href}) => href.replace('lang=en', 'lang=LANG').replace('lang=zh', 'lang=LANG'));
    assert.deepEqual(canonicalLinks(english), canonicalLinks(chinese), 'Translation changes no link target');
  }
}

// Resolve EVERY internal target against current files plus the new fragments.
// Existing files are read, never regenerated. Mounting is simulated in memory.
let checkedLinks = 0;
for (const [key, html] of fragments) {
  const split = key.indexOf(':'), locale = key.slice(0, split), currentFile = key.slice(split + 1);
  for (const {href} of links(html)) {
    if (href.startsWith('https://')) continue;
    const url = new URL(href, 'https://jiayuchen-math.github.io/en/' + currentFile);
    const file = decodeURIComponent(url.pathname.replace(/^\/en\//, ''));
    assert(fs.existsSync(path.join(root, file)), 'Missing internal file: ' + file);
    const target = stripPayload(read(file)) + (fragments.get(`${locale}:${file}`) || '');
    if (url.hash) assert(ids(target).includes(url.hash.slice(1)), 'Missing anchor: ' + href);
    checkedLinks++;
  }
}

const pdeEN = fragments.get('en:' + subjectFile('differential-equations'));
const pdeZH = fragments.get('zh:' + subjectFile('differential-equations'));
assert.equal((pdeEN.match(/<svg\b/g) || []).length, 1, 'One original two-panel SVG');
assert.equal((pdeEN.match(/<g>/g) || []).length, 2);
assert.equal((pdeEN.match(/<circle\b/g) || []).length, 6, 'Open interval endpoints plus both holes over zero');
assert.match(pdeEN, /<path d="M60 95L180 155L300 95"/);
assert.match(pdeEN, /<path d="M420 215H540M540 95H660"/);
assert.match(pdeEN, /role="img" aria-labelledby="pilot-weak-derivative-title" aria-describedby="pilot-weak-derivative-desc"/);
assert.match(pdeEN, /width:100%;height:auto/);
for (const html of [pdeEN, pdeZH]) {
  for (const match of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
    for (const id of match[1].split(' ')) assert(ids(html).includes(id));
  }
  assert(html.includes('id="' + weakDerivativeCheck.id + '"'));
  assert.equal((html.match(/data-portal-disclosure/g) || []).length, 2);
  assert(formulas(html).some(f => f.includes('C_c^\\infty((-1,1))')));
  assert(formulas(html).some(f => f.includes('[x\\varphi(x)]_{0}^{1}')));
  assert(formulas(html).some(f => f.includes('W^{1,p}((-1,1))')));
}
assert(!Object.values(originalChecks).flat().some(c => 'check-' + c.id === weakDerivativeCheck.id));
assert(!Object.values(editorialChecks).flat().some(c => 'check-' + c.id === weakDerivativeCheck.id));
const geometry = fragments.get('en:' + subjectFile('algebraic-geometry'));
const probability = fragments.get('en:' + subjectFile('probability'));
for (const html of [geometry, probability]) assert(!html.includes('<svg'), 'Reuse figures by anchor, not copying');
assert(geometry.includes('learning-ag-local-gluing'));
assert(probability.includes('learning-probability-conditioning'));
assert(geometry.includes('Milne remains the starting text'));
assert(geometry.includes('October 21, 2025') && geometry.includes('November 18, 2017'));
assert(courses['algebraic-geometry'].alternatives[0].url.includes('FOAGoct2125public.pdf'));
assert(json('resources/content/direction-introductions-a.json')['algebraic-geometry'].references.some(r => r.url.includes('FOAGnov1817public.pdf')));
assert(probability.includes('July 4, 2006') && probability.includes('July 22, 2006'));
assert(courses.probability.primary.title.includes('July 4, 2006'));
assert(json('resources/content/direction-introductions-b.json').probability.references.some(r => JSON.stringify(r).includes('July 22, 2006')));
assert.equal(courses['differential-equations'].primary.author, 'Jiří Lebl');
assert(editorial['differential-equations'].comparison.some(r => r.author.includes('Dyatlov')));
assert.equal(hunterSource.checked, '2026-10-19');
assert.equal(hunterSource.url, 'https://www.math.ucdavis.edu/~hunter/pdes/ch3.pdf');
assert(hunterSource.locator.en.includes('Definition 3.1, printed p. 47'));
assert(hunterSource.locator.en.includes('Example 3.3, printed p. 48'));
assert(pdeEN.includes('Example 3.3 treats') && pdeZH.includes('例3.3处理的是'), 'Do not misattribute the absolute-value example');

// A numerical sanity check supplements, and does not replace, the displayed
// proof for every test function. Shifted C_c^infinity bumps avoid an oddness-only
// zero integral; split at zero because sign(x) has a jump there.
function integrate(f, a, b, n = 3000) {
  const h = (b - a) / n;
  let total = f(a) + f(b);
  for (let i = 1; i < n; i++) total += (i % 2 ? 4 : 2) * f(a + i * h);
  return total * h / 3;
}
for (const c of [-0.2, 0.18, 0.35]) {
  const radius = 0.55;
  const phi = x => Math.abs(x - c) < radius ? Math.exp(-1 / (radius * radius - (x - c) ** 2)) : 0;
  const derivative = x => Math.abs(x - c) < radius ? -2 * (x - c) * phi(x) / (radius * radius - (x - c) ** 2) ** 2 : 0;
  const left = integrate(x => Math.abs(x) * derivative(x), -1, 0) + integrate(x => Math.abs(x) * derivative(x), 0, 1);
  const right = integrate(phi, -1, 0) - integrate(phi, 0, 1);
  assert(Math.abs(right) > 1e-5, 'Use a genuinely nonsymmetric test function');
  assert(Math.abs(left - right) < 1e-9, 'Weak derivative sign/integration identity');
}
assert.equal(JSON.stringify(topics), originalTopics, 'Caller topics are not mutated');
for (const [file, hash] of before) assert.equal(digest(file), hash, 'Protected source changed: ' + file);
assert.equal(pilotSubjectSection('probability', {topics}), fragments.get('en:' + subjectFile('probability')), 'Default locale and deterministic rendering');
assert.equal(pilotRouteSection('analysis-pde', {topics}), fragments.get('en:' + routeFile('analysis-pde')));
console.log(JSON.stringify({passed: true, subjects: 3, routes: 3, locales: ['en', 'zh'], fragments: fragments.size, checkedInternalLinks: checkedLinks, originalSVGs: 1, newChecks: 1, protectedSourceFiles: before.size, buildRun: false, published: false}));
