// Read-only checks: no build, generated-page writes or publication.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contributionHub } from './contribution-hub.mjs';
import { markdown } from './knowledge-markdown.mjs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const decode = html => html.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ({
  amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'",
})[entity]);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)]
  .map(([, key, value]) => [key, decode(value)]));
const expectedForms = {
  'math-correction.yml': 'claim', 'broken-link.yml': 'link-text',
  'terminology-suggestion.yml': 'current-claim', 'resource-recommendation.yml': 'reading-purpose',
  'article-proposal.yml': 'location', 'translation-correction.yml': 'location',
};
const pages = ['en', 'zh'].map(locale => contributionHub({ locale }));
assert.deepEqual(contributionHub(), pages[0]);
assert.deepEqual(pages[0].contents.map(s => s.id), pages[1].contents.map(s => s.id));
assert.throws(() => contributionHub({ locale: 'unsupported' }), RangeError);
assert.deepEqual(Object.keys(pages[0]).sort(), ['aliases', 'body', 'contents', 'summary', 'title']);
assert(pages[0].aliases.includes('投稿') && pages[1].aliases.includes('Translation correction'));

let formulas;
for (const [index, page] of pages.entries()) {
  assert(page.title && page.summary && page.aliases.length);
  assert(page.body.includes('lang="' + (index ? 'zh-Hans' : 'en') + '"'));
  assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(page.body), 'No accidental control characters');
  assert(!/<(?:html|head|h1|script|iframe|form)\b/i.test(page.body), 'Content fragment only');
  const headings = [...page.body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)];
  assert.deepEqual(headings.map(([, id, label]) => ({ id, label: decode(label) })), page.contents);
  assert.equal(new Set(page.contents.map(s => s.id)).size, page.contents.length);
  assert(page.body.includes('<time datetime="2026-10-19">'));

  const anchors = [...page.body.matchAll(/<a\b[^>]+>/g)].map(m => attributes(m[0]));
  for (const anchor of anchors) {
    assert.equal(anchor.target, '_blank');
    assert.equal(anchor.rel, 'noopener noreferrer');
    assert.equal(new URL(anchor.href).protocol, 'https:');
    assert(!anchor.href.includes('github.com/jiayuchen-math/en/'));
  }
  const actions = anchors.filter(a => a['data-contribution-template']);
  assert.equal(actions.length, 6);
  assert.deepEqual(actions.map(a => a['data-contribution-template']), Object.keys(expectedForms));
  for (const anchor of actions) {
    const template = anchor['data-contribution-template'];
    const url = new URL(anchor.href);
    const form = read('.github/ISSUE_TEMPLATE/' + template);
    const ids = [...form.matchAll(/^    id: ([a-z0-9-]+)$/gm)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, template + ': unique field IDs');
    assert.equal(url.origin, 'https://github.com');
    assert.equal(url.pathname, '/jiayuchen-math/jiayuchen-math.github.io/issues/new');
    assert.equal(url.searchParams.get('template'), template);
    assert.equal(anchor['data-contribution-page-field'], 'page-url');
    assert.equal(anchor['data-contribution-location-field'], expectedForms[template]);
    for (const field of ['page-url', expectedForms[template]]) {
      assert(ids.includes(field), template + ': prefill field exists: ' + field);
      assert(url.searchParams.get(field)?.trim(), template + ': readable no-JS default');
    }
    assert.equal(url.searchParams.get('page-url'), 'https://jiayuchen-math.github.io/resources/encyclopedia/contributing.html');
    // MAIN can prefill real context without replacing the template selection.
    const referring = 'https://jiayuchen-math.github.io/resources/library-paths/algebraic-geometry.html?lang=zh&fromPath=algebraic-geometry#route-stage-1';
    url.searchParams.set(anchor['data-contribution-page-field'], referring);
    url.searchParams.set(anchor['data-contribution-location-field'], 'Section 2 / 局部化与粘合');
    assert.equal(url.searchParams.get('template'), template);
    assert.equal(url.searchParams.get('page-url'), referring);
    assert.equal(url.searchParams.get(expectedForms[template]), 'Section 2 / 局部化与粘合');
  }

  const sample = decode(page.body.match(/<pre><code class="language-markdown">([\s\S]*?)<\/code><\/pre>/)[1]);
  assert(sample.includes('## Examples and non-examples'));
  assert(!sample.startsWith('---'), 'Example is explicitly a body excerpt');
  assert(sample.includes('https://www.math.ucdavis.edu/~hunter/pdes/pde_notes.pdf'));
  const rendered = markdown.render(sample);
  assert(rendered.includes('katex-display') && rendered.includes('katex-mathml'));
  assert(rendered.includes('href="https://www.math.ucdavis.edu/~hunter/pdes/pde_notes.pdf"'));
  // Natural Chinese can place a condition before its conclusion: compare the
  // formula multiset, not the order in which inline formulas occur.
  const actual = [...rendered.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map(m => decode(m[1])).sort();
  if (!formulas) formulas = actual;
  else assert.deepEqual(actual, formulas, 'English/Chinese example mathematics match');

  for (const id of ['editing-an-existing-entry', 'adding-a-new-entry', 'sources-and-translation-evidence', 'format-and-mathematical-notation', 'attribution-and-licensing', 'review-checklist']) {
    assert(page.contents.some(s => s.id === id), 'Keep original instructions: ' + id);
  }
  const topics = page.body.match(/id="open-topics"[\s\S]*?<ul>([\s\S]*?)<\/ul>/)[1];
  assert([...topics.matchAll(/<li>/g)].length <= 6);
  assert(!/<a\b/.test(topics), 'No empty entry links for solicitations');
  assert(!/href="(?:#|)"|example\.(?:com|org)/.test(page.body));
  for (const text of ['https://creativecommons.org/licenses/by-sa/4.0/', 'JSON', 'YAML', 'npm ci --prefix resources --ignore-scripts', 'node resources/build.mjs']) assert(page.body.includes(text));
  assert(anchors.some(a => a.href.endsWith('/resources/content/SCHEMA.md')));
}
assert.match(pages[0].body, /does not relicense existing personal notes/);
assert.match(pages[0].body, /source checking is not external peer review/i);
assert.match(pages[0].body, /AI-assisted drafting or translation/);
assert.match(pages[0].body, /not a complete new entry or a publish-ready file/);
assert.match(pages[1].body, /并非他写/);
assert.match(pages[1].body, /不表示.*数学复核/);
assert.match(pages[1].body, /不能直接作为新文章发布/);

// Targeted form-contract checks, not a substitute for GitHub's YAML validation.
const requiredFields = {
  'article-proposal.yml': ['page-url', 'location', 'reader-level', 'question', 'related-pages', 'primary-sources', 'proposed-contribution', 'attribution-rights'],
  'translation-correction.yml': ['page-url', 'location', 'english-passage', 'proposed-chinese', 'reason', 'evidence'],
};
for (const [file, required] of Object.entries(requiredFields)) {
  const yaml = read('.github/ISSUE_TEMPLATE/' + file).replaceAll('\r\n', '\n');
  assert(!yaml.includes('\t'));
  assert.match(yaml, /^name: .+\ndescription: .+\ntitle: ".+"\nbody:\n/);
  const fields = yaml.split(/^  - type: /m).slice(1);
  for (const id of required) {
    const field = fields.find(block => block.includes('\n    id: ' + id + '\n'));
    assert(field, file + ': required field exists: ' + id);
    assert(field.includes('    validations:\n      required: true'), file + ': field required: ' + id);
  }
  assert(yaml.includes('GitHub sign-in') && yaml.includes('site account'));
}
const pr = read('.github/PULL_REQUEST_TEMPLATE.md');
for (const text of ['CC BY-SA 4.0', 'AI-assisted', 'read-only', 'JSON-front-matter', '实际', '来源', '许可', 'Check only items you actually checked']) assert(pr.includes(text));
console.log(JSON.stringify({ locales: 2, sharedHeadingIDs: pages[0].contents.length, actionLinksPerLocale: 6, prefillFieldContracts: true, exampleMathAligned: true, buildOrPublication: false }));
