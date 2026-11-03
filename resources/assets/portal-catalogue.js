import {applicationState} from './application-time.js';
import {titleDestination,entryActions,showsDetails,hasDetailContent} from './entry-presentation.js?v=details-body-2';
import {
  PAGE_SIZE, DATE_PARAMETERS, pageNumber, fieldNames, readState, stateURL,
  applicationData, assessRecords, matchingRecords,
} from './portal-catalogue-core.js';

// Generator contract: one form[data-portal-catalogue] and the five portal/result IDs.
// Only same-origin index/detail JSON is fetched. Summaries always use text nodes;
// the separately fetched detail values are the generator's original article HTML.
const form = document.querySelector('form[data-portal-catalogue]');
if (form) initialize(form).catch(() => {
  const message = document.createElement('p');
  message.className = 'notice';
  message.setAttribute('role', 'status');
  message.textContent = 'Interactive browsing is unavailable. The entries and page links below remain available. Reload to try again.';
  form.before(message);
});

async function initialize(form) {
  const results = document.getElementById('portal-results');
  const count = document.getElementById('result-count');
  const pagination = document.getElementById('portal-pagination');
  const empty = document.getElementById('no-results');
  const chips = document.getElementById('active-filters');
  if (!results || !count || !pagination) throw new Error('Incomplete directory shell');
  // Remove obsolete personal parameters before data requests can use this URL
  // as a referrer, and before any scroll-position key can contain them.
  const publicURL = new URL(location.href);
  for (const key of [...publicURL.searchParams.keys()]) if (key.startsWith('bg.')) publicURL.searchParams.delete(key);
  if (publicURL.href !== location.href) history.replaceState(history.state, '', publicURL);
  const base = new URL(form.dataset.base || location.pathname, location.href);
  const serverPage = pageNumber(form.dataset.currentPage);
  const indexURL = localURL(form.dataset.index);
  const response = await fetch(indexURL, {credentials: 'same-origin'});
  if (!response.ok) throw new Error('Index unavailable');
  const index = await response.json();
  if (!Array.isArray(index.records) || !Array.isArray(index.filters)) throw new Error('Invalid index');
  const records = index.records;
  const byID = new Map(records.map(row => [String(row.id), row]));
  const resetDefaults = index.defaults || {};
  let defaults = resetDefaults;
  try {
    if (form.hasAttribute('data-defaults')) defaults = JSON.parse(form.dataset.defaults);
  } catch { /* Index defaults still apply. */ }
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) defaults = resetDefaults;
  const selects = [...form.querySelectorAll('select[data-field]')];
  const search = form.querySelector('input[name="q"]');
  const backgroundForm = document.querySelector('form[data-background]');
  const backgroundControls = backgroundForm ? [...backgroundForm.querySelectorAll('input[name], select[name], textarea[name]')]
    .filter(control => !['submit', 'reset', 'button'].includes(control.type)) : [];
  const names = fieldNames(records, index.filters, {...resetDefaults, ...defaults}, selects.map(control => control.dataset.field));
  const filterLabels = new Map(index.filters.map(filter => [filter.field, filter.label || filter.field]));
  const dateControls = new Map(DATE_PARAMETERS.map(name => [name, form.querySelector(`[name="${name}"]`)]));
  const dateError = form.querySelector('[data-date-error]');
  const shardCache = new Map();
  const loadedDetails = new Map();
  // Personal answers belong only to this document, never URLs or persistent state.
  let localBackground = Object.create(null);
  let state = stateFromLocation(true);
  let assessments = assessRecords(records, state.background);
  let found = [];
  let restoring = false;
  let scrollTimer;
  let inputTimer;
  let scrollVersion = 0;
  let previousScrollRestoration;

  // Retain every generated filter, including those inside .more-filters. Do not
  // move controls: the generator owns the three primary filters and layout.
  for (const control of selects) {
    const field = control.dataset.field;
    if (!control.name) control.name = field;
    const specification = index.filters.find(filter => filter.field === field)
      || index.filters.find(filter => field === 'area' && filter.field === 'topic');
    for (const item of specification?.values || []) {
      const value = String(typeof item === 'object' ? item.value : item);
      addOption(control, value, typeof item === 'object' ? item.label || value : value);
    }
  }
  count.setAttribute('tabindex', '-1');
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');
  pagination.setAttribute('aria-label', 'Directory pages');
  syncControls();
  const initialHash = hashID();
  const preserveStatic = initialIsStatic() && (!initialHash || document.getElementById(initialHash));
  render({preserveStatic, target: initialHash});
  form.hidden = false;
  if (backgroundForm) backgroundForm.hidden = false;

  function stateFromLocation(initial = false) {
    const pathPage = location.pathname.match(/-page-(\d+)\.html$/)?.[1];
    const routeDefaults = initial ? defaults : /-all-page-\d+\.html$/.test(location.pathname) ? {} : resetDefaults;
    return {...readState(new URL(location.href), {fields: names, defaults: routeDefaults,
      page: initial ? serverPage : pageNumber(pathPage)}), background: localBackground};
  }

  function browsingURL(next, current = new URL(location.href)) {
    let routeBase = base;
    let routeDefaults = resetDefaults;
    if (resetDefaults.readingAccess && next.filters.readingAccess !== resetDefaults.readingAccess) {
      routeBase = new URL(base);
      routeBase.pathname = routeBase.pathname.replace(/(?:-all)?(?:-page-\d+)?\.html$/, '-all-page-1.html');
      routeDefaults = {};
    }
    return stateURL(routeBase, next, routeDefaults, current);
  }

  function initialIsStatic() {
    return state.page === serverPage && !state.q && !state.from && !state.to && !state.sort
      && state.dateType === 'Admission' && !Object.values(state.background).some(Boolean)
      && names.every(name => state.filters[name] === String(defaults[name] ?? ''));
  }

  function syncControls() {
    if (search) search.value = state.q;
    for (const control of selects) {
      const value = state.filters[control.dataset.field] || '';
      addOption(control, value);
      control.value = value;
    }
    const values = [state.from, state.to, state.dateType, state.sort];
    DATE_PARAMETERS.forEach((name, i) => { if (dateControls.get(name)) dateControls.get(name).value = values[i]; });
    for (const control of backgroundControls) {
      const value = state.background[control.name] || '';
      if (control.type === 'checkbox' || control.type === 'radio') control.checked = value === control.value;
      else { if (control.tagName === 'SELECT') addOption(control, value); control.value = value; }
    }
    const advanced = form.querySelector('.more-filters');
    if (advanced?.tagName === 'DETAILS' && [...advanced.querySelectorAll('select, input')]
      .some(control => control.value && (control.name !== 'date-type' || control.value !== 'Admission'))) advanced.open = true;
  }

  function readControls() {
    if (search) state.q = search.value;
    for (const control of selects) state.filters[control.dataset.field] = control.value;
    state.from = dateControls.get('deadline-from')?.value || '';
    state.to = dateControls.get('deadline-to')?.value || '';
    state.dateType = dateControls.get('date-type')?.value || 'Admission';
    state.sort = dateControls.get('deadline-sort')?.value || '';
  }

  function readBackground() {
    // Include all named answers, notably citizenship, permit and Dutch fee inputs.
    for (const control of backgroundControls) {
      if (control.type === 'radio' && !control.checked) continue;
      state.background[control.name] = control.type === 'checkbox'
        ? (control.checked ? control.value : '') : control.value;
    }
    localBackground = state.background;
    assessments = assessRecords(records, state.background);
  }

  function render({preserveStatic = false, target = '', focus = false} = {}) {
    const match = matchingRecords(records, state);
    found = match.records;
    if (dateError) dateError.hidden = !match.invalid;
    if (dateControls.get('deadline-to')) dateControls.get('deadline-to').setAttribute('aria-invalid', String(match.invalid));
    // Hash-only legacy links must find an item even if a new default hides it.
    if (target && byID.has(target) && !found.some(row => String(row.id) === target)
      && !location.search) {
      state.q = ''; state.from = ''; state.to = ''; state.sort = '';
      for (const key of names) state.filters[key] = '';
      found = matchingRecords(records, state).records;
      preserveStatic = false;
      syncControls();
    }
    const targetIndex = target ? found.findIndex(row => String(row.id) === target) : -1;
    if (targetIndex >= 0) {
      const targetPage = Math.floor(targetIndex / PAGE_SIZE) + 1;
      if (targetPage !== state.page) preserveStatic = false;
      state.page = targetPage;
    }
    const totalPages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
    const requested = state.page;
    state.page = Math.min(state.page, totalPages);
    if (requested !== state.page) preserveStatic = false;
    const start = (state.page - 1) * PAGE_SIZE;
    if (!preserveStatic) {
      const fragment = document.createDocumentFragment();
      for (const row of found.slice(start, start + PAGE_SIZE)) fragment.append(summaryCard(row));
      results.replaceChildren(fragment);
    } else {
      for (const badge of results.querySelectorAll('[data-window-state]')) {
        const row = byID.get(badge.closest('[id]')?.id);
        if (row) badge.textContent = `${applicationState(applicationData(row))} · based on reviewed dates`;
      }
    }
    count.textContent = `${found.length} of ${records.length} results${found.length
      ? ` · Showing ${start + 1}–${Math.min(start + PAGE_SIZE, found.length)} · Page ${state.page} of ${totalPages}` : ''}`;
    if (empty) empty.hidden = found.length > 0;
    renderPagination(totalPages);
    renderChips();
    const backgroundSummary = backgroundForm?.querySelector('[data-background-summary]');
    if (backgroundSummary) backgroundSummary.textContent = Object.values(state.background).some(Boolean)
      ? 'Background matching is active in this page only. Answers are not saved or included in shared links; reloading clears them.'
      : 'Choose any fields to explore matching routes. Answers stay in this page and are not saved or shared in links.';
    if (focus) count.focus({preventScroll: true});
  }

  function summaryCard(row) {
    const article = element('article', null, 'portal-entry');
    article.id = String(row.id);
    const heading = element('h2');
    heading.append(link(titleDestination(row), row.title || row.id));
    if (row.chinese) {
      const chinese = element('span', row.chinese);
      chinese.lang = 'zh-Hans';
      heading.append(document.createTextNode(' '), chinese);
    }
    article.append(heading);
    if (row.subtitle) article.append(element('p', row.subtitle, 'entry-meta'));
    if (row.meta) article.append(element('p', row.meta, 'entry-meta'));
    if (row.applicationWindow) {
      const badge = element('span', `${applicationState(applicationData(row))} · based on reviewed dates`, 'badge');
      badge.dataset.windowState = '';
      const line = element('p', null, 'entry-meta'); line.append(badge); article.append(line);
    }
    article.append(element('p', row.summary || '', 'entry-summary'));
    if (row.inlineInfo) article.append(element('p', row.inlineInfo, 'entry-meta'));
    appendAssessment(article, row);
    const actions = element('div', null, 'entry-actions');
    for (const action of entryActions(row)) actions.append(link(action.url, action.label));
    const collection=new URL(indexURL,location.href).pathname.split('/').at(-2);
    if(['library','exposition','encyclopedia','programs'].includes(collection)){
      const control=element('button',collection==='programs'?'Compare program':'Save to bookshelf');control.type='button';control.hidden=true;
      if(collection==='programs'){control.dataset.compareProgram='';control.dataset.programId=row.id}
      else{control.dataset.saveLearning='';control.dataset.learningId=row.id;control.dataset.learningType=collection==='exposition'?'library':collection}
      actions.append(control);
    }
    if (actions.childNodes.length) article.append(actions);
    if (showsDetails(row)) {
      const details = element('details');
      details.dataset.entryDetails = String(row.id);
      const summary = element('summary', 'Details and sources');
      const body = element('div', null, 'entry-detail');
      details.append(summary, body);
      details.addEventListener('toggle', () => { if (details.open) openDetails(row, details, body); });
      article.append(details);
    }
    return article;
  }

  function appendAssessment(article, row) {
    const output = element('div', null, 'notice');
    output.dataset.backgroundOutput = '';
    article.dataset.backgroundMatch = row.fields.backgroundMatch;
    const assessment = assessments.get(row.id);
    output.hidden = !assessment;
    if (assessment) {
      output.append(element('strong', assessment.state));
      for (const reason of assessment.reasons) output.append(element('p', reason, 'meta'));
      output.append(element('p', `${assessment.fee.state}: ${assessment.fee.text}`, 'meta'));
      if (assessment.fee.source) output.append(link(assessment.fee.source, 'Official fee-status rule'));
    }
    article.append(output);
  }

  async function openDetails(row, details, body) {
    if (details.dataset.loaded || details.dataset.loading) return;
    details.dataset.loading = 'true';
    details.setAttribute('aria-busy', 'true');
    body.replaceChildren(element('p', 'Loading full entry…', 'meta'));
    try {
      let html = loadedDetails.get(String(row.id));
      if (html === undefined) {
        const url = localURL(row.detail);
        if (!shardCache.has(url.href)) {
          const promise = fetch(url, {credentials: 'same-origin'}).then(async response => {
            if (!response.ok) throw new Error('Details unavailable');
            const payload = await response.json();
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid details');
            return payload;
          }).catch(error => { shardCache.delete(url.href); throw error; });
          shardCache.set(url.href, promise);
        }
        const payload = await shardCache.get(url.href);
        if (!Object.hasOwn(payload, row.id) || typeof payload[row.id] !== 'string') {
          shardCache.delete(url.href);
          throw new Error('Missing entry');
        }
        html = payload[row.id];
        loadedDetails.set(String(row.id), html);
      }
      const template = document.createElement('template');
      template.innerHTML = html;
      // Defense in depth for same-origin generated HTML. Never execute scripts,
      // inline handlers or active embeds; retain the article's original wording.
      for (const unsafe of template.content.querySelectorAll('script, iframe, object, embed, base, meta, link, style, form')) unsafe.remove();
      for (const hidden of template.content.querySelectorAll('[hidden]')) {
        if (!hidden.closest('[data-language-content="en"],[data-language-content="zh"]')) hidden.remove();
      }
      for (const node of template.content.querySelectorAll('*')) {
        if (node.id === String(row.id)) node.removeAttribute('id');
        for (const attribute of [...node.attributes]) {
          if (/^on/i.test(attribute.name) || ['srcdoc', 'srcset'].includes(attribute.name)) node.removeAttribute(attribute.name);
          if (['href', 'src', 'action', 'xlink:href'].includes(attribute.name) && !safeURL(attribute.value)) node.removeAttribute(attribute.name);
        }
        if (node.tagName === 'A' && node.target === '_blank') node.rel = 'noopener noreferrer';
      }
      if (!hasDetailContent(template.innerHTML)) {
        row.hasDetails = false;
        const returnFocus = details.contains(document.activeElement);
        const title = details.closest('article')?.querySelector('h2 a');
        details.remove();
        if (returnFocus) title?.focus({preventScroll:true});
        return;
      }
      body.replaceChildren(template.content);
      details.dataset.loaded = 'true';
    } catch {
      const message = element('p', 'The full entry could not be loaded. Try again or open the entry’s permanent page.', 'notice');
      message.setAttribute('role', 'status');
      const retry = element('button', 'Try again'); retry.type = 'button';
      retry.addEventListener('click', () => openDetails(row, details, body));
      body.replaceChildren(message, retry, link(row.url, 'Open permanent entry'));
    } finally {
      delete details.dataset.loading;
      details.removeAttribute('aria-busy');
    }
  }

  function renderPagination(total) {
    const fragment = document.createDocumentFragment();
    const add = (label, page, current = false) => {
      const url = browsingURL({...state, page});
      const anchor = link(url.href, label);
      anchor.dataset.portalPage = String(page);
      if (current) anchor.setAttribute('aria-current', 'page');
      if (label === 'Previous') anchor.rel = 'prev';
      if (label === 'Next') anchor.rel = 'next';
      fragment.append(anchor, document.createTextNode(' '));
    };
    if (state.page > 1) add('Previous', state.page - 1);
    const pages = [...new Set([1, total, state.page - 2, state.page - 1, state.page, state.page + 1, state.page + 2])]
      .filter(page => page >= 1 && page <= total).sort((a, b) => a - b);
    let previous = 0;
    for (const page of pages) {
      if (previous && page - previous > 1) fragment.append(element('span', '…'), document.createTextNode(' '));
      add(String(page), page, page === state.page); previous = page;
    }
    if (state.page < total) add('Next', state.page + 1);
    pagination.replaceChildren(fragment);
    pagination.hidden = total <= 1;
  }

  function renderChips() {
    if (!chips) return;
    const fragment = document.createDocumentFragment();
    const add = (label, remove) => {
      const button = element('button', `${label} ×`);
      button.type = 'button'; button.setAttribute('aria-label', `Remove ${label}`);
      button.addEventListener('click', () => {
        clearTimeout(inputTimer); remove(); state.page = 1; syncControls();
        assessments = assessRecords(records, state.background);
        commit({focus: true});
      });
      fragment.append(button, document.createTextNode(' '));
    };
    if (state.q) add(`Search: ${state.q}`, () => { state.q = ''; });
    for (const [field, value] of Object.entries(state.filters)) if (value) {
      add(`${filterLabels.get(field) || field}: ${value}`, () => { state.filters[field] = ''; });
    }
    if (state.from) add(`Deadline from: ${state.from}`, () => { state.from = ''; });
    if (state.to) add(`Deadline to: ${state.to}`, () => { state.to = ''; });
    if (state.dateType !== 'Admission') add(`Date type: ${state.dateType}`, () => { state.dateType = 'Admission'; });
    if (state.sort) add('Deadline order', () => { state.sort = ''; });
    for (const [name, value] of Object.entries(state.background)) if (value) {
      const control = backgroundControls.find(control => control.name === name);
      const label = control?.labels?.[0]?.querySelector('span')?.textContent || name;
      add(`${label}: ${value}`, () => { delete state.background[name]; });
    }
    chips.replaceChildren(fragment);
    chips.hidden = !chips.childNodes.length;
  }

  function rememberScroll() {
    if (restoring) return;
    const scroll = [window.scrollX, window.scrollY];
    const key = scrollKey();
    try { sessionStorage.setItem(key, JSON.stringify(scroll)); } catch { /* Storage is optional. */ }
    try { history.replaceState({...history.state, portalCatalogue: {scroll}}, '', location.href); } catch { /* Static browsing still works. */ }
  }

  function rememberedScroll() {
    const scroll = history.state?.portalCatalogue?.scroll;
    if (validScroll(scroll)) return scroll;
    try {
      const stored = JSON.parse(sessionStorage.getItem(scrollKey()) || 'null');
      return validScroll(stored) ? stored : null;
    } catch { return null; }
  }

  function restorePosition(scroll, target = '', focus = false) {
    const version = ++scrollVersion;
    restoring = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (version !== scrollVersion) return;
      if (scroll) window.scrollTo(...scroll);
      else if (target && document.getElementById(target)) document.getElementById(target).scrollIntoView();
      else if (focus) count.scrollIntoView({block: 'start'});
      restoring = false;
    }));
  }

  function commit({focus = false} = {}) {
    rememberScroll();
    render({focus});
    const url = browsingURL(state);
    if (url.href !== location.href) history.pushState({...history.state, portalCatalogue: {}}, '', url);
    if (focus) restorePosition(null, '', true);
  }

  form.addEventListener('submit', event => {
    event.preventDefault(); clearTimeout(inputTimer); readControls(); state.page = 1; commit({focus: true});
  });
  form.addEventListener('input', event => {
    clearTimeout(inputTimer);
    if (event.target === search) inputTimer = setTimeout(() => { readControls(); state.page = 1; commit(); }, 180);
    else { readControls(); state.page = 1; commit(); }
  });
  form.addEventListener('change', () => {
    clearTimeout(inputTimer);
    const previous = JSON.stringify(state);
    readControls();
    // A search field also fires change when it loses focus. If its debounced
    // results are already current, replacing them here would remove the link
    // between pointerdown and click and swallow the user's first navigation.
    if (JSON.stringify(state) === previous) return;
    state.page = 1;
    commit();
  });
  form.addEventListener('reset', event => {
    event.preventDefault(); clearTimeout(inputTimer);
    state.q = ''; state.from = ''; state.to = ''; state.dateType = 'Admission'; state.sort = ''; state.page = 1;
    for (const name of names) state.filters[name] = String(resetDefaults[name] ?? '');
    syncControls(); commit({focus: true});
  });
  if (backgroundForm) {
    const update = () => { clearTimeout(inputTimer); readControls(); readBackground(); state.page = 1; commit(); };
    backgroundForm.addEventListener('submit', event => { event.preventDefault(); update(); });
    backgroundForm.addEventListener('input', update);
    backgroundForm.addEventListener('change', update);
    backgroundForm.addEventListener('reset', event => {
      event.preventDefault(); clearTimeout(inputTimer); state.background = localBackground = Object.create(null);
      assessments = assessRecords(records, state.background); state.page = 1; syncControls(); commit({focus: true});
    });
  }
  pagination.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-portal-page]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); clearTimeout(inputTimer); readControls();
    state.page = pageNumber(anchor.dataset.portalPage); commit({focus: true});
  });
  results.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const article = anchor.closest('article.portal-entry');
    if (!article || anchor.parentElement?.tagName !== 'H2' || anchor.parentElement.parentElement !== article) return;
    const url = safeURL(anchor.href);
    if (!url || url.origin !== location.origin || url.pathname !== location.pathname) return;
    let target;
    try { target = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const details = article.querySelector('details[data-entry-details]');
    if (!details || target !== article.id) return;
    event.preventDefault();
    details.open = true;
    details.querySelector('summary')?.focus({preventScroll: true});
  });
  function restoreNavigation() {
    clearTimeout(inputTimer); clearTimeout(scrollTimer);
    const scroll = rememberedScroll();
    state = stateFromLocation(); assessments = assessRecords(records, state.background); syncControls();
    render({target: hashID()});
    restorePosition(scroll, hashID());
  }
  window.addEventListener('popstate', restoreNavigation);
  window.addEventListener('hashchange', restoreNavigation);
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer); scrollTimer = setTimeout(rememberScroll, 100);
  }, {passive: true});
  window.addEventListener('pagehide', rememberScroll);
  if ('scrollRestoration' in history) {
    previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.addEventListener('pagehide', () => { history.scrollRestoration = previousScrollRestoration; });
    window.addEventListener('pageshow', () => { history.scrollRestoration = 'manual'; });
  }
  // Resolve old hash links to their containing static page; preserve their anchor.
  const initialURL = browsingURL(state);
  initialURL.hash = location.hash;
  if (initialURL.href !== location.href) history.replaceState(history.state, '', initialURL);
  restorePosition(rememberedScroll(), initialHash);
  if (records.some(row => row.applicationWindow)) setInterval(() => {
    // Refresh dynamic date status without closing an open full entry.
    if (state.filters.applicationStatus) render();
    else for (const badge of results.querySelectorAll('[data-window-state]')) {
      const row = byID.get(badge.closest('article.portal-entry')?.id);
      if (row) badge.textContent = `${applicationState(applicationData(row))} · based on reviewed dates`;
    }
  }, 60000);
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}

function safeURL(value) {
  try { const url = new URL(value, location.href); return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url : null; }
  catch { return null; }
}

function localURL(value) {
  if (!value) throw new Error('Missing data URL');
  const url = safeURL(value);
  if (!url || url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) throw new Error('Nonlocal data URL');
  return url;
}

function link(href, label) {
  const anchor = element('a', label);
  const url = href && safeURL(href);
  if (url) {
    anchor.href = url.href;
    if (url.origin !== location.origin && ['http:', 'https:'].includes(url.protocol)) {
      anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
    }
  }
  return anchor;
}

function addOption(select, value, label = value) {
  if (![...select.options].some(option => option.value === value)) {
    const option = element('option', label); option.value = value; select.append(option);
  }
}

function hashID() {
  try { return decodeURIComponent(location.hash.slice(1)); } catch { return location.hash.slice(1); }
}

function scrollKey() { return `portal-catalogue:scroll:${location.pathname}${location.search}${location.hash}`; }
function validScroll(value) { return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite); }
