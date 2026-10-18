import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeHTML} from 'entities';
import {algebraicGeometryTopic} from './algebraic-geometry-topic.mjs';
import {algebraicGeometryTopicData as topic, algebraicGeometrySourceChecks as checks} from './data/algebraic-geometry-topic.mjs';
import {loadKnowledge} from './build-knowledge.mjs';

// Standalone, read-only checks: does not invoke any site builder or write files.
const root = fileURLToPath(new URL('../', import.meta.url));
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const catalogue = json('notes/reading-notes/library/catalogue.json');
const registry = json('resources/data/stable-ui-ids.json').library;
const normal = url => url.replace(/\/$/, '');
const books = [...new Map(catalogue.topics.flatMap(t => t.books).map(book => [normal(book.url), book])).values()];
const workIds = Object.fromEntries(books.map(book => [registry[normal(book.url)], book]));
const knowledge = loadKnowledge(root);
const readings = ['algebra', 'breadth'].flatMap(area => json(`resources/data/concept-readings-${area}.json`));
const inputs = {books, workIds, knowledge, readings};
const before = JSON.stringify(inputs);
const en = algebraicGeometryTopic(inputs);
const zh = algebraicGeometryTopic({...inputs, locale: 'zh'});
assert.equal(JSON.stringify(inputs), before, 'Renderer must not mutate the caller’s records');
assert.deepEqual(Object.keys(en).sort(), ['aliases', 'body', 'contents', 'summary', 'title']);
assert.equal(en.title, 'Algebraic Geometry');
assert.equal(zh.title, '代数几何');
const ids = ['varieties-schemes', 'sheaves-cohomology', 'descent-spaces-stacks', 'etale-arithmetic', 'derived-higher', 'perfectoid-prismatic'];
assert.deepEqual(en.contents.map(e => e.id), ids);
assert.deepEqual(zh.contents.map(e => e.id), ids);
assert(en.aliases.includes('DAG') && en.aliases.includes('代数几何专题'));
const selected = new Set(topic.sections.flatMap(s => s.readings.map(r => r.workId)));
assert.equal(selected.size, 13);
assert.deepEqual([...selected].sort(), Object.keys(checks).sort());
for (const section of topic.sections) {
  assert(section.readings.length >= 2 && section.readings.length <= 3);
  for (const language of ['en', 'zh']) {
    for (const field of ['title', 'problem', 'note']) assert(section[field][language]);
    for (const reading of section.readings) for (const field of ['role', 'purpose', 'locator']) assert(reading[field][language]);
  }
}
const hrefs = body => [...body.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(m => ({href: decodeHTML(m[1]), tag: m[0]}));
const normalizedLinks = page => hrefs(page.body).map(({href}) => {
  const url = new URL(href, 'https://jiayuchen-math.github.io');
  url.searchParams.delete('lang');
  return url.href;
}).sort();
assert.deepEqual(normalizedLinks(en), normalizedLinks(zh), 'Translations must preserve reading destinations and context');
for (const page of [en, zh]) {
  const allIds = [...page.body.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(allIds.length, new Set(allIds).size, 'Duplicate anchors');
  for (const id of ids) assert(allIds.includes(id), 'Missing section ' + id);
  assert.equal((page.body.match(/<section\b/g) || []).length, 6);
  assert.equal((page.body.match(/data-work-id=/g) || []).length, 15);
  assert(!/<details\b|<h1\b|<html\b|undefined|\[object Object\]/.test(page.body));
  for (const {href, tag} of hrefs(page.body)) {
    if (href.startsWith('https://')) {
      assert(tag.includes('target="_blank"'));
      assert(tag.includes('rel="noopener noreferrer"'));
    } else {
      assert(href.startsWith('/en/'));
      assert(!tag.includes('target='));
      const url = new URL(href, 'https://jiayuchen-math.github.io');
      const relative = url.pathname.slice('/en/'.length);
      const file = path.join(root, relative, relative.endsWith('/') ? 'index.html' : '');
      assert(fs.existsSync(file), 'Missing existing link: ' + href);
      if (url.pathname.includes('/encyclopedia/') && !url.pathname.endsWith('/contributing.html')) {
        assert.equal(url.searchParams.get('fromPath'), 'algebraic-geometry');
      }
    }
  }
  assert(Buffer.byteLength(page.body) < 80 * 1024, 'Topic should remain a compact reading selection');
}
assert(en.body.includes('AI-assisted editorial compilation'));
assert(zh.body.includes('AI 辅助编选与中文翻译'));
assert(zh.body.includes('2018年2月3日未完成稿'));
assert(en.body.includes('v2.21, March 22, 2013'));
assert.equal((en.body.match(/Source and reading location checked/g) || []).length, 15);
assert.throws(() => algebraicGeometryTopic({...inputs, workIds: {}}), /missing stable catalogue work/);
assert.throws(() => algebraicGeometryTopic({...inputs, knowledge: {articles: [], terms: []}, readings: []}), /missing published concept/);
assert.throws(() => algebraicGeometryTopic({...inputs, locale: 'ja'}), /unsupported locale/);
const changed = {...workIds, 'work-0550': {...workIds['work-0550'], url: 'https://example.com/other-edition.pdf'}};
assert.throws(() => algebraicGeometryTopic({...inputs, workIds: changed}), /selected edition changed/);
const paid = {...workIds, 'work-0550': {...workIds['work-0550'], readingAccess: 'Institutional / purchase'}};
assert.throws(() => algebraicGeometryTopic({...inputs, workIds: paid}), /access needs rechecking/);
// Also accepts the portal’s lightweight catalogue records without confusing
// their internal entry URLs with external full-text URLs.
const rows = json('resources/catalogue-data/library/index.json').records;
const rowInputs = {...inputs, books: rows, workIds: Object.fromEntries(rows.map(row => [row.id, row]))};
assert(algebraicGeometryTopic(rowInputs).body.includes('https://arxiv.org/pdf/1905.08229'));
console.log(JSON.stringify({topic: topic.id, sections: 6, uniqueWorks: selected.size, readingSelections: 15, languages: ['en', 'zh'], bytes: {en: Buffer.byteLength(en.body), zh: Buffer.byteLength(zh.body)}, result: 'passed'}));
