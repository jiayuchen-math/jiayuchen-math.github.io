import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

// Resolve relative to this module, never the caller's working directory. Hash
// bytes rather than timestamps so identical inputs produce identical pages.
const asset = name => `/en/resources/assets/${name}?v=${createHash('sha256')
  .update(readFileSync(new URL(`./assets/${name}`, import.meta.url)))
  .digest('hex').slice(0, 12)}`;

const sections = [
  { id: 'overview', label: 'Overview', href: '/en/resources/' },
  { id: 'library', label: 'Library', href: '/en/notes/reading-notes/library/catalogue.html' },
  { id: 'encyclopedia', label: 'Encyclopedia', href: '/en/resources/encyclopedia/' },
  { id: 'terminology', label: 'Terminology', href: '/en/resources/terminology/' },
  { id: 'paths', label: 'Learning paths', href: '/en/resources/library-paths/' },
  { id: 'links', label: 'Web resources', href: '/en/resources/links/' },
];
const subjects = { id: 'subjects', label: 'Browse subjects', href: '/en/resources/#subjects' };
const studyAdvice = { id: 'study-advice', label: 'Study advice', href: '/en/resources/links/study-advice.html' };
const bookshelf = { id: 'bookshelf', label: 'My bookshelf', href: '/en/resources/bookshelf/' };
const experiences = { id: 'experiences', label: 'Application experiences', href: '/en/resources/study-careers/experiences.html' };
const study = { id: 'study-careers', label: 'Study & Careers', href: '/en/resources/study-careers/' };
const studySections = [
  { id: 'programs', label: 'Programs', href: study.href },
  { id: 'researchers', label: 'Researchers', href: `${study.href}researchers.html` },
  { id: 'guides', label: 'Application guides', href: `${study.href}guides.html` },
  experiences,
  {id:'compare',label:'Compare programs',href:study.href+'compare/'},
];
const notes = { id: 'notes', label: 'Notes', href: '/en/notes/' };
const noteSections = [
  { id: 'course-notes', label: 'Course notes', href: '/en/notes/mathematical-notes/page.html' },
  { id: 'reading-notes', label: 'Reading notes', href: '/en/notes/reading-notes/reading-notes.html' },
];
const search = { id: 'search', label: 'Search', href: '/en/resources/search/' };
const normalize = value => {
  const pathname = new URL(value || '/en/resources/', 'https://shell.invalid/en/').pathname;
  return pathname.replace(/-(?:all-)?page-\d+(?=\.html$|\/?$)/, '').replace(/\/index\.html$/, '/');
};
const sectionFor = pathname => {
  if (/^\/en\/notes\/reading-notes\/library(?:\/|\.html$)/.test(pathname)) return sections[1];
  if(pathname===studyAdvice.href)return studyAdvice;
  if(pathname===bookshelf.href)return bookshelf;
  if(pathname.startsWith('/en/notes/mathematical-notes/'))return noteSections[0];
  if(pathname===normalize(noteSections[1].href))return noteSections[1];
  if (pathname.startsWith(study.href)) {
    return studySections.find(section => section.href !== study.href && normalize(section.href) === pathname)
      || (pathname === study.href ? studySections[0] : study);
  }
  if (pathname === search.href) return search;
  return sections.slice(2).find(section => pathname.startsWith(section.href))
    || (pathname.startsWith('/en/notes/') ? notes : sections[0]);
};
const link = (section, current, exact = true) => `<a href="${section.href}"${section.id === current ? ` class="is-active"${exact ? ' aria-current="page"' : ''}` : ''}>${escape(section.label)}</a>`;

function breadcrumbs(title, pathname, section, kind) {
  if (kind === 'home') return '';
  const crumbs = [{ label: 'Home', href: '/en/' }];
  if (['notes',...noteSections.map(item=>item.id)].includes(section.id)) {
    if(pathname!==notes.href)crumbs.push(notes);
    if(section.id!=='notes'&&normalize(section.href)!==pathname)crumbs.push(section);
  }
  else {
    crumbs.push(sections[0].id === section.id && pathname === sections[0].href
      ? { label: 'Resources' } : { label: 'Resources', href: sections[0].href });
    if ([study.id, ...studySections.map(item => item.id)].includes(section.id)) {
      if (pathname !== study.href) crumbs.push(study);
    }
    if (section.id !== 'overview' && section.id !== 'study-careers' && normalize(section.href) !== pathname) crumbs.push(section);
  }
  if (crumbs.at(-1).href || crumbs.at(-1).label !== title) {
    // A section's own page is represented by its supplied page title.
    if (!crumbs.at(-1).href) crumbs.pop();
    crumbs.push({ label: title });
  }
  return `<nav class="portal-breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.map(crumb => `<li>${crumb.href ? `<a href="${crumb.href}">${escape(crumb.label)}</a>` : `<span aria-current="page">${escape(crumb.label)}</span>`}</li>`).join('')}</ol></nav>`;
}

function scriptTag(script) {
  const options = typeof script === 'string' ? { src: script, defer: true } : script;
  if (!options?.src) throw new TypeError('Shell scripts need a src URL.');
  const source = String(options.src);
  if (!source.startsWith('/en/') && !/^https?:\/\//.test(source)) {
    throw new TypeError(`Shell script URLs must be absolute /en/ paths or HTTP(S) URLs: ${source}`);
  }
  return `<script src="${escape(source)}"${options.type ? ` type="${escape(options.type)}"` : ''}${options.defer !== false ? ' defer' : ''}${options.async ? ' async' : ''}></script>`;
}

/** Body, toc and head are trusted, already-rendered HTML; prose is never rewritten.
 * scripts accepts absolute URL strings or {src, type, defer, async} descriptors.
 */
export function shell({ title, body, url, kind = 'directory', active = '', toc = '', head = '', scripts = [] }) {
  if (!['home', 'directory', 'article'].includes(kind)) throw new TypeError(`Unknown shell kind: ${kind}`);
  const pathname = normalize(url || (kind === 'home' ? '/en/' : '/en/resources/'));
  const section = sectionFor(pathname);
  const current = active || section.id;
  const inNotes = ['notes',...noteSections.map(item=>item.id)].includes(current);
  const topCurrent = kind === 'home' ? 'home' : current === 'search' ? 'search' : inNotes ? 'notes' : 'resources';
  const navigationGroups = [
    ['learn-navigation','Learn Mathematics',[subjects,sections[4],studyAdvice,bookshelf]],
    ['reference-navigation','Reference & Reading',[sections[1],sections[2],sections[3],sections[5]]],
    ['careers-navigation','Study & Careers',studySections],
  ];
  const sidebar = kind === 'home'||inNotes ? '' : `<aside class="portal-sidebar" aria-label="Resources navigation">
<details class="portal-navigation" id="portal-navigation" data-portal-nav open>
<summary>Browse resources</summary>
<nav aria-label="Resource sections"><ul><li>${link(sections[0],current)}</li></ul>${navigationGroups.map(([id,label,items])=>`<section class="portal-nav-section" aria-labelledby="${id}"><h2 id="${id}">${escape(label)}</h2><ul>${items.map(item=>`<li>${link(item,current)}</li>`).join('')}</ul></section>`).join('')}</nav></details></aside>`;
  const contents = kind === 'article' && /<a\s[^>]*href=["']#[^"']+["']/.test(toc) ? `<aside class="portal-toc" aria-label="On this page"><div class="portal-toc-inner"><p class="portal-toc-label">On this page</p>${toc}</div></aside>` : '';
  const top = [
    { id: 'home', label: 'Home', href: '/en/' },
    { id: 'resources', label: 'Resources', href: '/en/resources/' }, notes, search,
  ];
  const pageScripts = [...scripts];
  if(!pageScripts.some(script=>String(typeof script==='string'?script:script?.src).split('?')[0]==='/en/resources/assets/learning-tools.js'))pageScripts.push({src:asset('learning-tools.js'),type:'module'});
  if (pathname.startsWith('/en/resources/library-paths/') && !pageScripts.some(script =>
    String(typeof script === 'string' ? script : script?.src).split(/[?#]/)[0] === '/en/resources/assets/paths.js',
  )) pageScripts.push(asset('paths.js'));
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}${title==='Jiayu Chen'?'':' · Jiayu Chen'}</title>
${head}
<link rel="stylesheet" href="${asset('portal.css')}">
<link rel="stylesheet" href="${asset('learning-tools.css')}">
<script src="${asset('theme.js')}"></script>
<script src="${asset('portal.js')}" defer></script>
<script src="${asset('language.js')}" type="module"></script>
<script src="${asset('learning-context.js')}" type="module"></script>
${pageScripts.map(scriptTag).join('\n')}
</head><body class="portal portal-${kind}${contents ? ' portal-has-toc' : ''}${inNotes?' portal-personal-notes':''}">
<a class="skip-link" href="#portal-main">Skip to content</a>
<header class="portal-topbar"><nav aria-label="Main navigation">${top.map(item => link(item, topCurrent)).join('')}<button id="theme-toggle" type="button" aria-label="Switch color theme">Theme</button><button id="language-toggle" type="button" lang="zh-Hans" hidden>中文</button></nav></header>
<div class="portal-layout">${sidebar}
<main class="portal-main" id="portal-main" tabindex="-1">
${breadcrumbs(title, pathname, section, kind)}
${kind==='home'?'':'<p class="knowledge-meta" data-route-context hidden></p>'}
<header class="portal-page-header"><h1>${escape(title)}</h1></header>
<p class="language-content-status" id="language-content-status" hidden></p><noscript><p class="language-content-status">Language switching requires JavaScript; the English pages remain readable.</p></noscript>
<div class="portal-content-layout">${contents}<div class="portal-body"><!-- portal-content:start -->${body ?? ''}<!-- portal-content:end --></div></div>
<footer class="portal-footer">© Jiayu Chen · <a href="/en/disclaimer.html">Disclaimer</a> · <a href="/en/resources/encyclopedia/contributing.html" data-contribute-hub>Contribute or report an issue</a></footer>
</main></div>
</body></html>
`;
}

export default shell;
