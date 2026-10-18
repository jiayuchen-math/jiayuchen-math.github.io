/* Shared, lazy, account-free learning tools. Safe to import from Node.
 * Persistence contains only identifiers and manual reading progress. */
export const STORAGE_VERSION = 1;
export const SHELF_KEY = 'jiayu.learning-tools.bookshelf.v1';
export const COMPARE_KEY = 'jiayu.learning-tools.compare.v1';
// Fits even a full 2,000-item pretty-printed export with escaped position text.
export const MAX_IMPORT_BYTES = 8 * 1024 * 1024;
export const MAX_ITEMS = 2000;
export const PAGE_SIZE = 25;
export const TYPES = Object.freeze(['library', 'encyclopedia', 'notes', 'guides']);
export const STATUSES = Object.freeze(['plan', 'reading', 'finished']);
const validID = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(value);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (value, maximum = 20000) => typeof value === 'string' ? value.slice(0, maximum) : '';
export const entryKey = entry => `${entry.type}:${entry.id}`;

export function safeURL(value) {
  if (typeof value !== 'string' || !value || /[\s\\\u0000-\u001f\u007f]/u.test(value)) return '';
  try {
    if (value.startsWith('/') && !value.startsWith('//')) {
      const local = new URL(value, 'https://learning.invalid');
      if (local.pathname.startsWith('//')) return '';
      return local.pathname + local.search + local.hash;
    }
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function isShelfEntry(entry) {
  if (!object(entry) || !TYPES.includes(entry.type) || !validID(entry.id)) return false;
  const url = safeURL(entry.url);
  if (!url.startsWith('/') || !string(entry.title).trim()) return false;
  // Guide collections also contain application advice: only learning paths,
  // prerequisite reviews and learning short guides are eligible.
  return entry.type !== 'guides' || /^\/(?:en\/)?resources\/(?:library-paths|topics)\//.test(url);
}

export function normalizeEntries(entries) {
  const seen = new Set();
  return entries.filter(isShelfEntry).filter(e => {
    const key = entryKey(e);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map(e => ({id:e.id, type:e.type, title:string(e.title, 1000), url:safeURL(e.url), summary:string(e.summary), area:string(e.area, 500), ...(safeURL(e.readingUrl) ? {readingUrl:safeURL(e.readingUrl)} : {})}));
}

export const PROGRAM_FIELDS = Object.freeze([
  ['institution', 'Institution'], ['degree', 'Degree'], ['country', 'Country'],
  ['duration', 'Duration'], ['language', 'Language'], ['preparation', 'Preparation'],
  ['selection', 'Selection and eligibility'], ['application', 'Application procedure'],
  ['tuition', 'Tuition — recorded wording'], ['fees', 'Fee status — recorded wording'],
  ['funding', 'Funding status — recorded wording'], ['fundingDetail', 'Funding details'],
  ['cycle', 'Cycle / historical information'], ['checked', 'Record checked'],
  ['admissionsAuditStatus', 'Admissions evidence status'], ['status', 'Record status'],
]);

export function normalizePrograms(programs) {
  const seen = new Set();
  return programs.filter(p => object(p) && validID(p.id) && string(p.title).trim()).filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id); return true;
  }).map(p => {
    const result = {id:p.id, title:string(p.title, 1000), url:safeURL(p.url)};
    for (const [field] of PROGRAM_FIELDS) result[field] = string(p[field]);
    result.audit = {checked:string(p.audit?.checked, 100), fields:{}};
    for (const [field] of PROGRAM_FIELDS) {
      const audit = p.audit?.fields?.[field];
      if (object(audit)) result.audit.fields[field] = {
        status:string(audit.status, 1000), year:string(audit.year, 1000),
        checked:string(audit.checked, 100), note:string(audit.note), source:safeURL(audit.source),
      };
    }
    result.evidence = (Array.isArray(p.evidence) ? p.evidence : []).filter(object).map(e => ({
      field:string(e.field, 100), text:string(e.text), url:safeURL(e.url), checked:string(e.checked, 100),
    }));
    result.sources = (Array.isArray(p.sources) ? p.sources : []).filter(object).map(s => ({
      label:string(s.label || s.title || s.url, 1000), url:safeURL(s.url),
      checked:string(s.checked, 100), status:string(s.status, 1000),
    }));
    return result;
  });
}

export function validateShelf(value) {
  if (!object(value) || value.version !== STORAGE_VERSION || !Array.isArray(value.items) || value.items.length > MAX_ITEMS) throw new Error('Expected a version 1 bookshelf with at most 2,000 entries.');
  const seen = new Set(), items = [];
  for (const item of value.items) {
    if (!object(item) || !TYPES.includes(item.type) || !validID(item.id) || !STATUSES.includes(item.status) || typeof item.position !== 'string' || item.position.length > 500) throw new Error('Invalid entry: each needs a learning type, ID, status and position text (500 characters maximum).');
    const key = entryKey(item);
    if (!seen.has(key)) { seen.add(key); items.push({type:item.type, id:item.id, status:item.status, position:item.position}); }
  }
  return {version:STORAGE_VERSION, items};
}

export function parseShelf(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error('Bookshelf files must be no larger than 8 MiB.');
  let value;
  try { value = JSON.parse(text); } catch { throw new Error('This is not a valid JSON bookshelf.'); }
  return validateShelf(value);
}

export function mergeShelves(current, incoming) {
  const left = validateShelf(current), right = validateShelf(incoming);
  const keys = new Set(left.items.map(entryKey));
  const items = [...left.items, ...right.items.filter(e => !keys.has(entryKey(e)))];
  if (items.length > MAX_ITEMS) throw new Error('The merged bookshelf would exceed 2,000 entries.');
  return {version:STORAGE_VERSION, items};
}

export function addShelfItem(shelf, entry) {
  if (!isShelfEntry(entry)) throw new Error('This resource cannot be saved to the bookshelf.');
  return mergeShelves(shelf, {version:STORAGE_VERSION, items:[{id:entry.id, type:entry.type, status:'plan', position:''}]});
}

// Never overwrite unreadable storage automatically. The UI keeps working in
// memory; only an explicit Clear authorizes replacement of damaged data.
export function readShelf(storage) {
  const empty = {version:STORAGE_VERSION, items:[]};
  try {
    const value = storage.getItem(SHELF_KEY);
    return {shelf:value === null ? empty : parseShelf(value), writable:true, warning:''};
  } catch {
    return {shelf:empty, writable:false, warning:'Saved browser data could not be read. Existing data has not been replaced. Changes stay in memory; export them to keep a copy. Clear explicitly to replace unreadable data.'};
  }
}

export function writeShelf(storage, shelf) {
  try { storage.setItem(SHELF_KEY, JSON.stringify(validateShelf(shelf))); return true; }
  catch { return false; }
}

export function normalizeSelection(ids) {
  if (!Array.isArray(ids)) throw new Error('Invalid comparison selection.');
  const result = [];
  for (const id of ids) {
    if (!validID(id)) throw new Error('Invalid program ID.');
    if (!result.includes(id)) result.push(id);
  }
  if (result.length > 3) throw new Error('Compare up to three programs. Remove one before adding another.');
  return result;
}

export function addComparison(ids, id) { return normalizeSelection([...normalizeSelection(ids), id]); }

export function readComparison(storage) {
  try {
    const text = storage.getItem(COMPARE_KEY);
    if (text === null) return {ids:[], writable:true, warning:''};
    if (text.length > 4096) throw new Error('Oversized selection');
    const value = JSON.parse(text);
    if (!object(value) || value.version !== STORAGE_VERSION) throw new Error('Unknown version');
    return {ids:normalizeSelection(value.ids), writable:true, warning:''};
  } catch { return {ids:[], writable:false, warning:'Comparison session data is unavailable or unreadable. Changes stay in memory; existing session data has not been replaced.'}; }
}

export function selectionFromURL(value) {
  const params = new URL(value, 'https://learning.invalid').searchParams;
  if (!params.has('program')) return null;
  return normalizeSelection(params.getAll('program'));
}

export function selectionURL(value, ids) {
  const url = new URL(value);
  url.searchParams.delete('program');
  for (const id of normalizeSelection(ids)) url.searchParams.append('program', id);
  return url.href;
}

export function searchPage(records, {query = '', type = '', page = 1, size = PAGE_SIZE} = {}) {
  const tokens = String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = records.filter(e => (!type || e.type === type) && tokens.every(token => [e.title,e.summary,e.area,e.institution,e.country,e.degree].filter(Boolean).join(' ').toLocaleLowerCase().includes(token)));
  const pageSize = Math.max(1, Math.min(100, Math.floor(Number(size)) || PAGE_SIZE));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.max(1, Math.min(pages, Math.floor(Number(page)) || 1));
  return {items:filtered.slice((current - 1) * pageSize, current * pageSize), total:filtered.length, page:current, pages};
}

// Resolving beside this module supports both /en deployments and root migration.
const resourceURL = name => new URL(`../catalogue-data/learning-tools/${name}.json`, import.meta.url).href;
const sitePath = value => new URL(import.meta.url).pathname.startsWith('/en/') ? value : value.replace(/^\/en(?=\/)/, '');

export function initLearningTools(doc = globalThis.document, win = globalThis.window) {
  if (!doc || !win || doc.__learningTools) return;
  doc.__learningTools = true;
  const root = doc.querySelector('[data-learning-tool]');
  const mode = root?.dataset.learningTool;
  let shelfState, comparisonState, entriesPromise, programsPromise;
  let shelfRegistry = [], programRegistry = [], uiReady = false;
  let searchState = {query:'', type:'', page:1};
  let announceNode;
  function announce(text) {
    const local = root?.querySelector('[data-tool-message]');
    if (!local && !announceNode) {
      announceNode = element('p', '', {role:'status', 'aria-live':'polite', 'aria-atomic':'true', class:'learning-feedback'});
      doc.body.append(announceNode);
    }
    const target = local || announceNode;
    target.textContent = '';
    // Separate changes let assistive technology announce repeated messages.
    win.setTimeout(() => { target.textContent = text; }, 0);
  }
  function element(tag, text = '', attributes = {}) {
    const node = doc.createElement(tag);
    node.textContent = text;
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }
  function button(text, action, attributes = {}) {
    const node = element('button', text, {type:'button', ...attributes});
    node.addEventListener('click', action); return node;
  }
  function anchor(url, text, external = false) {
    const node = element('a', text);
    const safe = safeURL(url);
    if (safe) node.href = safe.startsWith('/') ? sitePath(safe) : safe;
    if (external && safe) { node.target = '_blank'; node.rel = 'noopener noreferrer'; node.append(' (new tab)'); }
    return node;
  }
  function getShelf() {
    if (!shelfState) {
      try { shelfState = readShelf(win.localStorage); }
      catch { shelfState = readShelf(null); }
    }
    return shelfState;
  }
  function getComparison() {
    if (!comparisonState) {
      try { comparisonState = readComparison(win.sessionStorage); }
      catch { comparisonState = readComparison(null); }
    }
    return comparisonState;
  }
  function persistShelf(message) {
    const state = getShelf();
    let saved = false;
    if (state.writable) { try { saved = writeShelf(win.localStorage, state.shelf); } catch { /* denied getter */ } }
    state.warning = saved ? '' : (state.writable ? 'Browser storage is unavailable or full. Changes stay in memory; export a backup before leaving this page.' : state.warning);
    announce(`${message}${state.warning ? ' ' + state.warning : ''}`);
  }
  function persistComparison(message) {
    const state = getComparison();
    let saved = false;
    if (state.writable) {
      try { win.sessionStorage.setItem(COMPARE_KEY, JSON.stringify({version:STORAGE_VERSION, ids:state.ids})); saved = true; } catch { /* in-memory fallback */ }
    }
    state.warning = saved ? '' : (state.writable ? 'Session storage is unavailable or full. Selections stay in memory; create a selection link to keep them.' : state.warning);
    try {
      if (new URL(win.location.href).searchParams.has('program')) win.history.replaceState(null, '', selectionURL(win.location.href, state.ids));
    } catch { /* URL sharing is optional; memory and session storage still work. */ }
    root?.querySelector('[data-compare-share]')?.replaceChildren();
    announce(`${message}${state.warning ? ' ' + state.warning : ''}`);
  }
  async function load(name) {
    const response = await win.fetch(resourceURL(name), {credentials:'same-origin'});
    if (!response.ok) throw new Error('The catalogue could not be loaded. Please try again.');
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('The catalogue is not available in the expected format.');
    return name === 'entries' ? normalizeEntries(records) : normalizePrograms(records);
  }
  function entries() {
    if (!entriesPromise) entriesPromise = load('entries').catch(error => { entriesPromise = null; throw error; });
    return entriesPromise;
  }
  function programs() {
    if (!programsPromise) programsPromise = load('programs').catch(error => { programsPromise = null; throw error; });
    return programsPromise;
  }
  function saveButtons() {
    const saved = shelfState ? new Set(shelfState.shelf.items.map(entryKey)) : null;
    doc.querySelectorAll('[data-save-learning]').forEach(node => {
      if (node.tagName !== 'BUTTON') return;
      const eligible = TYPES.includes(node.dataset.learningType) && validID(node.dataset.learningId);
      node.hidden = !eligible;
      if (!eligible) return;
      node.dataset.learningReady = 'true';
      node.type = 'button';
      if (!node.textContent.trim()) node.textContent = 'Save to bookshelf';
      if (!node.hasAttribute('aria-label') && !node.hasAttribute('aria-labelledby')) node.setAttribute('aria-label', `Save ${node.dataset.learningId} to bookshelf`);
      if (saved) node.setAttribute('aria-pressed', String(saved.has(entryKey({type:node.dataset.learningType, id:node.dataset.learningId}))));
    });
  }
  function compareButtons() {
    doc.querySelectorAll('[data-compare-program]').forEach(node => {
      if (node.tagName !== 'BUTTON') return;
      node.hidden = !validID(node.dataset.programId);
      if (node.hidden) return;
      node.dataset.learningReady = 'true';
      node.type = 'button';
      if (!node.textContent.trim()) node.textContent = 'Add to comparison';
      if (!node.hasAttribute('aria-label') && !node.hasAttribute('aria-labelledby')) node.setAttribute('aria-label', `Add ${node.dataset.programId} to program comparison`);
      if (comparisonState) node.setAttribute('aria-pressed', String(comparisonState.ids.includes(node.dataset.programId)));
    });
  }
  function reveal() { saveButtons(); compareButtons(); }
  async function genericClick(event) {
    const node = event.target.closest?.('[data-save-learning], [data-compare-program]');
    if (!node || node.tagName !== 'BUTTON' || node.disabled) return;
    node.disabled = true;
    try {
      if (node.matches('[data-save-learning]')) {
        const registry = await entries();
        const entry = registry.find(e => e.id === node.dataset.learningId && e.type === node.dataset.learningType);
        if (!entry) throw new Error('This resource is unavailable or is not eligible for the bookshelf. Existing saved entries are retained.');
        const state = getShelf(), alreadySaved = state.shelf.items.some(e => entryKey(e) === entryKey(entry));
        state.shelf = addShelfItem(state.shelf, entry);
        persistShelf(alreadySaved ? `${entry.title} is already on your bookshelf.` : `Saved ${entry.title} to your bookshelf.`);
        if (mode === 'shelf' && uiReady) renderShelf();
      } else {
        const registry = await programs();
        const entry = registry.find(e => e.id === node.dataset.programId);
        if (!entry) throw new Error('This program is unavailable in the current comparison catalogue.');
        const state = getComparison(), alreadySelected = state.ids.includes(entry.id);
        state.ids = addComparison(state.ids, entry.id);
        persistComparison(alreadySelected ? `${entry.title} is already selected.` : `Added ${entry.title}. Open Compare programs to view the table.`);
        if (mode === 'compare' && uiReady) renderComparison();
      }
      reveal();
    } catch (error) { announce(error.message); }
    finally { node.disabled = false; }
  }
  doc.addEventListener('click', genericClick);
  // Observe additions only: updating hidden/pressed/text must not feed a loop.
  let revealQueued = false;
  if (win.MutationObserver) new win.MutationObserver(changes => {
    if (!changes.some(change => [...change.addedNodes].some(node => node.nodeType === 1 && (node.matches?.('[data-save-learning], [data-compare-program]') || node.querySelector?.('[data-save-learning], [data-compare-program]'))))) return;
    if (!revealQueued) { revealQueued = true; queueMicrotask(() => { revealQueued = false; reveal(); }); }
  }).observe(doc.body, {childList:true, subtree:true});
  doc.addEventListener('learning-tools:refresh', reveal);
  reveal(); // No catalogue fetch or storage access on ordinary page startup.

  function restoreFocus(container, key, field) {
    const card = [...container.querySelectorAll('[data-shelf-key]')].find(n => n.dataset.shelfKey === key);
    (card?.querySelector(`[data-field="${field}"]`) || root.querySelector('#shelf-heading'))?.focus();
  }
  function changeProgress(key, field, value, label) {
    const state = getShelf();
    // An edit may finish after another tab changes the list. Apply this one
    // field to the latest readable list rather than writing a stale snapshot.
    const previous = state.shelf.items.find(e => entryKey(e) === key);
    if (state.writable && !state.warning) {
      let fresh;
      try { fresh = readShelf(win.localStorage); } catch { fresh = readShelf(null); }
      if (fresh.writable) state.shelf = fresh.shelf;
      else { state.writable = false; state.warning = fresh.warning; }
    }
    let item = state.shelf.items.find(e => entryKey(e) === key);
    if (!item && previous) {
      if (state.shelf.items.length >= MAX_ITEMS) { announce('The bookshelf is full. Remove an entry before restoring this reading.'); return; }
      item = {...previous}; state.shelf.items.push(item);
    }
    if (!item) return;
    item[field] = value;
    persistShelf(`Updated ${field === 'status' ? 'reading status' : 'reading position'} for ${label}.`);
  }
  function renderShelf() {
    const container = root.querySelector('[data-shelf-items]');
    const registry = new Map(shelfRegistry.map(e => [entryKey(e), e]));
    const items = getShelf().shelf.items;
    container.replaceChildren();
    root.querySelector('[data-shelf-clear]').disabled = !items.length && getShelf().writable;
    root.querySelector('[data-shelf-export]').disabled = !items.length;
    if (!items.length) { container.append(element('p', 'Your bookshelf is empty. Search below to save a reading.')); return; }
    const list = element('ul', '', {class:'learning-saved'});
    items.forEach((item, index) => {
      const key = entryKey(item), entry = registry.get(key);
      const card = element('li', '', {'data-shelf-key':key});
      const heading = element('h3');
      heading.append(entry ? anchor(entry.url, entry.title) : element('span', `Unavailable catalogue entry: ${item.type} / ${item.id}`));
      card.append(heading);
      if (entry) {
        card.append(element('p', `${entry.type}${entry.area ? ' · ' + entry.area : ''}`), element('p', entry.summary));
        if (entry.readingUrl) card.append(anchor(entry.readingUrl, 'Open reading', true));
      } else card.append(element('p', 'This ID is missing from the current catalogue. Your saved progress is retained; an import or catalogue update may make it available again.'));
      const label = entry?.title || `${item.type} / ${item.id}`;
      const controls = element('div', '', {class:'learning-actions'});
      const statusLabel = element('label', 'Reading status ');
      const select = element('select', '', {'aria-label':`Reading status for ${label}`, 'data-field':'status'});
      for (const value of STATUSES) { const option = element('option', value[0].toUpperCase() + value.slice(1), {value}); select.append(option); }
      select.value = item.status;
      select.addEventListener('change', () => changeProgress(key, 'status', select.value, label));
      statusLabel.append(select);
      const positionLabel = element('label', 'Manual reading position ');
      const position = element('input', '', {type:'text', maxlength:'500', 'aria-label':`Manual reading position for ${label}`, placeholder:'e.g. Chapter 2, page 34', 'data-field':'position'});
      position.value = item.position;
      position.addEventListener('change', () => changeProgress(key, 'position', position.value, label));
      positionLabel.append(position);
      const remove = button('Remove', () => {
        getShelf().shelf.items = getShelf().shelf.items.filter(e => entryKey(e) !== key);
        persistShelf(`Removed ${label}.`); renderShelf(); reveal();
        const next = root.querySelectorAll('[data-shelf-key]')[Math.min(index, items.length - 2)];
        (next?.querySelector('[data-field="remove"]') || root.querySelector('#shelf-heading')).focus();
      }, {'aria-label':`Remove ${label} from bookshelf`, 'data-field':'remove'});
      controls.append(statusLabel, positionLabel, remove); card.append(controls); list.append(card);
    });
    container.append(list);
  }

  function renderComparison() {
    const container = root.querySelector('[data-comparison]');
    const ids = getComparison().ids, records = new Map(programRegistry.map(p => [p.id,p]));
    container.replaceChildren();
    root.querySelector('[data-compare-clear]').disabled = !ids.length && getComparison().writable;
    root.querySelector('[data-compare-link]').disabled = !ids.length;
    if (!ids.length) { container.append(element('p', 'No programs selected. Search below to add up to three.')); return; }
    const scroller = element('div', '', {class:'learning-table-scroll', tabindex:'0', role:'region', 'aria-label':'Program comparison table; scroll horizontally if needed'});
    const table = element('table', '', {class:'learning-comparison'});
    table.append(element('caption', 'Catalogue evidence for selected programs; unknown values and historical wording are preserved.'));
    const head = element('thead'), row = element('tr'); row.append(element('th', 'Field', {scope:'col'}));
    ids.forEach((id, index) => {
      const p = records.get(id), cell = element('th', '', {scope:'col'});
      cell.append(element('p', p ? `${p.institution} — ${p.title}` : `Unavailable program: ${id}`));
      if (p?.url) cell.append(anchor(p.url, 'Official program page', true));
      cell.append(button('Remove', () => {
        getComparison().ids = ids.filter(value => value !== id);
        persistComparison(`Removed ${p?.title || id} from comparison.`); renderComparison(); reveal();
        const remaining = root.querySelectorAll('[data-remove-program]');
        (remaining[Math.min(index, remaining.length - 1)] || root.querySelector('#comparison-heading')).focus();
      }, {'aria-label':`Remove ${p?.title || id} from comparison`, 'data-remove-program':id}));
      row.append(cell);
    });
    head.append(row); table.append(head);
    const body = element('tbody');
    for (const [field, label] of PROGRAM_FIELDS) {
      const row = element('tr'); row.append(element('th', label, {scope:'row'}));
      ids.forEach(id => {
        const p = records.get(id), cell = element('td', p?.[field]?.trim() || 'Unknown / not recorded');
        const audit = p?.audit.fields[field];
        if (audit) {
          cell.append(element('p', `Evidence status: ${audit.status || 'Unknown / not recorded'} · Period: ${audit.year || 'not recorded'} · Checked: ${audit.checked || p.audit.checked || 'not recorded'}`));
          if (audit.note) cell.append(element('p', audit.note));
          if (audit.source) cell.append(anchor(audit.source, 'Field source', true));
        }
        const evidence = p?.evidence.filter(e => e.field === field) || [];
        if (evidence.length) {
          const details = element('details'); details.append(element('summary', 'Recorded field evidence'));
          for (const e of evidence) {
            details.append(element('p', e.text || 'Evidence text not recorded'), element('p', `Evidence checked: ${e.checked || 'not recorded'}`));
            if (e.url) details.append(anchor(e.url, 'Evidence source', true));
          }
          cell.append(details);
        }
        row.append(cell);
      });
      body.append(row);
    }
    const sources = element('tr'); sources.append(element('th', 'Sources and source status', {scope:'row'}));
    ids.forEach(id => {
      const cell = element('td'), p = records.get(id);
      if (!p) cell.append('Missing from the current catalogue. This selection is retained until you remove it.');
      else if (!p.sources.length) cell.append('Unknown / no sources recorded');
      else {
        const list = element('ul');
        for (const source of p.sources) {
          const li = element('li');
          li.append(source.url ? anchor(source.url, source.label || 'Source', true) : element('span', source.label || 'Source URL unavailable'));
          li.append(element('p', `Source status: ${source.status || 'not recorded'} · Source checked: ${source.checked || 'not recorded'}`));
          list.append(li);
        }
        cell.append(list);
      }
      sources.append(cell);
    });
    body.append(sources); table.append(body); scroller.append(table); container.append(scroller);
  }

  function renderSearch(focus = false) {
    const result = searchPage(mode === 'shelf' ? shelfRegistry : programRegistry, searchState);
    searchState.page = result.page;
    const count = root.querySelector('[data-learning-count]');
    count.textContent = `${result.total} ${mode === 'shelf' ? 'learning resources' : 'programs'} found. Showing ${result.items.length} on page ${result.page} of ${result.pages}.`;
    const list = root.querySelector('[data-learning-results]'); list.replaceChildren();
    for (const entry of result.items) {
      const li = element('li'), heading = element('h3');
      const url = mode === 'shelf' ? entry.url : entry.url || '/en/resources/study-careers/';
      heading.append(anchor(url, entry.title, mode === 'compare' && Boolean(entry.url))); li.append(heading);
      li.append(element('p', mode === 'shelf' ? `${entry.type} · ${entry.area}${entry.summary ? ' — ' + entry.summary : ''}` : `${entry.institution} · ${entry.degree} · ${entry.country}`));
      const attributes = mode === 'shelf'
        ? {'data-save-learning':'', 'data-learning-id':entry.id, 'data-learning-type':entry.type, 'aria-label':`Save ${entry.title} to bookshelf`}
        : {'data-compare-program':'', 'data-program-id':entry.id, 'aria-label':`Add ${entry.institution} — ${entry.title} to comparison`};
      li.append(element('button', mode === 'shelf' ? 'Save to bookshelf' : 'Add to comparison', {type:'button', ...attributes}));
      if (entry.readingUrl && mode === 'shelf') li.append(' · ', anchor(entry.readingUrl, 'Open reading', true));
      list.append(li);
    }
    if (!result.items.length) list.append(element('li', 'No matches. Try another title or subject.'));
    root.querySelector('[data-learning-prev]').disabled = result.page === 1;
    root.querySelector('[data-learning-next]').disabled = result.page === result.pages;
    root.querySelector('[data-learning-page]').textContent = `Page ${result.page} of ${result.pages}`;
    reveal();
    if (focus) { count.tabIndex = -1; count.focus(); }
  }

  function bindTool() {
    root.querySelector('[data-learning-search]').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      searchState = {query:form.elements.q.value, type:form.elements.type?.value || '', page:1};
      renderSearch(true);
    });
    root.querySelector('[data-learning-prev]').addEventListener('click', () => { searchState.page--; renderSearch(true); });
    root.querySelector('[data-learning-next]').addEventListener('click', () => { searchState.page++; renderSearch(true); });
    if (mode === 'shelf') {
      root.querySelector('[data-shelf-clear]').addEventListener('click', () => {
        if (!win.confirm('Clear this browser’s bookshelf? Export a backup first if you want to keep it. This also replaces unreadable bookshelf data.')) return;
        shelfState = {shelf:{version:STORAGE_VERSION, items:[]}, writable:true, warning:''};
        persistShelf('Bookshelf cleared.'); renderShelf(); reveal(); root.querySelector('#shelf-heading').focus();
      });
      root.querySelector('[data-shelf-export]').addEventListener('click', () => {
        try {
          const blob = new Blob([JSON.stringify(validateShelf(getShelf().shelf), null, 2)], {type:'application/json'});
          const url = win.URL.createObjectURL(blob), link = element('a', '', {download:'bookshelf-v1.json', href:url});
          link.hidden = true; doc.body.append(link); link.click(); link.remove();
          win.setTimeout(() => win.URL.revokeObjectURL(url), 1000); announce('Bookshelf export requested. Keep the file as a local backup.');
        } catch { announce('Export could not start in this browser. Your bookshelf has not changed.'); }
      });
      root.querySelector('[data-shelf-import]').addEventListener('change', async event => {
        const input = event.currentTarget, file = input.files?.[0]; if (!file) return;
        input.disabled = true;
        try {
          if (file.size > MAX_IMPORT_BYTES) throw new Error('Bookshelf files must be no larger than 8 MiB.');
          const imported = parseShelf(await file.text()), state = getShelf();
          const previousCount = state.shelf.items.length;
          state.shelf = mergeShelves(state.shelf, imported);
          persistShelf(`Imported ${state.shelf.items.length - previousCount} new entries. Existing progress and missing catalogue IDs were retained.`);
          renderShelf(); reveal();
        } catch (error) { announce(`Import failed: ${error.message} Your bookshelf has not changed.`); }
        finally { input.value = ''; input.disabled = false; input.focus(); }
      });
    } else {
      root.querySelector('[data-compare-clear]').addEventListener('click', () => {
        comparisonState = {ids:[], writable:true, warning:''}; persistComparison('Comparison cleared.');
        // Explicitly clear readable URL selections too, without automatic sharing.
        try { win.history.replaceState(null, '', selectionURL(win.location.href, [])); } catch { /* optional URL */ }
        renderComparison(); reveal(); root.querySelector('#comparison-heading').focus();
      });
      root.querySelector('[data-compare-link]').addEventListener('click', () => {
        const url = selectionURL(win.location.href, getComparison().ids);
        const container = root.querySelector('[data-compare-share]');
        const label = element('label', 'Selection link (contains program IDs only) ');
        const input = element('input', '', {type:'url', readonly:'', 'aria-label':'Selection link containing program IDs only'}); input.value = url;
        label.append(input); container.replaceChildren(label, anchor(url, 'Open this comparison selection'));
        input.focus(); input.select(); announce('Selection link ready to copy. Only program IDs are included.');
      });
    }
  }

  async function startTool() {
    if (!['shelf', 'compare'].includes(mode)) return;
    try {
      if (mode === 'shelf') { shelfRegistry = await entries(); getShelf(); }
      else {
        programRegistry = await programs(); const state = getComparison();
        try {
          const ids = selectionFromURL(win.location.href);
          if (ids !== null) { state.ids = ids; persistComparison('Loaded program IDs from this selection link.'); }
        } catch (error) { announce(`Selection link could not be loaded: ${error.message} Existing session selections are retained.`); }
      }
      bindTool(); uiReady = true;
      if (mode === 'shelf') renderShelf(); else renderComparison();
      renderSearch(); root.querySelector('[data-learning-ui]').hidden = false;
      root.querySelector('[data-learning-fallback]').hidden = true;
      const warning = mode === 'shelf' ? getShelf().warning : getComparison().warning;
      if (warning) announce(warning);
    } catch (error) {
      const fallback = root.querySelector('[data-learning-fallback]');
      fallback.append(element('p', error.message), button('Try loading tools again', event => { event.currentTarget.remove(); startTool(); }));
    }
  }
  // Other tabs may save progress; preserve focused unsaved text until blur.
  let deferredShelfRefresh = false;
  function applyShelfRefresh() {
    const fresh = (() => { try { return readShelf(win.localStorage); } catch { return readShelf(null); } })();
    if (!fresh.writable) { announce(fresh.warning); return; }
    shelfState = fresh;
    if (mode === 'shelf' && uiReady) {
      const active = doc.activeElement, key = active?.closest('[data-shelf-key]')?.dataset.shelfKey, field = active?.dataset.field;
      renderShelf(); if (key && field) restoreFocus(root, key, field);
    }
    reveal(); announce('Bookshelf updated from another tab.');
  }
  win.addEventListener('storage', event => {
    if (event.key !== SHELF_KEY && event.key !== null) return;
    if (!shelfState) return;
    if (!shelfState.writable || shelfState.warning) { announce('Another tab changed the bookshelf. Unsaved in-memory progress has been retained; export it before reloading.'); return; }
    const active = doc.activeElement;
    if (active?.matches('[data-field="position"]')) { deferredShelfRefresh = true; announce('Another tab changed the bookshelf. Finish editing your position before the shelf refreshes.'); return; }
    applyShelfRefresh();
  });
  doc.addEventListener('focusout', event => {
    if (deferredShelfRefresh && event.target.matches?.('[data-field="position"]')) {
      deferredShelfRefresh = false; win.setTimeout(applyShelfRefresh, 0);
    }
  });
  startTool();
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initLearningTools(), {once:true});
  else initLearningTools();
}
