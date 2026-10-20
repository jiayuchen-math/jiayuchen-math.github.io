// Read-only acceptance checks. Never import build.mjs or invoke a generator here.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodeHTML} from 'entities';
import {loadKnowledge, validateKnowledge} from './build-knowledge.mjs';
import {markdown, renderArticle} from './knowledge-markdown.mjs';
import {applicationState} from './assets/application-time.js';
import {feeAssessment, backgroundAssessment} from './assets/background-rules.js';
import researchers, {recentRecord} from './data/researchers.mjs';
import {nodes, routeFor} from './data/learning-paths.mjs';
import {knowledgePaths} from './data/knowledge-paths.mjs';
import {withAccess} from './data/library-access.mjs';
import {auditFields, admissionsAuditReport} from './data/admissions-audit.mjs';
import {cleanPageCopy} from './editorial-copy.mjs';
import * as search from './assets/search-core.js';
import * as catalogueCore from './assets/portal-catalogue-core.js';
import {backgroundForm} from './data/background-form.mjs';
import {protectedBytes,windowsSourceBlobs} from './protected-bytes.mjs';
import {titleDestination,entryActions,showsDetails,hasDetailContent} from './assets/entry-presentation.js';
import {loadConceptReadings} from './study-content.mjs';
import {loadAdviceReadings} from './advice-readings.mjs';
import {personalNotesPage} from './personal-notes.mjs';
import {addedCourseFiles} from './test-course-notes.mjs';
import {legacyCourseSources} from './test-course-note-layout.mjs';
import {addedLinearFiles,priorLinearSources} from './test-linear-notes.mjs';
import {addedExerciseFiles} from './test-calculus-exercises.mjs';
import {addedLinearExerciseFiles} from './test-linear-exercises.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const archivedCourseSources={...legacyCourseSources,...priorLinearSources},newNoteFiles=new Set([...addedCourseFiles,...addedLinearFiles,...addedExerciseFiles,...addedLinearExerciseFiles]);
const json = file => JSON.parse(read(file));
const sha = value => createHash('sha256').update(value).digest('hex');
const bytes = file => fs.statSync(path.join(root, file)).size;
const counts = {library:576, encyclopedia:150, terminology:513, links:80, programs:225, researchers:1939};
const applicationStatuses = ['Within reviewed window','Upcoming','Closed','Rolling','Deadline day — time unverified','Opening day — time unverified','Dates not verified'];
const backgroundStates = ['Potential route — confirmation needed','Documented qualification gap','Documented route mismatch','Eligibility not established'];
const routes = {
  library:'notes/reading-notes/library/catalogue.html',
  encyclopedia:'resources/encyclopedia/index.html', terminology:'resources/terminology/index.html',
  links:'resources/links/index.html', programs:'resources/study-careers/index.html',
  researchers:'resources/study-careers/researchers.html',
};
const supplementaryRoutes = {
  exposition:'notes/reading-notes/library/exposition.html',
  coverage:'resources/study-careers/coverage.html',
};
// Captured before the portal build on 2026-10-15, independently of portal-report.json.
// Hash each sorted "relative-path\0file-sha256" line, joined with LF (no trailing LF).
const baseline = {
  notes:{files:31, sha256:'8520fbb5a7c15594edfc375875b109c27a4d3401dd8535fa8b53f63a41033f28'},
  sourceMedia:{files:24, sha256:'f671c6d6391e9be78578ad5a5dd1b1cd8d69832e63f1e1c1a016e1511fdb4e7e'},
  encyclopedia:{files:150, sha256:'c86ed02a2dbaf4148465189f3a3d5683667cce65c4f19ff13ca76a000c628033'},
  terminology:{files:9, sha256:'224e83d6fe8bc05d0033b17bbe5cf97204ab26ead911bae1354a6213df9ec3d2'},
  businessData:{files:60, sha256:'4e8cc6f48277c9ad998054662eba8214e69a7ddeb187ffee7420a7e6fed71f9c'},
  articleBodies:{files:150, sha256:'315a18a6cfa95f6e01f28c1ba0a872cb5c7c223306e32663a5c0d725e9dc6ef5'},
};
// Freeze the existing inputs, while allowing new generated registries beside them.
const businessFiles = `admissions-audit-asia-additional.json admissions-audit-asia-undergraduate.json admissions-audit-asia.json admissions-audit-commonwealth.json admissions-audit-core.mjs admissions-audit-europe-other.json admissions-audit-kaust.mjs admissions-audit-latam-other.json admissions-audit-north-america-grad.json admissions-audit-north-america-ug.json admissions-audit-report.json admissions-audit.mjs application-windows.mjs background-form.mjs knowledge-index.json knowledge-paths.mjs learning-paths.mjs library-access.mjs library-additions.json library-balanced.mjs library-counts.mjs library-depth.mjs library-foundations.mjs library-free-alternatives.mjs library-open-algebra-logic.json library-open-analysis.json library-open-exposition.json library-open-foundations.json library-open-geometry.json library-open-number-theory.json library-open-probability-discrete.json library-open-source.mjs library-original.json library-source.mjs links-source.mjs links.json program-geography.mjs programs-commonwealth-expansion.mjs programs-expansion.mjs programs-source.mjs programs-world-expansion.mjs programs.json researcher-coverage.json researcher-coverage.mjs researchers-europe.json researchers-expansion.mjs researchers-global.json researchers.json researchers.mjs subject-guides.mjs terminology-algebra.json terminology-analysis.json terminology-category-theory.json terminology-combinatorics.json terminology-dynamics.json terminology-foundations.json terminology-geometry-topology.json terminology-number-theory.json terminology-probability.json`.split(' ').map(f => 'resources/data/'+f).concat('notes/reading-notes/library/catalogue.json');
const identityHashes = {
  encyclopedia:'6ac2eb7a56c5c3ad2d723562d22769f66ddc1e870f30a24494c8ade178cb0b66',
  terminology:'ab05770ad726dd0a9193e41c210dd9c09f22e280794326091bee07d71d06c3b2',
  programs:'4fcc2338f9e1c992529bd043d969c60715cd683a693d2c033225ef9cac83aabc',
  researchers:'2d5ee328a4d5e5d2c46a5cf6c37f48b1f25340db72e567a1e7a38bef1688c3aa',
};
const catalogue = json('notes/reading-notes/library/catalogue.json');
const knowledge = loadKnowledge(root);
const readingGuides = loadConceptReadings(root);
const adviceReadings = loadAdviceReadings(root);
// Immutable original content counts stay separate from the growing directory.
const directoryCounts = {...counts, encyclopedia:knowledge.articles.length+readingGuides.length,links:counts.links+adviceReadings.length};
const firstWorks = new Map();
for (const topic of catalogue.topics) for (const e of topic.books) {
  const key = e.url.replace(/\/$/, '');
  if (!firstWorks.has(key)) firstWorks.set(key, withAccess(e));
}
const works = [...firstWorks.values()];
const source = {library:works, encyclopedia:knowledge.articles, terminology:knowledge.terms,
  links:json('resources/data/links.json'), programs:json('resources/data/programs.json'), researchers};
const directorySource = {...source, encyclopedia:[...knowledge.articles,...readingGuides],links:[...source.links,...adviceReadings]};
const failures = [], passed = [], cache = new Map(), anchorCache = new Map(), cardCache = new Map();
async function check(label, fn) {
  try { await fn(); passed.push(label); console.log('PASS '+label); }
  catch (error) { failures.push({check:label, error:error.message}); console.error('FAIL '+label+': '+error.message); }
}
function walk(dir = '') {
  return fs.readdirSync(path.join(root, dir), {withFileTypes:true}).flatMap(e => {
    // Deployment copies are outputs, not additional authored source/media.
    if (['.git', 'node_modules', '_site'].includes(e.name)) return [];
    const file = path.posix.join(dir, e.name);
    return e.isDirectory() ? walk(file) : e.isFile() ? [file] : [];
  });
}
function fingerprint(files, value = file => protectedBytes(fs.readFileSync(path.join(root, archivedCourseSources[file]||file)),file)) {
  return {files:files.length, sha256:sha([...files].sort().map(file => file+'\0'+sha(value(file))).join('\n'))};
}
function articleBody(html) {
  const open = /<div\b[^>]*class="[^"]*\barticle-body\b[^"]*"[^>]*>/g.exec(html);
  assert(open, 'Missing .article-body');
  let depth = 1;
  const tags = /<\/?div\b[^>]*>/g;
  tags.lastIndex = open.index+open[0].length;
  for (let tag; (tag = tags.exec(html));) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(open.index+open[0].length, tag.index);
  }
  assert.fail('Unclosed .article-body');
}
function protectedSnapshot() {
  const files = walk();
  // New Notes landing page is navigation, not an authored course-note body.
  const entrances = ['notes/index.html', 'notes/reading-notes/library.html', 'notes/reading-notes/reading-notes.html',
    'notes/mathematical-notes/page.html', 'notes/mathematical-notes/weekly.html'];
  const groups = {
    notes:files.filter(f => f.startsWith('notes/') && !f.startsWith('notes/reading-notes/library/') && !entrances.includes(f) && !newNoteFiles.has(f) && /\.(md|html|tex|pdf|png|jpe?g|gif|svg|webp)$/i.test(f)),
    sourceMedia:files.filter(f => !newNoteFiles.has(f) && /\.(pdf|tex|png|jpe?g|gif|svg|webp)$/i.test(f)),
    encyclopedia:files.filter(f => f.startsWith('resources/content/encyclopedia/') && f.endsWith('.md')),
    terminology:files.filter(f => /^resources\/data\/terminology-.*\.json$/.test(f)),
    businessData:businessFiles,
  };
  const result = Object.fromEntries(Object.entries(groups).map(([name, list]) => [name, fingerprint(list)]));
  const ids = knowledge.articles.map(a => a.id).sort();
  result.articleBodies = {files:ids.length, sha256:sha(ids.map(id => id+'\0'+sha(articleBody(read(`resources/encyclopedia/${id}/index.html`)))).join('\n'))};
  return result;
}
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1], decodeHTML(m[2] ?? m[3])]));
const idsIn = html => [...html.matchAll(/<[a-z][^>]*>/gi)].flatMap(m => {
  const a = attrs(m[0]); return a.id ? [a.id] : [];
});
const linksIn = html => [...html.matchAll(/<a\b[^>]*>/gi)].map(m => attrs(m[0]).href).filter(Boolean);
const plain = html => decodeHTML(String(html).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
function hasText(html, value, label) {
  // The legacy renderer already applies this editorial pass to prose paragraphs.
  // Keep that pre-existing presentation rule; source records remain byte-protected.
  const escaped = String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const expected = plain(cleanPageCopy('<p>'+escaped+'</p>', 'resources/qa.html'));
  if (expected) assert(plain(html).includes(expected), label+': missing '+expected.slice(0, 120));
}
function cardsIn(file) {
  if (cardCache.has(file)) return cardCache.get(file);
  const html = cached(file), tags = /<\/?article\b[^>]*>/gi, result = [];
  let depth = 0, start, opening, inner;
  for (let tag; (tag = tags.exec(html));) {
    if (!tag[0].startsWith('</')) {
      if (depth++ === 0) { start = tag.index; opening = tag[0]; inner = tags.lastIndex; }
    } else if (--depth === 0) {
      const a = attrs(opening);
      if ((a.class || '').split(/\s+/).includes('portal-entry')) result.push({attrs:a, opening, body:html.slice(inner,tag.index), html:html.slice(start,tags.lastIndex)});
    }
  }
  assert.equal(depth,0,file+' unbalanced article tags');
  cardCache.set(file,result);
  return result;
}
function localURL(value, base = '/en/') {
  assert.equal(typeof value, 'string', 'URL must be a string');
  const url = new URL(decodeHTML(value), new URL(base, 'https://portal.invalid'));
  assert.equal(url.origin, 'https://portal.invalid', 'Expected a local URL: '+value);
  let file = decodeURIComponent(url.pathname).replace(/^\/en(?:\/|$)/, '').replace(/^\//, '');
  if (!file || file.endsWith('/')) file += 'index.html';
  const absolute = path.resolve(root, file);
  assert(absolute.startsWith(root+path.sep), 'URL escapes the site: '+value);
  return {file, hash:decodeURIComponent(url.hash.slice(1))};
}
function target(value, base) {
  const result = localURL(value, base);
  assert(fs.existsSync(path.join(root, result.file)), 'Missing local target '+value+' from '+(base || '/en/'));
  if (result.hash && result.file.endsWith('.html')) {
    if (!anchorCache.has(result.file)) anchorCache.set(result.file,new Set(idsIn(cached(result.file))));
    assert(anchorCache.get(result.file).has(result.hash), 'Missing anchor '+value+' from '+base);
  }
  return result.file;
}
function cached(file) {
  if (!cache.has(file)) cache.set(file, read(file));
  return cache.get(file);
}
function sameSet(actual, expected, label) {
  assert.equal(actual.length, new Set(actual).size, label+': duplicates');
  assert.deepEqual([...actual].sort(), [...expected].sort(), label);
}
function sourceLinks(html, expected, label) {
  const found = new Set(linksIn(html));
  for (const value of expected.flat(Infinity).filter(Boolean)) {
    const url = typeof value === 'string' ? value : value.url;
    assert(found.has(url), label+': missing source '+url);
  }
}
function externalLinks(html, label) {
  for (const tag of html.matchAll(/<a\b[^>]*>/gi)) {
    const a = attrs(tag[0]);
    if (/^https?:\/\//.test(a.href || '') && new URL(a.href).hostname !== 'jiayuchen-math.github.io') {
      assert.equal(a.target, '_blank', label+': external link target');
      for (const rel of ['noopener', 'noreferrer']) assert((a.rel || '').split(/\s+/).includes(rel), label+': external '+rel);
    }
  }
}
function fullDetail(record, collection) {
  if (record.detail) {
    const file = target(record.detail, '/en/resources/catalogue-data/'+collection+'/index.json');
    assert(file.endsWith('.json'), collection+': detail must load on demand from JSON');
    if (!cache.has(file)) cache.set(file, json(file));
    const html = cache.get(file)[record.id];
    assert.equal(typeof html, 'string', collection+'/'+record.id+': full detail HTML missing');
    assert(html.trim(), collection+'/'+record.id+': empty detail');
    return html;
  }
  assert(['encyclopedia', 'terminology'].includes(collection), collection+'/'+record.id+': missing detail shard');
  const file = target(record.url);
  assert(file.endsWith('/'+record.id+'/index.html'), collection+'/'+record.id+': missing standalone article');
  return cached(file);
}

await check('immutable pre-portal content and rendered article bodies', () => {
  assert.deepEqual(protectedSnapshot(), baseline);
  for(const [file,expected] of Object.entries(windowsSourceBlobs)){
    const bytes=Buffer.from(read(file).replaceAll('\r\n','\n'));
    const blob=createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex');
    assert.equal(blob,expected,'Pre-redesign Git blob identity, ignoring checkout EOL only: '+file);
  }
});
await check('source counts and stable original IDs', () => {
  validateKnowledge(knowledge, catalogue.topics);
  for (const [name, rows] of Object.entries(source)) {
    assert.equal(rows.length, counts[name], name+' baseline count');
    if (identityHashes[name]) assert.equal(sha(JSON.stringify(rows.map(e => e.id).sort())), identityHashes[name], name+' original IDs');
  }
  const senses = knowledge.terms.map(t => [t.english,t.chinese,t.topic].join('|').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase());
  assert.equal(senses.length,new Set(senses).size,'Duplicate terminology sense');
  const concepts = new Set([...knowledge.articles,...knowledge.terms].map(e => e.id));
  assert.equal(knowledgePaths.length,new Set(knowledgePaths.map(r => r.id)).size,'Duplicate knowledge route');
  for (const route of knowledgePaths) {
    assert(route.skip && route.concepts.length>=3,route.id+' incomplete knowledge route');
    for (const id of route.concepts) assert(concepts.has(id),route.id+' unpublished concept '+id);
  }
  const report = json('resources/knowledge-report.json');
  assert.equal(report.articles,knowledge.articles.length); assert.equal(report.terms,knowledge.terms.length);
  assert.equal(report.uniqueConcepts,concepts.size); assert.equal(report.readingRoutes,knowledgePaths.length);
  assert.equal(report.termsWithoutArticle,knowledge.terms.filter(t => !knowledge.articles.some(a => a.id===t.id)).length);
  assert(markdown.render('$x^2+1$').includes('katex-mathml'));
  assert(markdown.render('$$\nx^2+1\n$$').includes('katex-display'));
  assert(markdown.render('<script>alert(1)</script>').includes('&lt;script&gt;'));
  assert(!markdown.render('[bad](javascript:alert(1))').includes('href="javascript:'));
  assert.throws(() => markdown.render('$\\notarealmathcommand{x}$'));
  assert.throws(() => markdown.render('$$\nx'));
  assert.deepEqual(renderArticle('## A heading\n\n$x$\n\n## A heading\n\n$y$').contents.map(x => x.id),['a-heading','a-heading-2']);
  for (const match of read('resources/assets/katex/katex.min.css').matchAll(/url\(([^)]+)\)/g)) assert(fs.existsSync(path.join(root,'resources/assets/katex',match[1])),'Missing math font '+match[1]);
});
await check('application-window rules at fixed instants', () => {
  const timed = {openFrom:'2026-10-01T00:00:00Z', closeBefore:'2026-12-02T05:00:00Z'};
  for (const [time, expected] of [['2026-09-30T23:59:59Z','Upcoming'], ['2026-10-01T00:00:00Z','Within reviewed window'], ['2026-12-02T04:59:59Z','Within reviewed window'], ['2026-12-02T05:00:00Z','Closed']]) assert.equal(applicationState(timed, Date.parse(time)), expected);
  const date = {deadlineDate:'2026-12-15', deadlinePrecision:'date', openFrom:'2026-10-01T00:00:00Z'};
  assert.equal(applicationState(date, Date.parse('2026-12-15T16:00:00Z')), 'Deadline day — time unverified');
  assert.equal(applicationState(date, Date.parse('2026-12-16T00:00:00Z')), 'Closed');
  assert.equal(applicationState({...date, openingDate:'2026-10-01'}, Date.parse('2026-10-01T12:00:00Z')), 'Opening day — time unverified');
  assert.equal(applicationState({...date, timeZone:'America/New_York'}, Date.parse('2026-12-16T01:00:00Z')), 'Deadline day — time unverified');
  assert.equal(applicationState({}, Date.parse('2026-10-11T12:00:00Z')), 'Dates not verified');
  assert.equal(applicationState({deadlineDate:'2026-12-15', deadlinePrecision:'date'}, Date.parse('2026-10-11T12:00:00Z')), 'Dates not verified');
  assert.equal(applicationState({rolling:'true'}, Date.parse('2026-10-11T12:00:00Z')), 'Rolling');
  for (const institution of ['Harvard University', 'Stanford University', 'University of California, Berkeley']) assert(!source.programs.find(p => p.institution === institution && p.degree === 'Doctorate').applicationWindow, institution+': inferred opening');
});
await check('background, fee, public-record and learning-path rules', () => {
  const sw = {country:'Sweden', degree:'Masters'}, nl = {country:'Netherlands', degree:'Masters'};
  for (const [permit, permitCountry, permitValid, expected] of [
    ['Student visa / study permit','Sweden','yes','Fee status not established'],
    ['Permanent residence','Sweden','yes','Potential fee exemption'],
    ['Permanent residence','Sweden','no','Fee status not established'],
    ['Permanent residence','Germany','yes','Fee status not established'],
  ]) assert.equal(feeAssessment(sw, {permit, permitCountry, permitValid}).state, expected);
  const dutch = {citizenship:'EU / EEA', governmentFunded:'yes', previousDutchDegree:'no', feeYear:'2026-27'};
  assert.equal(feeAssessment(nl, dutch).state, 'Potential statutory fee category');
  for (const patch of [{previousDutchDegree:'yes'}, {feeYear:'2027-28 or later'}, {governmentFunded:'no'}]) assert.equal(feeAssessment(nl, {...dutch, ...patch}).state, 'Fee status not established');
  assert.equal(backgroundAssessment({eligibilityRule:'KAIST-international'}, {koreanCitizenship:'yes'}).state, 'Documented route mismatch');
  assert.equal(backgroundAssessment({entryLevels:['Master']}, {stage:'Bachelor'}).state, 'Documented qualification gap');
  assert.equal(backgroundAssessment({entryLevels:['Bachelor']}, {stage:'Bachelor'}).state, 'Potential route — confirmation needed');
  assert.equal(backgroundAssessment({}, {}).state, 'Eligibility not established');
  assert.equal(researchers.filter(p => p.studentRecords.some(recentRecord)).length, 3);
  assert(researchers.find(p => p.id === 'ewain-gwynne').studentRecords.some(r => r.student === 'Jinwoo Sung' && recentRecord(r)));
  for (const [date, expected] of [['2023',false], ['2024',true], ['2026',false]]) assert.equal(recentRecord({date, precision:'year'}), expected);
  for (const id of Object.keys(nodes)) for (const research of [false, true]) {
    const route = routeFor(id, research); assert.equal(new Set(route).size, route.length); assert.equal(route.at(-1), id);
  }
  assert.equal(admissionsAuditReport(source.programs).audited, 225);
});
await check('directory state privacy: ignore legacy background answers and never serialize them', () => {
  const names = [...backgroundForm(value => String(value)).matchAll(/<(?:input|select|textarea)\b[^>]*>/g)]
    .map(match => attrs(match[0]).name).filter(Boolean);
  assert(names.length>=16,'Missing optional background controls in privacy fixture');
  const answers = Object.fromEntries(names.map(name => [name,'private-'+name+'-qa7429']));
  const current = new URL('https://portal.invalid/en/resources/study-careers/?q=mathematics&country=Italy&degree=Masters&campaign=qa#old-bookmark');
  for (const [name,value] of Object.entries(answers)) current.searchParams.append('bg.'+name,value);
  current.searchParams.append('bg.citizenship','private-duplicate-qa7429');
  current.searchParams.append('bg.unrecognized','private-unknown-qa7429');
  const fields = catalogueCore.fieldNames([{fields:{country:'Italy',degree:'Masters','bg.stage':'Master'}}],
    [{field:'backgroundMatch'},{field:'bg.budget'}],{'bg.citizenship':'Other'},['q','page','bg.permit']);
  sameSet(fields,['country','degree','backgroundMatch'],'background names excluded from public filter fields');
  const before = current.href;
  const state = catalogueCore.readState(current,{fields});
  assert.deepEqual(Object.keys(state.background),[],'Legacy bg.* parameters hydrated personal answers');
  assert.equal(state.filters.country,'Italy'); assert.equal(state.filters.degree,'Masters');
  assert.equal(state.q,'mathematics'); assert.equal(current.href,before,'Reading state mutated the URL');
  state.background = answers; state.page = 2;
  const url = catalogueCore.stateURL('/en/resources/study-careers/',state,{},current);
  for (const key of url.searchParams.keys()) assert(!key.startsWith('bg.'),'Personal URL parameter '+key);
  for (const name of names) assert(!url.searchParams.has(name),'Background answer became a public parameter '+name);
  assert(!decodeURIComponent(url.href).includes('private-'),'Personal answer leaked into URL text');
  assert.equal(url.searchParams.get('country'),'Italy'); assert.equal(url.searchParams.get('degree'),'Masters');
  assert.equal(url.searchParams.get('campaign'),'qa'); assert.equal(url.searchParams.get('page'),'2');
  assert.equal(url.pathname,'/en/resources/study-careers/index-page-2.html');
  assert.equal(url.href,catalogueCore.stateURL('/en/resources/study-careers/',{...state,background:{}},{},current).href,'Background answers changed a shareable URL');
  assert.equal(current.href,before,'Serializing state mutated the current URL');
  assert.deepEqual(state.background,answers,'Serializing state mutated local answers');
  const restored = catalogueCore.readState(url,{fields});
  assert.deepEqual(Object.keys(restored.background),[],'Shared URL restored personal answers');
  restored.background.stage = 'Master';
  assert.deepEqual(Object.keys(catalogueCore.readState(url,{fields}).background),[],'Personal answers persisted between state reads');
});
await check('pure search: normalization, ranking, distinct senses, merging and pagination', () => {
  assert.equal(search.normalize('Étale — Poincaré’s'), 'etale poincares');
  assert.deepEqual(search.tokenize('GCD gcd  最大公因数'), ['gcd','最大公因数']);
  assert.equal(search.searchState({page:-2, type:'bad'}).page, 1);
  assert.equal(search.searchState({type:'bad'}).type, '');
  assert.throws(() => search.validateManifest({version:1, collections:[{id:'bad'}]}));
  assert.throws(() => search.validateShard({}, 'library'));
  assert.throws(() => search.validateShard([{id:'bad', type:'library'}], 'library'));
  const entry = (id, title, extra = {}) => ({id, title, type:'terminology', summary:'', url:'/en/resources/terminology/'+id+'/', ...extra});
  const fixtures = [entry('gcd','Greatest common divisor',{aliases:['GCD'], chinese:'最大公因数', area:'Number Theory'}),
    entry('poincare','Poincaré duality'), entry('normal-subgroup','Normal subgroup',{area:'Algebra'}),
    entry('normal-topological-space','Normal topological space',{area:'Topology'}), entry('gaussian-distribution','Normal distribution',{area:'Probability'}),
    entry('exact','Category theory'), entry('prefix','Category theory exercises'), entry('summary','Other',{summary:'category theory'})];
  const docs = search.prepareEntries(fixtures);
  for (const q of ['GCD','最大公因数']) assert.equal(search.searchEntries(docs,{q})[0].id,'gcd');
  assert.equal(search.searchEntries(docs,{q:'Poincare duality'})[0].id,'poincare');
  sameSet(search.searchEntries(docs,{q:'normal'}).map(e => e.id), ['normal-subgroup','normal-topological-space','gaussian-distribution'], 'normal senses');
  assert.equal(search.searchEntries(docs,{q:'normal',area:'Probability'})[0].id,'gaussian-distribution');
  assert.deepEqual(search.searchEntries(docs,{q:'category theory'}).map(e => e.id), ['exact','prefix','summary']);
  assert.equal(search.searchEntries(docs,{q:'no-such-math-7429'}).length,0);
  assert.deepEqual(search.searchEntries(docs,{}),[]);
  const merged = search.prepareEntries([entry('same','Term'),entry('same','Article',{type:'encyclopedia'}),entry('same','Duplicate')],true);
  assert.equal(merged.length,1); assert.equal(merged[0].entry.type,'encyclopedia'); assert(merged[0].entry.termUrl);
  const many = search.prepareEntries(Array.from({length:57}, (_,i) => entry('fixture-'+i,'Fixture '+String(i).padStart(2,'0'))));
  const collections = [{id:'terminology',label:'Terms'}];
  const first = search.searchResponse(many,{q:'Fixture',type:'terminology'},collections);
  const last = search.searchResponse(many,{q:'Fixture',type:'terminology',page:999},collections);
  assert.equal(first.total,57); assert.equal(first.items.length,25); assert.equal(last.page,3); assert.equal(last.items.length,7);
  assert.equal(search.searchResponse(many,{q:'Fixture'},collections).groups[0].items.length,3);
});

const options = new Set(process.argv.slice(2));
for (const option of options) assert(['--baseline','--business-only'].includes(option), 'Unknown option '+option);
if (options.has('--baseline')) console.log(JSON.stringify({counts, protected:protectedSnapshot(), baseline}, null, 2));
if (!options.has('--baseline') && !options.has('--business-only')) {
  let report;
  await check('portal report and independent protection evidence', () => {
    report = json('resources/portal-report.json');
    assert.deepEqual(report.counts, {...counts,links:directoryCounts.links});
    assert(Array.isArray(report.directories));
    sameSet(report.directories.map(d => d.id), Object.keys(routes), 'directory report IDs');
    assert(Array.isArray(report.supplementaryDirectories),'Missing supplementary directory report');
    sameSet(report.supplementaryDirectories.map(d => d.id),Object.keys(supplementaryRoutes),'supplementary report IDs');
    assert.equal(report.limits.firstPageHTML,350*1024); assert.equal(report.limits.searchIndex,2*1024*1024);
    for (const key of ['protected','knowledgeSources']) {
      assert(Array.isArray(report[key]) && report[key].length, 'Missing report '+key);
      sameSet(report[key].map(e => e[0]), [...new Set(report[key].map(e => e[0]))], key+' paths');
      for (const [file, digest] of report[key]) assert.equal(sha(protectedBytes(fs.readFileSync(path.join(root,file)),file)), digest, 'Report digest '+file);
    }
    const expectedNotes = walk('notes').filter(f => /\.(pdf|tex|png|jpe?g|svg|webp)$/i.test(f) || /\/(calculus|linear-algebra)\/.*\.html$/.test(f));
    sameSet(report.protected.map(e => e[0]),expectedNotes,'report protected coverage');
    sameSet(report.knowledgeSources.map(e => e[0]),walk('resources/content/encyclopedia').filter(f => f.endsWith('.md')),'report knowledge coverage');
  });
  const registry = fs.existsSync(path.join(root,'resources/data/stable-ui-ids.json')) ? json('resources/data/stable-ui-ids.json') : null;
  const directories = new Map();
  let directoryIndexBytes = 0;
  for (const [collection, file] of Object.entries(routes)) await check(collection+': data, full details, static pages, old anchors and sources', () => {
    const indexFile = `resources/catalogue-data/${collection}/index.json`, data = json(indexFile), records = data.records;
    directories.set(collection, records); directoryIndexBytes += bytes(indexFile);
    assert(Array.isArray(records)); assert.equal(records.length,directoryCounts[collection]);
    assert(Array.isArray(data.filters)); assert(data.defaults && typeof data.defaults === 'object');
    if (collection === 'programs') {
      sameSet(data.filters.find(f => f.field === 'applicationStatus')?.values || [],applicationStatuses,'Application-status choices');
      sameSet(data.filters.find(f => f.field === 'backgroundMatch')?.values || [],backgroundStates,'Background-match choices');
      const html = cached(file);
      for (const [field,expected] of [['applicationStatus',applicationStatuses],['backgroundMatch',backgroundStates]]) {
        const selects = [...html.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)].filter(m => attrs(m[1])['data-field'] === field);
        assert.equal(selects.length,1,field+' must have one control');
        const values = [...selects[0][2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)]
          .map(m => attrs(m[1]).value ?? plain(m[2])).filter(Boolean);
        sameSet(values,expected,field+' rendered choices');
      }
    }
    sameSet(records.map(r => r.id), [...new Set(records.map(r => r.id))], collection+' record IDs');
    if (identityHashes[collection]) sameSet(records.map(r => r.id), directorySource[collection].map(e => e.id), collection+' original and appended IDs');
    if (['library','links'].includes(collection)) {
      assert(registry && registry[collection], 'Missing persistent stable-ui-ids.json registry');
      const entries = directorySource[collection].map(e => [collection === 'library' ? e.url.replace(/\/$/,'') : e.url,e]);
      sameSet(entries.map(([key]) => registry[collection][key]), records.map(r => r.id), collection+' registry associations');
      assert.equal(new Set(Object.values(registry[collection])).size,Object.values(registry[collection]).length,collection+' registry ID collision');
    }
    const byID = new Map(directorySource[collection].map(e => [['library','links'].includes(collection)?registry?.[collection]?.[collection==='library'?e.url.replace(/\/$/,''):e.url]:e.id,e]));
    for (const r of records) {
      for (const field of ['id','title','url']) assert.equal(typeof r[field],'string',collection+' record '+field);
      for (const field of ['subtitle','summary']) assert.equal(typeof r[field],'string',collection+'/'+r.id+' '+field);
      assert(r.fields && typeof r.fields === 'object');
      const recordPage = target(r.url);
      if (!['encyclopedia','terminology'].includes(collection)) assert(cardsIn(recordPage).some(c => c.attrs.id === r.id),collection+'/'+r.id+': URL points to an anchor index rather than its static row');
      const original = byID.get(r.id); assert(original, collection+': unknown identity '+r.id);
      assert.equal(r.title,original.title || original.english || original.name,collection+'/'+r.id+' title');
      const detail = fullDetail(r,collection); externalLinks(detail,collection+'/'+r.id);
      if (collection === 'library') {
        sourceLinks(detail,[original.url,original.readUrl,original.accessSource,original.source,original.additionalUrl,original.previewUrl,original.review,original.archive?.replace('../../','/en/notes/reading-notes/')],r.id);
        for (const field of ['author','note','prerequisites','use','version','checked','accessNote','archiveNote']) hasText(detail,original[field],r.id+'/'+field);
        assert.equal(r.fields.readingAccess,original.readingAccess,r.id+' reading access');
      } else if (collection === 'links') {
        sourceLinks(detail,[original.url,original.source],r.id);
        for (const field of ['author','note','use','checked']) hasText(detail,original[field],r.id+'/'+field);
      } else if (collection === 'programs') {
        const recordedAdmission = r.applicationDates.filter(d => d.type === 'Admission' && d.date);
        if (!original.applicationWindow?.deadlineLabel && recordedAdmission.length) {
          assert.equal(typeof r.meta,'string',r.id+' dated admission metadata');
          assert(!/deadline not verified/i.test(r.meta),r.id+' recorded admission incorrectly labelled unverified');
          for (const milestone of recordedAdmission) hasText(r.meta,milestone.label || milestone.date,r.id+' recorded admission summary');
        }
        sourceLinks(detail,[original.url,original.sources,original.evidence?.map(e => e.url),original.applicationDates?.map(e => e.source),original.applicationWindow?.source],r.id);
        for (const field of ['note','duration','language','preparation','selection','application','tuition','fundingDetail','cycle','statistics','checked']) hasText(detail,original[field],r.id+'/'+field);
        for (const field of auditFields) {
          const audit = original.audit.fields[field]; hasText(detail,audit.status,r.id+'/'+field+' status');
          hasText(detail,audit.note,r.id+'/'+field+' note'); sourceLinks(detail,[audit.source],r.id+'/'+field);
        }
        assert.deepEqual(r.applicationDates, [...new Map([...(original.applicationDates || []), ...(original.applicationWindow ? [{type:'Admission',date:original.applicationWindow.deadlineDate,label:original.applicationWindow.deadlineLabel,source:original.applicationWindow.source}] : [])].map(d => [`${d.type}|${d.date}|${d.label || ''}|${d.source}`,d])).values()],r.id+' milestone data');
        assert(r.applicationWindow && r.background,r.id+' application/background payload');
        const w = original.applicationWindow;
        assert.deepEqual(r.applicationWindow,JSON.parse(JSON.stringify({timeZone:w?.timeZone || 'UTC',openFrom:w ? (w.openingDate ? w.openingDate+'T00:00:00Z' : w.opensAt) : '',closeBefore:w?.closesAt || '',deadlineDate:w?.deadlineDate || '',deadlinePrecision:w?.deadlinePrecision || '',openingDate:w?.openingDate || '',rolling:String(Boolean(original.rolling))})),r.id+' exact application-window payload');
        assert.deepEqual(r.background,JSON.parse(JSON.stringify(Object.fromEntries(['institution','country','degree','language','funding','entryLevels','eligibilityRule'].map(field => [field,original[field]])))),r.id+' exact background payload');
      } else if (collection === 'researchers') {
        sourceLinks(detail,[original.official,original.affiliationSource,original.researchSource,original.email ? original.emailSource : null,original.studentRecords.filter(recentRecord).flatMap(s => s.sources)],r.id);
        for (const field of ['institution','role','affiliationChecked','researchNote','availability','availabilityNote','contactNote','affiliationNote']) hasText(detail,original[field],r.id+'/'+field);
        for (const topic of original.topics.split('|')) hasText(detail,topic,r.id+' topic');
        if (original.email) sourceLinks(detail,['mailto:'+original.email],r.id+' public email');
        assert.equal(r.fields.recent,original.studentRecords.some(recentRecord) ? 'Public records within review window' : 'No qualifying record verified');
        assert.equal(r.fields.topicStatus,original.interestsChecked === 'Not verified' ? 'Not verified' : original.researchEvidence === 'Research group membership' ? 'Group membership only' : 'Published topics verified');
      } else {
        const evidence = collection === 'encyclopedia' ? original.references : [...original.definitionSources,...original.translationSources];
        sourceLinks(detail,evidence,r.id);
        for (const s of evidence) { hasText(detail,s.locator,r.id+' source locator'); hasText(detail,s.checked,r.id+' source review date'); }
        if (collection === 'encyclopedia' && original.contentKind==='External reading guide') {
          hasText(detail,original.summary,r.id+' reading orientation');
          assert(!detail.includes('class="article-body"'),r.id+' external guide must not masquerade as an original article');
          for(const reference of original.references)for(const field of ['author','kind','language','access'])hasText(detail,reference[field],r.id+'/'+field);
        }
        else if (collection === 'encyclopedia') assert.equal(articleBody(detail),renderArticle(original.body).html,r.id+' unchanged math/body');
        else for (const field of ['definitionEn','definitionZh','example','distinction']) assert(detail.includes(markdown.render(original[field])),r.id+'/'+field+' rendered content');
        assert(detail.includes('data-content-license') && detail.includes('CC BY-SA 4.0'),r.id+' content licence');
        assert(detail.includes('/en/resources/assets/katex/katex.min.css'),r.id+' local math stylesheet');
        assert(!detail.includes('cdn.jsdelivr') && !detail.includes('katex.js'),r.id+' client math dependency');
      }
    }
    const defaults = data.defaults;
    if (collection === 'library') assert.equal(defaults.readingAccess,'Free to read');
    const series = [{all:false, rows:records.filter(r => Object.entries(defaults).every(([field,value]) => !value || String(r.fields[field] || '').split('|').includes(value)))}];
    if (collection === 'library') series.push({all:true,rows:records});
    const first = cached(file), firstIDs = idsIn(first);
    if (['programs','researchers'].includes(collection)) for (const r of records) assert(firstIDs.includes(r.id),collection+': old original-route bookmark #'+r.id);
    for (const set of series) {
      const pages = Math.max(1,Math.ceil(set.rows.length/25)), seen = [], graph = new Map();
      const pageFile = n => n === 1 && !set.all ? file : file.replace(/\.html$/,`${set.all ? '-all' : ''}-page-${n}.html`);
      for (let n=1;n<=pages;n++) {
        const name = pageFile(n), html = cached(name), base = '/en/'+name;
        if (n === 1) assert(bytes(name)<=350*1024,name+' exceeds 350 KiB');
        const ids = idsIn(html); assert.equal(ids.length,new Set(ids).size,name+' duplicate HTML IDs');
        const cards = cardsIn(name);
        const expected = set.rows.slice((n-1)*25,n*25);
        assert.equal(cards.length,expected.length,name+' server-rendered row count');
        sameSet(cards.map(card => card.attrs.id),expected.map(r => r.id),name+' static row IDs');
        for (const card of cards) {
          const id = card.attrs.id; seen.push(id);
          const cardRecord=records.find(row=>row.id===id);
          const titleLink=card.body.match(/<h2>\s*(<a\b[^>]*>)/)?.[1];
          assert(titleLink,name+'/'+id+' title link');
          assert.equal(attrs(titleLink).href,titleDestination(cardRecord),name+'/'+id+' direct title destination');
          assert(!card.body.includes('Read / official page'),name+'/'+id+' ambiguous action');
          assert(!/\bhidden(?:\s|=|>)/.test(card.opening),name+' hidden static row');
          if (collection === 'programs') hasText(card.body,records.find(row => row.id === id).meta,name+'/'+id+' static admission metadata');
          if (!['encyclopedia','terminology'].includes(collection)) {
            const r = records.find(row => row.id === id), detail = fullDetail(r,collection);
            if(r.hasDetails===false){
              assert(!/<details\b[^>]*data-entry-details=/.test(card.body),name+'/'+id+' unnecessary disclosure');
              assert.equal(collection,'links');
              const original=directorySource.links.find(e=>e.title===r.title);
              for(const field of ['title','author','category','area','language','note','use','checked'])hasText(card.body,original[field],name+'/'+id+'/'+field);
            }else{
              assert(/<details\b[^>]*data-entry-details=/.test(card.body),name+'/'+id+' no-JS details');
              assert(plain(card.body).includes(plain(detail)),name+'/'+id+' incomplete static full detail text');
            }
            sourceLinks(card.body,linksIn(detail),name+'/'+id+' static detail links');
          }
        }
        const pager = [...html.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/g)].find(m => attrs(m[0].split('>')[0]).id === 'portal-pagination')?.[0];
        assert(pager,name+' missing static pagination');
        graph.set(name,linksIn(pager).map(url => target(url,base)));
        if (n>1) assert(graph.get(name).includes(pageFile(n-1)),name+' previous link');
        if (n<pages) assert(graph.get(name).includes(pageFile(n+1)),name+' next link');
        assert(/<meta\b[^>]*name="viewport"/.test(html),name+' viewport');
        assert(html.includes('data-portal-nav'),name+' shared navigation');
        assert(html.includes('<noscript>'),name+' no-JS explanation');
        externalLinks(html,name);
      }
      sameSet(seen,set.rows.map(r => r.id),collection+' all rows reachable without JS');
      const reached = new Set(), queue = [pageFile(1)];
      while(queue.length) { const name=queue.shift(); if(reached.has(name))continue; reached.add(name); queue.push(...(graph.get(name) || [])); }
      for (let n=1;n<=pages;n++) assert(reached.has(pageFile(n)),collection+' unreachable page '+n);
      if (!set.all && report) {
        const item = report.directories.find(d => d.id === collection); assert(item,collection+' missing report row');
        assert.equal(localURL(item.url).file,file); assert.equal(item.records,records.length); assert.equal(item.pages,pages); assert.equal(item.firstPageBytes,bytes(file));
      }
    }
  });
  // Derivative views have their own pages/details, without increasing core counts
  // or contributing duplicate entries to unified search.
  for (const item of report?.supplementaryDirectories || []) await check(item.id+': supplementary source parity, static pages, details and old anchors', () => {
    const {id} = item, file = supplementaryRoutes[id];
    assert(file,'Unknown supplementary directory '+id);
    assert.equal(localURL(item.url).file,file,id+' original route');
    const data = json(`resources/catalogue-data/${id}/index.json`), records = data.records;
    assert(Array.isArray(records)); assert(Array.isArray(data.filters));
    assert.deepEqual(data.defaults,{},id+' supplementary defaults');
    const coverage = json('resources/data/researcher-coverage.json').countries;
    const originals = id === 'exposition' ? works.filter(e => e.readingAccess === 'Free to read' && e.readingMode === 'Popular / exposition') : coverage;
    const originalID = e => id === 'exposition' ? registry?.library?.[e.url.replace(/\/$/,'')] : 'country-'+e.country.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const byID = new Map(originals.map(e => [originalID(e),e]));
    sameSet(records.map(r => r.id),originals.map(originalID),id+' derivative identities');
    assert.equal(item.records,originals.length,id+' supplementary report count');
    for (const r of records) {
      for (const field of ['id','title','subtitle','summary','url','detail']) assert.equal(typeof r[field],'string',id+' record '+field);
      assert(r.fields && typeof r.fields === 'object',id+'/'+r.id+' fields');
      const original = byID.get(r.id), detail = fullDetail(r,id);
      assert(cardsIn(target(r.url)).some(c => c.attrs.id === r.id),id+'/'+r.id+' canonical row URL');
      externalLinks(detail,id+'/'+r.id);
      if (id === 'exposition') {
        assert.equal(r.title,original.title); assert.equal(r.fields.readingAccess,'Free to read');
        assert.equal(r.fields.readingMode,'Popular / exposition');
        const libraryRecord = directories.get('library')?.find(e => e.id === r.id);
        assert(libraryRecord,r.id+' missing core library record');
        assert.equal(r.url,libraryRecord.url,r.id+' shared canonical URL');
        assert.deepEqual(r.fields,libraryRecord.fields,r.id+' shared library fields');
        sourceLinks(detail,[original.url,original.readUrl,original.accessSource,original.source,original.additionalUrl,original.previewUrl,original.review,original.archive?.replace('../../','/en/notes/reading-notes/')],r.id);
        for (const field of ['author','note','prerequisites','use','version','checked','accessNote','archiveNote']) hasText(detail,original[field],r.id+'/'+field);
      } else {
        assert.equal(r.title,original.country); assert.equal(r.summary,original.gap);
        assert.deepEqual(r.fields,{region:original.region,status:original.status});
        for (const value of [original.country,original.gap,original.status,original.checked,
          `${original.records} indexed researchers (before this batch: ${original.before})`,
          `${original.publicEmails} sourced public emails`,`${original.publishedTopics} personal published-topic records`,
          `${original.groupEvidence} group-membership records`,`${original.unknownTopics} unverified topic records`,
          `${original.institutionLabels.length} institution labels / units`,`${original.programmeRoutes} existing study / career routes`]) hasText(detail,value,r.id+' coverage fact');
        if (original.records) {
          sourceLinks(detail,original.rosterSources,r.id+' affiliation sources');
          for (const institution of original.institutionLabels) hasText(detail,institution,r.id+' institution');
        }
      }
    }
    const pages = Math.max(1,Math.ceil(records.length/25)), graph = new Map(), seen = [];
    assert.equal(item.pages,pages,id+' page count');
    assert.equal(item.firstPageBytes,bytes(file),id+' measured first page');
    assert(bytes(file)<=350*1024,id+' first page exceeds 350 KiB');
    const firstIDs = new Set(idsIn(cached(file)));
    for (const r of records) assert(firstIDs.has(r.id),id+' original-route bookmark #'+r.id);
    const pageFile = n => n === 1 ? file : file.replace(/\.html$/,`-page-${n}.html`);
    for (let n=1;n<=pages;n++) {
      const name = pageFile(n), html = cached(name), cards = cardsIn(name), ids = idsIn(html);
      assert.equal(ids.length,new Set(ids).size,name+' duplicate HTML IDs');
      const expected = records.slice((n-1)*25,n*25);
      sameSet(cards.map(c => c.attrs.id),expected.map(r => r.id),name+' static row identities');
      for (const card of cards) {
        seen.push(card.attrs.id);
        assert(!/\bhidden(?:\s|=|>)/.test(card.opening),name+' hidden static row');
        assert(/<details\b[^>]*data-entry-details=/.test(card.body),name+' no-JS detail');
        const detail = fullDetail(records.find(r => r.id === card.attrs.id),id);
        assert(plain(card.body).includes(plain(detail)),name+' incomplete static full detail text');
        sourceLinks(card.body,linksIn(detail),name+' static detail links');
      }
      const pager = [...html.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/g)].find(m => attrs(m[0].split('>')[0]).id === 'portal-pagination')?.[0];
      assert(pager,name+' missing static pagination');
      graph.set(name,linksIn(pager).map(url => target(url,'/en/'+name)));
      if (n>1) assert(graph.get(name).includes(pageFile(n-1)),name+' previous link');
      if (n<pages) assert(graph.get(name).includes(pageFile(n+1)),name+' next link');
      assert(/<meta\b[^>]*name="viewport"/.test(html),name+' viewport');
      assert(html.includes('data-portal-nav') && html.includes('<noscript>'),name+' shared/no-JS navigation');
      externalLinks(html,name);
    }
    sameSet(seen,records.map(r => r.id),id+' all rows reachable without JS');
    const reached = new Set(), queue = [file];
    while(queue.length) { const name=queue.shift(); if(reached.has(name))continue; reached.add(name); queue.push(...(graph.get(name) || [])); }
    for (let n=1;n<=pages;n++) assert(reached.has(pageFile(n)),id+' unreachable page '+n);
  });
  await check('search manifest, all shards, source parity and byte budgets', () => {
    const file = 'resources/search/manifest.json', manifest = search.validateManifest(json(file));
    for (const id of Object.keys(routes)) assert(manifest.collections.some(c => c.id === id),'Missing search collection '+id);
    for (const id of Object.keys(supplementaryRoutes)) assert(!manifest.collections.some(c => c.id === id),'Duplicate derivative search collection '+id);
    let total = 0;
    const all = [], indexFiles = [];
    for (const collection of manifest.collections) {
      target(collection.url); const indexFile = target(collection.index,'/en/'+file); indexFiles.push(indexFile);
      const entries = search.validateShard(json(indexFile),collection.id); total += bytes(indexFile); all.push(...entries);
      sameSet(entries.map(e => e.id), [...new Set(entries.map(e => e.id))],collection.id+' search IDs');
      if (counts[collection.id]) {
        assert.equal(entries.length,directoryCounts[collection.id],collection.id+' search count');
        assert(directories.has(collection.id),collection.id+' directory checks did not load data');
        sameSet(entries.map(e => e.id),directories.get(collection.id).map(r => r.id),collection.id+' search/directory parity');
        const records = new Map(directories.get(collection.id).map(r => [r.id,r]));
        for (const e of entries) {
          assert.equal(e.title,records.get(e.id).title,collection.id+'/'+e.id+' search title');
          assert.equal(e.url,records.get(e.id).url,collection.id+'/'+e.id+' search URL');
        }
      }
      for (const e of entries) { target(e.url); if(e.termUrl)target(e.termUrl); if(e.encyclopediaUrl)target(e.encyclopediaUrl); }
    }
    assert.equal(indexFiles.length,new Set(indexFiles).size,'Search shards reused');
    assert(total+bytes(file)<=2*1024*1024,`Search shards + manifest exceed 2 MiB: ${total+bytes(file)}`);
    assert(report,'Missing portal report'); assert.equal(report.indexBytes,total); assert.equal(report.directoryIndexBytes,directoryIndexBytes);
    const docs=search.prepareEntries(all);
    for (const [q,id] of [['GCD','integer-greatest-common-divisor'],['Poincare duality','poincare-duality'],['SDE','stochastic-differential-equation']]) assert(search.searchEntries(docs,{q,type:'terminology'}).some(e => e.id === id),'Actual index search '+q);
    for (const id of ['normal-subgroup','normal-topological-space','gaussian-distribution']) assert(search.searchEntries(docs,{q:'normal',type:'terminology'}).some(e => e.id === id),'Actual normal sense '+id);
    assert(search.searchEntries(docs,{q:'Liouville Chicago',type:'researchers'}).some(e => e.id === 'ewain-gwynne'),'Actual multi-field researcher search');
    assert(search.searchEntries(docs,{q:'etale',type:'library'}).some(e => /Étale/.test(e.title)),'Actual accent-insensitive library search');
  });
}
await check('shared entry navigation and meaningful details',()=>{
 const kerodon=json('resources/catalogue-data/links/index.json').records.find(r=>r.title==='Kerodon');
 assert.equal(titleDestination(kerodon),'https://kerodon.net/');
 assert.equal(showsDetails(kerodon),false);
 assert.equal(entryActions(kerodon).length,1,'Identical read/source URLs must not be duplicated');
 assert(kerodon.inlineInfo.includes('Checked'));
 assert.equal(showsDetails({}),false);
 assert.equal(showsDetails({detail:'/some.json',hasDetails:false}),false);
 assert.equal(showsDetails({detail:'/some.json'}),false,'A shard URL alone is not proof of detail content');
 assert.equal(showsDetails({detail:'/some.json',hasDetails:true}),true);
 for(const html of ['', '<article><h3>Title only</h3></article>', '<details><summary>Details</summary><p>&nbsp; &#160; &#xa0;</p></details>', '<!-- comment --><script>not content</script>', '<div hidden>not visible</div>'])assert.equal(hasDetailContent(html),false,html);
 assert.equal(hasDetailContent('<p>Preparation: linear algebra.</p>'),true);
 const flattened=cleanPageCopy('<details><summary>Recent publicly documented student records (0)</summary><p>Review window: 2023–2026.</p><p>No qualifying public student event verified in this review.</p></details>','resources/study-careers/researchers.html');
 assert(!flattened.includes('<details>'));assert(flattened.includes('2023–2026'));assert(flattened.includes('No public student record'));
 for(const collection of ['library','researchers','programs']){
  for(const record of json(`resources/catalogue-data/${collection}/index.json`).records){
   const detail=fullDetail(record,collection);
   assert.equal(record.hasDetails,hasDetailContent(detail),collection+'/'+record.id+' actual detail content');
   assert(!/<summary>Recent publicly documented student records \(0\)/.test(detail),record.id+' empty student disclosure');
   assert(/[?&]v=[a-f0-9]{12}/.test(record.detail),record.id+' detail version');
  }
 }
 const entranceCSS=read('resources/assets/portal.css');
 assert(/\.portal-personal-notes \.links\s*\{[^}]*display:flex[^}]*gap:8px 20px/.test(entranceCSS),'Course format links have explicit gaps');
 const split=entryActions({readingUrl:'https://example.org/book.pdf',readingLabel:'Read PDF',sourceUrl:'https://example.org/book/'});
 assert.deepEqual(split.map(a=>a.label),['Read PDF','Official source']);
 const books=json('resources/catalogue-data/library/index.json').records;
 for(const book of books){const original=works.find(w=>w.url.replace(/\/$/,'')===book.readingUrl.replace(/\/$/,'')||w.readUrl===book.readingUrl);assert(original,'Real source URL for '+book.id);assert.equal(titleDestination(book),original.readUrl||original.url);}
});
if(!options.has('--business-only')&&!options.has('--baseline'))await check('reviewed advice, Chinese discovery and original link preservation',()=>{
 const rows=json('resources/catalogue-data/links/index.json').records;
 const page=read('resources/links/advice.html');
 assert.equal(adviceReadings.length,30,'Reviewed articles in this release');
 assert.equal(adviceReadings.filter(e=>e.language==='Chinese').length,14,'Chinese-language articles');
 assert.equal(new Set(adviceReadings.map(e=>e.id)).size,30);
 assert.equal(new Set(directorySource.links.map(e=>new URL(e.url).href.replace(/\/$/,''))).size,directorySource.links.length,'Unique legacy and added URLs');
 for(const item of adviceReadings){
  const record=rows.find(r=>r.readingUrl===item.url);assert(record,item.id+' missing directory result');
  assert.equal(record.hasDetails,false,item.id+' no empty details');
  for(const field of ['author','note','use','kind','published','caveat','accessNote','originalTitle','chineseLabel','checked'])if(item[field])hasText(page,item[field],item.id+'/'+field);
  assert(page.includes('id="'+item.id+'"'),item.id+' stable article anchor');
  assert.equal(titleDestination(record),item.url);
  const index=Number(record.url.match(/(?:-page-(\d+))?\.html#/)?.[1]||1);
  const file=index===1?'resources/links/index.html':`resources/links/index-page-${index}.html`;
  hasText(read(file),item.note,item.id+' full summary without JS');
  const actions=entryActions(record);assert(actions.some(a=>a.url===item.source),item.id+' review source reachable');
  if(item.source.includes('zhihu.com/en/'))assert(actions.some(a=>a.label==='Zhihu English rendering (reviewed)'),item.id+' translated-review basis');
 }
 const simplified=catalogueCore.matchingRecords(rows,{q:'不确定自己写的证明',filters:{language:'Chinese'}}).records;
 assert(simplified.some(r=>r.readingUrl.includes('syleung.prof/2022/11/26/')),'Simplified alias of traditional title');
 assert(read('resources/links/index.html').includes('href="advice.html"'));
 assert(read('resources/study-careers/guides.html').includes('/en/resources/study-careers/experiences.html'));
 externalLinks(page,'Advice page');
});
if(!options.has('--business-only')&&!options.has('--baseline'))await check('resource organization, notes separation and useful contents',()=>{
 const hub=read('resources/index.html');
 for(const label of ['Learn Mathematics','Reference &amp; Reading','Study &amp; Careers'])assert(hub.includes(label),'Resource group '+label);
 assert(hub.indexOf('id="subjects"')<hub.indexOf('class="resource-group"'),'Subjects precede collection groups');
 assert.equal((hub.match(/class="resource-group"/g)||[]).length,3);
 assert(hub.includes('href="/en/notes/"'),'Separate personal notes entrance');
 for(const file of ['resources/index.html','resources/links/index.html','notes/reading-notes/library/catalogue.html']){
  const html=read(file);
  assert.equal((html.match(/class="portal-nav-section"/g)||[]).length,3,file+' grouped navigation');
  assert(html.includes('href="/en/notes/"'),file+' Notes navigation');
 }
 for(const file of ['notes/index.html','notes/mathematical-notes/page.html','notes/reading-notes/reading-notes.html']){
  const html=read(file);assert(html.includes('portal-personal-notes'),file+' personal layout');assert(!html.includes('class="portal-sidebar"'),file+' no resource sidebar');
 }
 const all=read('resources/links/advice.html'),learning=read('resources/links/study-advice.html'),applications=read('resources/study-careers/experiences.html');
 const ids=html=>[...html.matchAll(/<article class="portal-entry" id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids(learning).length,19);assert.equal(ids(applications).length,11);
 sameSet([...ids(learning),...ids(applications)],ids(all),'Advice views retain all original records');
 for(const html of [all,learning,applications]){
  const toc=html.match(/<aside class="portal-toc"[\s\S]*?<\/aside>/)?.[0];assert(toc,'Advice contents');
  for(const match of toc.matchAll(/href="#([^"]+)"/g))assert(html.includes('id="'+match[1]+'"'),'Contents target '+match[1]);
 }
 assert(!read('notes/index.html').includes('class="portal-toc"'),'No empty contents');
 const notesLanding=read('notes/index.html');
 assert(!notesLanding.includes('Published notes'),'No duplicate published-notes section');
 assert(!notesLanding.includes('data-save-learning'),'No detached per-note save buttons on the landing page');
 assert(notesLanding.includes('href="/en/notes/mathematical-notes/page.html"'),'Course entrance retained');
 assert(!notesLanding.includes('href="/en/notes/reading-notes/reading-notes.html"'),'No clickable unpublished reading-notes entrance');
 assert(fs.existsSync(path.join(root,'notes/reading-notes/reading-notes.html')),'Old reading-notes URL retained');
 const notesPayload=JSON.parse(notesLanding.match(/id="page-translations">([\s\S]*?)<\/script>/)[1]);
 const notesCopy=personalNotesPage();
 assert(notesLanding.includes('<div id="entrance-copy">'+notesCopy.english.body+'</div>'),'English landing copy');
 assert.equal(notesPayload.blocks['entrance-copy'],notesCopy.chinese.body,'Complete Chinese landing copy');
 assert.equal(notesPayload.coverage.status,'body-translated','No interface-only warning for translated notes landing');
 for(const copy of [notesCopy.english.body,notesCopy.chinese.body]){
  assert.equal((copy.match(/<a\b/g)||[]).length,1,'Only the real course entrance is a link');
  assert(/<section[^>]*id="reading-notes"><h2>[^<]+<\/h2>/.test(copy),'Reading notes is a plain heading');
  for(const format of ['PDF','HTML'])assert(copy.includes(format),'Format explanation is retained');
 }
 assert(notesCopy.head.includes('max-width:760px'),'Page-local narrow layout');
 assert(!notesLanding.includes('class="cards"'),'No stretched two-column placeholder layout');
 const noteIndex=json('resources/search/index/notes.json');
 for(const suffix of ['calculus/MAweek1.html','calculus/MAweek2.html','linear-algebra/LAweek1.html'])assert(noteIndex.some(n=>n.url==='/en/notes/mathematical-notes/'+suffix),'Original note remains in search: '+suffix);
 for(const note of noteIndex)assert(fs.existsSync(path.join(root,note.url.replace(/^\/en\//,''))),'Original note file retained: '+note.id);
});
console.log(JSON.stringify({passed:passed.length, failures, mode:options.has('--baseline') ? 'baseline' : options.has('--business-only') ? 'business-only' : 'portal', counts}));
if (failures.length) process.exitCode = 1;
