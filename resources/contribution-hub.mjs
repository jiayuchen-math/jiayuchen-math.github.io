// Content only: the portal builder installs this body on the existing guide.
// No file writes, page generation, source checks or publication happen here.
const repository = 'https://github.com/jiayuchen-math/jiayuchen-math.github.io';
const guideURL = 'https://jiayuchen-math.github.io/resources/encyclopedia/contributing.html';
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const external = (url, label, attributes = '') =>
  `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer"${attributes}>${escape(label)}</a>`;
const source = (file, label) => external(`${repository}/blob/main/${file}`, label);
const list = items => `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
const section = (id, label, html) => ({ id, label, html });

// MAIN may replace only the URL and location query values using the actual
// referring page. Attribute values are GitHub form IDs, not CSS selectors.
// Existing forms do not all have a field called "location": preserve their IDs.
const actions = [
  ['math-correction.yml', 'claim', 'Mathematical correction', '数学纠错',
    'A missing hypothesis, incorrect formula, proof gap or counterexample.',
    '漏掉的条件、公式错误、证明中的缺口，或不成立的结论。'],
  ['broken-link.yml', 'link-text', 'Broken link', '失效链接',
    'A missing file, moved page or link that opens the wrong work.',
    '文件打不开、页面搬迁，或链接指向了别的资料。'],
  ['terminology-suggestion.yml', 'current-claim', 'Terminology suggestion', '术语建议',
    'A mathematical sense, Chinese translation, alias or usage distinction.',
    '术语的具体义项、中文译名、别名或用法区别。'],
  ['resource-recommendation.yml', 'reading-purpose', 'Resource recommendation', '推荐资料',
    'A specific book, lecture, course or advice article and what it helps readers learn.',
    '推荐具体的书、讲义、课程或建议文章，并说清它能帮助读者学什么。'],
  ['article-proposal.yml', 'location', 'Article proposal', '文章提案',
    'Suggest an explanation, worked example, learning guide or revision before writing it in full.',
    '想写概念解释、例题、学习导读，或改进已有文章，可以先说想法，不必交全文。'],
  ['translation-correction.yml', 'location', 'Translation correction', '翻译纠错',
    'An inaccurate translation, missing passage or wording that obscures the English original.',
    '译错、漏译，或中文表达让原意变得不清楚的地方。'],
];

function actionList(zh) {
  return `<ul class="contribution-actions">${actions.map(([template, field, en, cn, descriptionEn, descriptionZh]) => {
    const query = new URLSearchParams({ template, 'page-url': guideURL });
    // Readable without JS. The visitor can replace this provenance with the
    // affected heading; MAIN can prefill the real referring URL/position later.
    query.set(field, zh
      ? '从投稿说明进入；请填写要修改的页面位置或相关段落。'
      : 'From the contribution guide; identify the affected heading or passage.');
    const attributes = ` data-contribution-template="${template}" data-contribution-page-field="page-url" data-contribution-location-field="${field}"`;
    return `<li>${external(`${repository}/issues/new?${query}`, zh ? cn : en, attributes)} — ${zh ? descriptionZh : descriptionEn}</li>`;
  }).join('')}</ul>`;
}

// This is a body excerpt, deliberately not a new publishable article or record.
// It uses an existing source URL and a concrete locator; no checked date or
// author metadata is invented. Keep mathematics identical in the two versions.
const example = {
  en: String.raw`## Examples and non-examples

On $(-1,1)$, let $u(x)=|x|$. Its weak derivative is
$g(x)=-1$ for $x<0$ and $g(x)=1$ for $x>0$.
The value assigned to $g(0)$ does not change its $L^p$ class.

For $\varphi\in C_c^\infty(-1,1)$, integration by parts separately
on $(-1,0)$ and $(0,1)$ gives

$$
\int_{-1}^{1}|x|\varphi'(x)\,dx
=-\int_{-1}^{1}g(x)\varphi(x)\,dx.
$$

Thus $u\in W^{1,p}(-1,1)$ for every $1\le p\le\infty$,
although $u$ has no classical derivative at zero.

See [John K. Hunter, Notes on Partial Differential Equations,
Chapter 3, “Sobolev spaces”, §3.1 “Weak derivatives”](https://www.math.ucdavis.edu/~hunter/pdes/pde_notes.pdf).
`,
  zh: String.raw`## Examples and non-examples

在 $(-1,1)$ 上，设 $u(x)=|x|$。它的弱导数为：
当 $x<0$ 时 $g(x)=-1$，当 $x>0$ 时 $g(x)=1$。
$g(0)$ 取什么值，都不改变它所属的 $L^p$ 等价类。

对 $\varphi\in C_c^\infty(-1,1)$，分别在 $(-1,0)$ 和 $(0,1)$
上分部积分，得到

$$
\int_{-1}^{1}|x|\varphi'(x)\,dx
=-\int_{-1}^{1}g(x)\varphi(x)\,dx.
$$

所以对每个 $1\le p\le\infty$，都有 $u\in W^{1,p}(-1,1)$，
尽管 $u$ 在零点没有通常意义下的导数。

参见 [John K. Hunter, Notes on Partial Differential Equations，
第 3 章“Sobolev spaces”，§3.1“Weak derivatives”](https://www.math.ucdavis.edu/~hunter/pdes/pde_notes.pdf)。
`,
};

function englishSections() {
  return [
    section('write-an-explanation-not-an-advertisement', 'What you can contribute', `
      <p>A useful contribution can be small: fix a hypothesis, explain a difficult example, improve a translation or recommend a particular chapter. This guide covers the whole Mathematics Resources area: the Library, learning paths, encyclopedia, terminology, web resources and Study &amp; Careers.</p>
      <p>Start with the existing page when one already answers the same question. An original encyclopedia explanation and an external reading guide are different kinds of content; recommending a link does not turn its contents into a site-authored article.</p>
      <p>Reading needs no account. Submitting an issue or pull request uses a GitHub account; there is no separate site account. Contributions are reviewed before publication, not posted automatically. Reports are public: leave out private correspondence, account tokens and sensitive student information.</p>`),
    section('contribution-actions', 'Choose a contribution', actionList(false) + `
      <p>The forms ask for a page and a location. If you arrived here without a referring page, replace the guide URL with the affected page and quote its heading or a short passage. A section link is particularly helpful.</p>`),
    section('editing-an-existing-entry', 'Editing an existing page', `
      <p>Use the entry’s source-edit link to propose a PR, or choose a form above if you would rather describe the change. Edit the source, not just the generated HTML. Explain what is wrong, why your replacement is better and which source supports it.</p>
      <p>For a mathematical correction, include the hypotheses and enough of the argument to check it. For a translation, quote the English passage and proposed Chinese together; keep the same claim, conventions and qualifications. A smoother sentence should not make a theorem stronger.</p>
      <p>For books and web links, identify the edition, exact reading location and access status: full text, preview, institutional access or purchase. For application information, cite the official programme and relevant year; do not infer funding, eligibility or an opening from an old announcement.</p>`),
    section('adding-a-new-entry', 'Proposing new content', `
      <p>An article proposal can be an outline. Tell us who it is for, the question it answers, related pages, primary sources with precise locators and what you would contribute. You do not need a finished article to start the discussion.</p>
      <p>Before adding a record, read the ${source('resources/content/SCHEMA.md', 'content schema')}. Use one stable semantic concept ID; use separate IDs for genuinely different mathematical senses. Spelling variants, acronyms and Traditional Chinese forms belong in aliases, not duplicate entries. Check existing subject IDs and levels rather than inventing new taxonomy values.</p>
      <p>A new encyclopedia article belongs in <code>resources/content/encyclopedia/&lt;area&gt;/&lt;id&gt;.md</code>; terminology records belong in <code>resources/data/terminology-&lt;area&gt;.json</code>. An encyclopedia article needs a corresponding terminology record. A well-sourced terminology record can stand alone without an empty article page.</p>
      <p>Encyclopedia entries use the seven headings in the schema: Overview; Prerequisites; Definition and conventions; Intuition; Examples and non-examples; Important properties; Connections and further reading. State theorem assumptions, explain conventions and work through an example or non-example. Mark a proof sketch as a sketch. A research introduction may give an explicitly scoped formulation with a precise reference; it should not pretend to construct a whole theory in a few paragraphs.</p>`),
    section('sources-and-translation-evidence', 'Sources and translation evidence', `
      <p>Cite the author or institution, title, edition or version, public URL and exact section, definition, theorem or page you used. Prefer author, university, publisher or authorized archive sources. A forum can suggest a lead; check the underlying source before presenting it as evidence.</p>
      <p>Evidence for a mathematical definition and evidence for a Chinese rendering are separate. An English textbook alone does not establish a Chinese term. Cite an explicit terminology standard, Chinese textbook or author’s notes that actually use the name. Record competing translations with their contexts. “Community usage” is not the same as a standardized term.</p>
      <p>Use your own explanations. Link to source material instead of copying its prose, diagrams or exercises. Record an inspection date only when the source was actually read. Source checking is not external peer review; unchecked material remains a draft and does not count as a published entry.</p>`),
    section('format-and-mathematical-notation', 'Format and notation', `
      <p>Encyclopedia articles use Markdown with <strong>JSON front matter, not YAML</strong>, between <code>---</code> lines. Follow the schema for required metadata and source fields. Aim for the length the explanation needs, usually 500–1000 words; published encyclopedia entries require 350–2000 words. These limits do not turn an external reading guide or a small correction into a full article.</p>
      <p>Use <code>$...$</code> for inline math and <code>$$</code> on separate lines for display math. Standard KaTeX commands are supported; HTML, scripts, executable material, TikZ, custom macros, <code>\\label</code> and <code>\\ref</code> are not. Use ordinary Markdown links. The build renders formulas, including for readers without JavaScript.</p>
      <p>Keep stable IDs and published anchors when editing. The builder creates the contents list, sources, related translation links and contribution controls; do not duplicate them inside the article.</p>`),
    section('markdown-example', 'A Markdown example', `
      <p>This is a body excerpt for the existing Sobolev-space topic, not a complete new entry or a publish-ready file. It shows a short argument and a specific source link. A new entry still needs schema-valid JSON metadata, all seven sections, appropriate length, genuine contributors and references with actual inspection dates. The English section heading is kept below because the current article-source schema requires it.</p>
      <pre><code class="language-markdown">${escape(example.en)}</code></pre>`),
    section('attribution-and-licensing', 'Attribution and rights', `
      <p>Credit the people who wrote or revised the content and disclose AI-assisted drafting or translation in contributor metadata and the PR description. Do not attach the site owner’s name to text they did not write. Separate authorship, editing, source inspection and mathematical review; claim only work actually done.</p>
      <p>New original encyclopedia and terminology contributions are offered under ${external('https://creativecommons.org/licenses/by-sa/4.0/', 'CC BY-SA 4.0')}. Retain attribution and comply with the licence when adapting compatible material. This does not relicense existing personal notes, external textbooks, quotations, images, dependency packages or the whole website. Other sections retain their existing terms; discuss rights for a new guide before publication rather than assuming this licence covers it.</p>
      <p>Only submit material you wrote or have the right to contribute. Publicly readable is not the same as permission to copy or redistribute. Recommend an authorized link when you cannot supply the content itself.</p>`),
    section('review-checklist', 'Before a pull request is merged', `
      <p>For an existing page, keep the change focused and explain its reason. For a new page, include its record, references and relevant relations as well as the text. Use the repository’s PR checklist to separate what you checked from what still needs review.</p>
      ${list([
        'Check definitions, conventions, theorem assumptions, proof gaps and worked examples.',
        'Provide inspectable sources and concrete locators; keep mathematical and translation evidence separate.',
        'Check IDs, subject, level, aliases and existing senses; do not create empty or duplicate entries.',
        'Keep English and Chinese claims aligned, including notation, scope and qualifications. Flag a translation that needs review.',
        'Respect licences, attribution and privacy; report AI assistance and unresolved questions honestly.',
        'Check formula rendering, search, links, keyboard use and narrow-screen layout for the affected pages. Record which checks were actually run.',
      ])}
      <p>The maintainer installs the locked dependencies with <code>npm ci --prefix resources --ignore-scripts</code>, runs <code>node resources/build.mjs</code> and the content checks, and commits generated static pages before merging or publishing. The ${source('.github/workflows/knowledge-check.yml', 'current workflow')} lists the full checks, including legacy content, formulas, search, links and repeat-build consistency. Its repository permissions are read-only: it does not auto-merge a PR or write to a contributor’s branch. A passing automated check does not replace editorial or mathematical review.</p>`),
    section('open-topics', 'Contributions that would help', `
      <p>These are questions for a proposal, not links to unfinished articles. Check related pages first; a better example on an existing page may be more useful than a new entry.</p>
      ${list([
        'A worked localization-and-gluing example: show what the rings on two basic open sets retain and how agreement on the overlap is checked.',
        'An exercise on the weak derivative of the absolute-value function: use test functions, track the boundary terms and distinguish its first and second distributional derivatives.',
        'Conditional expectation on a finite probability space: compute it on a partition and explain what changes when the partition is refined.',
        'A first example of a site: compare an ordinary open cover with a covering family in the new setting, and identify the sheaf condition being used.',
      ])}`),
    section('revision-history', 'Revision record', `
      <p><time datetime="2026-10-19">19 October 2026</time> — Editorial revision of this guide: extended the instructions to all Mathematics Resources sections, added article and translation forms, and clarified the example, rights and review checklist.</p>
      <p>Prepared with AI assistance. This date records the guide’s revision, not a new inspection of every linked source, external peer review or a mathematical check by Jiayu Chen.</p>`),
  ];
}

function chineseSections() {
  return [
    section('write-an-explanation-not-an-advertisement', '可以怎样参与', `
      <p>贡献不一定要是一篇长文。补上定理的条件、讲清一个例子、改正一处翻译，或推荐值得读的一章，都有帮助。这份说明适用于整个数学资源区，包括书库、学习路线、百科、术语、学习网站，以及升学与职业栏目。</p>
      <p>如果已有页面在讲同一个问题，优先把它改好。原创百科和外部阅读导引是两类内容；收录一条链接，不等于链接里的文章成了本站原创。</p>
      <p>阅读不需要账户。提交 issue 或 PR 需要 GitHub 账户，不用另注册本站账户。投稿经过审核后才会发布，不会提交后立即上线。公开报告中请勿放入私人通信、账户令牌或学生的敏感信息。</p>`),
    section('contribution-actions', '选择提交方式', actionList(true) + `
      <p>表单会询问页面和具体位置。如果不是从有问题的页面跳转过来的，请把默认的投稿说明网址换成实际页面，再写上小节标题或一小段原文。能附上小节链接更好。</p>`),
    section('editing-an-existing-entry', '修改已有页面', `
      <p>可以从词条的源码编辑入口提出 PR；不想直接改文件，也可以用上面的表单说明问题。请修改源文件，不要只改生成的 HTML。说清哪里不对、为什么要这样改，以及依据是什么。</p>
      <p>数学纠错请写全条件，并给出足以核对的推导。翻译纠错请把英文原文和建议的中文放在一起，保留原来的结论、约定和限定。句子可以更顺，但不能把定理译得更强。</p>
      <p>推荐书或网站时，请注明版本、具体阅读位置和获取方式：全文、预览、机构权限还是购买。申请信息应引用对应项目和年度的官网说明，不从旧通知推断现在的资助、资格或招生名额。</p>`),
    section('adding-a-new-entry', '提交新内容', `
      <p>文章提案可以先交提纲：写给谁看，回答什么问题，和哪些已有页面有关，参考资料的具体位置，以及打算补充什么。不必先写完一整篇文章。</p>
      <p>新增记录前，请看${source('resources/content/SCHEMA.md', '内容格式说明')}。同一个数学概念使用一个稳定 ID；确实不同的义项才另设 ID。拼写变体、缩写和繁体字形放进别名，不另算词条。学科和层次沿用现有取值，不自行造一个分类。</p>
      <p>百科源文件放在 <code>resources/content/encyclopedia/&lt;area&gt;/&lt;id&gt;.md</code>，术语记录放在 <code>resources/data/terminology-&lt;area&gt;.json</code>。百科需要对应的术语记录；有可靠来源的术语短释义可以独立存在，不必配一个空百科页。</p>
      <p>百科源文件保留格式说明里的七个标题：Overview、Prerequisites、Definition and conventions、Intuition、Examples and non-examples、Important properties、Connections and further reading。正文要写明定理条件和约定，算清至少一个例子或反例。证明思路就标为思路；研究概念导读可以给出限定范围的表述和准确出处，不必假装几段话就能建立整套理论。</p>`),
    section('sources-and-translation-evidence', '来源与译名依据', `
      <p>注明作者或机构、资料名、版本、公开链接，以及实际用到的章节、定义、定理或页码。优先使用作者、大学、出版社或授权档案的资料。论坛能提供线索，但作为依据收录前，应继续查到原始来源。</p>
      <p>数学定义的依据和中文译名的依据是两回事。英文教材本身不能证明某个中文译名成立。请引用确实使用该译名的审定名词、中文教材或作者讲义。不同译法要说明各自语境；“有人这样用”不等于“已审定”。</p>
      <p>解释请自己组织，不搬运资料中的段落、图或习题，用链接指向原文即可。只有实际读过来源，才填写核查日期。核对来源不等于外部同行评审；尚未核查的内容保留为草稿，不计入已发布数量。</p>`),
    section('format-and-mathematical-notation', '文件格式与公式', `
      <p>百科使用 Markdown，文件开头两个 <code>---</code> 之间放 <strong>JSON 元数据，不是 YAML</strong>。必填字段及来源格式见内容说明。篇幅随内容决定，通常为 500–1000 个英文单词；已发布百科的要求是 350–2000 词。这个限制不适用于外部阅读导引，也不是要求每次小修改都写成一篇文章。</p>
      <p>行内公式用 <code>$...$</code>，独立公式用单独成行的 <code>$$</code> 包住。支持标准 KaTeX 命令；不要加入 HTML、脚本、可执行内容、TikZ、自定义宏、<code>\\label</code> 或 <code>\\ref</code>。引用使用普通 Markdown 链接。公式在构建时渲染，读者关闭 JavaScript 也能看。</p>
      <p>修改时保留已有 ID 和已发布的锚点。目录、来源区、对应译解链接和投稿控件由构建程序生成，不要在正文里再放一套。</p>`),
    section('markdown-example', 'Markdown 示例', `
      <p>下面是现有 Sobolev 空间主题的一段正文示例，不是完整新词条，也不能直接作为新文章发布。它展示了简短推导和具体来源链接。新增词条还需要符合格式要求的 JSON 元数据、七个完整小节、合适的篇幅、真实贡献者，以及带实际核查日期的引用。示例保留英文小节标题，因为当前百科源文件的格式检查要求使用这些标题。</p>
      <pre><code class="language-markdown">${escape(example.zh)}</code></pre>`),
    section('attribution-and-licensing', '署名与许可', `
      <p>谁写了、谁修改了，就如实署名。使用 AI 辅助起草或翻译，请在贡献者元数据和 PR 说明中注明。不要把站主的名字加到并非他写的文章上。写作、编辑、核对来源和数学复核分开记录，只说明实际完成的工作。</p>
      <p>新提交的原创百科和术语内容采用 ${external('https://creativecommons.org/licenses/by-sa/4.0/', 'CC BY-SA 4.0')}。改编兼容许可的内容时，保留署名并遵守原许可。这不改变已有个人笔记、外部教材、引用、图片、依赖包或整个网站的许可。其他栏目沿用原有许可；新增导读的授权应在发布前说清，不默认套用百科的许可。</p>
      <p>只提交自己写的或有权提供的内容。能在网上读到，不等于可以复制或重新分发。无权提供全文时，推荐合法的原文链接即可。</p>`),
    section('review-checklist', 'PR 合并前检查', `
      <p>修改已有页面时，尽量围绕具体问题，并说明理由。新增页面则需要一并提供记录、引用和相关关联，不能只有正文。仓库的 PR 清单用于记录已经检查的项目，以及仍需别人复核的地方。</p>
      ${list([
        '核对定义、约定、定理条件、证明中的缺口，以及例题计算。',
        '来源可查，位置具体；数学依据与译名依据分开提供。',
        '检查 ID、学科、层次、别名和已有义项，不新增空页或重复词条。',
        '中英文的结论、符号、适用范围和限定一致；需要复核的译文要标出来。',
        '确认许可、署名和隐私，说明 AI 辅助及尚未解决的问题。',
        '检查相关页面的公式、搜索、链接、键盘操作和窄屏显示，只勾选实际运行过的检查。',
      ])}
      <p>维护者使用 <code>npm ci --prefix resources --ignore-scripts</code> 安装锁定版本的依赖，运行 <code>node resources/build.mjs</code> 和内容检查，在合并或发布前提交生成的静态页面。完整检查见${source('.github/workflows/knowledge-check.yml', '当前工作流')}，包括旧内容、公式、搜索、链接和重复构建的一致性检查。检查任务只有仓库读取权限，不会自动合并 PR，也不会写入投稿者的分支。自动检查通过，不代替编辑审核或数学复核。</p>`),
    section('open-topics', '目前欢迎补充的内容', `
      <p>下面是可以讨论的选题，不是尚未写好的文章链接。先看看相关页面；有时给已有文章补一个好例子，比另开词条更有用。</p>
      ${list([
        '局部化与粘合的完整例子：两个基本开集上的环分别保留什么信息，交集上的相容性具体怎样检验。',
        '绝对值函数的弱导数练习：用测试函数推导，写清边界项，并区分一阶和二阶分布导数。',
        '有限概率空间上的条件期望：按分割逐步算出来，再解释细化分割后哪些信息发生了变化。',
        'site 的第一个例子：从通常的开覆盖出发，对比新语境中的覆盖族，指出实际使用的层条件。',
      ])}`),
    section('revision-history', '修订记录', `
      <p><time datetime="2026-10-19">2026 年 10 月 19 日</time>——修订投稿说明：覆盖整个数学资源区，增加文章提案和翻译纠错入口，补充示例、许可范围和审核清单。</p>
      <p>本页修订使用了 AI 辅助。这个日期只记录说明页的修订，不表示重新核查了全部外部来源，不代表外部同行评审，也不表示站主完成了数学复核。</p>`),
  ];
}

/**
 * Return content for resources/encyclopedia/contributing.html (no side effects).
 *
 * Each of the six action anchors has:
 * - data-contribution-template: the existing/new issue-template filename;
 * - data-contribution-page-field: the form ID receiving the actual referring URL;
 * - data-contribution-location-field: the form ID receiving its heading/passage.
 * MAIN owns referring-page capture, query sanitization and optional JS prefill.
 * With no JS, hrefs still open a named form with editable, readable defaults.
 * Both locales use the same heading IDs; body deliberately has no document H1.
 */
export function contributionHub({ locale = 'en' } = {}) {
  if (!['en', 'zh'].includes(locale)) throw new RangeError(`Unsupported contribution hub locale: ${locale}`);
  const zh = locale === 'zh';
  const sections = zh ? chineseSections() : englishSections();
  return {
    title: zh ? '投稿与纠错' : 'Contributing & corrections',
    body: `<div class="contribution-hub" lang="${zh ? 'zh-Hans' : 'en'}">${sections.map(({ id, label, html }) =>
      `<section><h2 id="${id}">${escape(label)}</h2>${html}</section>`).join('\n')}</div>`,
    contents: sections.map(({ id, label }) => ({ id, label })),
    summary: zh
      ? '怎样修改数学资源、提出文章想法或改正翻译，以及来源、署名和审核的要求。'
      : 'How to correct a resource, propose an article or improve a translation, with source, attribution and review requirements.',
    aliases: ['Contributing', 'Contribution guide', 'Writing & Contribution Guide', 'Article proposal', 'Translation correction', '投稿', '纠错', '文章提案', '翻译纠错'],
  };
}
