// References point to the existing stable work registry. These are reading
// selections, not additional catalogue works or new encyclopedia articles.
const pair = (en, zh) => ({en, zh});

export const algebraicGeometryTopicData = {
  id: 'algebraic-geometry-topic',
  edited: '2026-10-19',
  title: pair('Algebraic Geometry', '代数几何'),
  summary: pair(
    'A reading selection connecting schemes and cohomology with stacks, arithmetic and derived geometry.',
    '从概形与上同调出发，按问题选择叠、算术几何和导出几何的阅读资料。'),
  introduction: pair(
    'An equation gives a first picture of a space. Algebraic geometry asks what survives a change of coordinates, a change of field, or passage to a family. The six sections below collect a few places to read about those questions, with links back to the relevant foundations.',
    '一个方程可以给出空间的初步形状。换一套坐标、换一个域，或者把单个空间放进一族空间里，还能保留哪些信息？下面按这些问题整理几组读物，也列出读到这里需要的基础。'),
  selectionNote: pair(
    'For a first course, use the varieties and schemes section and the existing learning route. The later sections are separate branches: choose one for a question you want to understand, rather than reading every reference in order. The links open the authors’ or projects’ full texts; the catalogue remains the place for the longer booklist.',
    '初学可以先看代数簇与概形，并配合已有学习路线。后面的内容是不同分支，不是必须逐项完成的课程表；有了想弄清楚的问题，再选对应的一组。这里直接链接作者或项目公开的全文，更完整的书目仍放在书库。'),
  attribution: pair(
    'AI-assisted editorial compilation and Chinese translation. Reading selections and source checks are recorded here; no independent mathematical peer review is claimed.',
    '本页为 AI 辅助编选与中文翻译，记录了选读位置和来源核查，未经过独立的数学同行评审。'),
  aliases: ['代数几何专题', 'algebraic geometry reading', 'AG', 'schemes', '概形', 'stacks', '叠', 'étale', 'etale', 'DAG', 'SAG', 'perfectoid', 'prismatic', '棱镜上同调'],
  sections: [
    {
      id: 'varieties-schemes',
      title: pair('Varieties and schemes', '代数簇与概形'),
      problem: pair(
        'On the open set where a polynomial f does not vanish, why should f become invertible in the ring of functions? Work through that question before treating a scheme as a list of definitions. Localization explains the affine pieces; compatible functions on overlaps explain how those pieces fit together.',
        '在多项式 f 不为零的开集上，为什么要允许把 f 放进分母？先算清这个问题，再读概形的定义。局部化描述仿射空间的一块，而交叠处函数的相容性说明这些局部部分怎样粘合。'),
      prerequisites: ['commutative-algebra', 'localization-commutative-ring', 'algebraic-prime-spectrum', 'sheaf'],
      note: pair(
        'Milne is the shorter route through varieties; Vakil is the main choice here for schemes. If you can construct the structure sheaf on distinguished opens and glue affine charts, go on to the next section without repeating the entire first course.',
        '想先熟悉代数簇，可以选较短的 Milne；要系统学习概形，这里以 Vakil 为主。若已能在主开集上构造结构层，并用仿射图粘合概形，就不必重读整门入门课。'),
      concepts: ['localization-commutative-ring', 'algebraic-prime-spectrum', 'scheme'],
      readings: [
        {workId: 'work-0550', role: pair('Main course', '主要读物'),
          purpose: pair('Read the structure-sheaf construction alongside localization calculations. Keep an affine example at hand when the definition becomes global.', '把结构层的构造与局部化计算放在一起读。读到整体定义时，手边保留一个能算清的仿射例子。'),
          locator: pair('Chapters 2–4; especially §§3.5 and 4.1–4.4.', '第2—4章，重点看3.5节和4.1—4.4节。')},
        {workId: 'work-0054', role: pair('Varieties first', '先读代数簇'),
          purpose: pair('Use affine varieties and local rings to give the algebra geometric meaning before switching to schemes. This is an alternative starting point, not an extra prerequisite book.', '用仿射簇和局部环理解代数运算的几何含义，再转向概形。这是另一种起步方式，不是额外必读的一本书。'),
          locator: pair('Chapters 2, 4 and 5; §4c on local rings and §5f on patching.', '第2、4、5章；局部环见4c节，粘合见5f节。')},
      ],
    },
    {
      id: 'sheaves-cohomology',
      title: pair('Sheaves and cohomology', '层与上同调'),
      problem: pair(
        'Local solutions need not give a global solution. For example, local trivializations of a line bundle can differ by invertible functions on overlaps. Sheaves record the local data; cohomology helps organize the remaining global information. Start with a calculation, not with every possible cohomological formalism.',
        '局部有解，不等于整体有解。例如，线丛在不同开集上的平凡化，在交叠处会相差一个可逆函数。层记录局部数据，上同调则帮助整理剩下的整体信息。先做一个具体计算，不必一开始就学习所有上同调理论。'),
      prerequisites: ['scheme', 'sheaf', 'chain-complex-modules', 'homological-algebra'],
      note: pair(
        'Try a two-chart calculation on the projective line. If the connecting homomorphism is the obstacle, pause for Baker’s short notes; if the algebra is familiar, go straight to the geometric calculation.',
        '可以先用射影直线的两个仿射图做计算。若卡在连接同态，就补 Baker 的短讲义；若这些代数操作已经熟悉，直接做几何计算即可。'),
      concepts: ['sheaf', 'short-exact-sequence-modules', 'module-ext-group', 'spectral-sequence'],
      readings: [
        {workId: 'work-0550', role: pair('Calculate first', '先做计算'),
          purpose: pair('Follow the cohomology of line bundles on projective space. Return to the derived-functor construction when you need to compare the two definitions.', '先计算射影空间上线丛的上同调；需要比较两种定义时，再回头读导出函子的构造。'),
          locator: pair('§§18.1–18.3; then §§23.4–23.5 for the comparison with derived functors.', '18.1—18.3节；导出函子定义及比较见23.4—23.5节。')},
        {workId: 'work-0453', role: pair('Repair a prerequisite', '补同调代数'),
          purpose: pair('Use the short exact sequence of complexes to construct a connecting map. These fifteen pages supply algebraic practice, not a course on sheaf cohomology.', '从复形的短正合列构造连接同态。这份15页讲义用来练代数操作，不是层上同调课程。'),
          locator: pair('§§1–3; Theorem 2.2 and the following cochain-complex convention.', '第1—3节，重点是定理2.2及随后对上链复形的说明。')},
        {workId: 'work-0551', target: 'https://stacks.math.columbia.edu/tag/02FN',
          label: pair('The Stacks Project: first cohomology and torsors', 'The Stacks Project：一阶上同调与挠子'),
          role: pair('A classification example', '看一个分类问题'),
          purpose: pair('Read how first cohomology classifies torsors for an abelian sheaf. Compare the statement with transition functions rather than treating cohomology only as a group to compute.', '看一阶上同调怎样分类阿贝尔层的挠子，并与转移函数作比较，不只把上同调看成待计算的群。'),
          locator: pair('Tag 02FN, Definition 20.4.1 and Lemma 20.4.3.', 'Tag 02FN，定义20.4.1及引理20.4.3。')},
      ],
    },
    {
      id: 'descent-spaces-stacks',
      title: pair('Descent, algebraic spaces and stacks', '下降、代数空间与叠'),
      problem: pair(
        'A moduli problem asks for families, not just a set of isomorphism classes. What happens to an object’s automorphisms if we keep only that set? Work from a family of curves or bundles toward groupoids and descent; algebraic spaces and stacks then answer different parts of the problem.',
        '模问题要记录族，而不只是同构类组成的集合。若只留下同构类，对象的自同构去了哪里？从曲线族或向量丛族出发，逐步引入群胚和下降，再看代数空间与叠各自解决了什么问题。'),
      prerequisites: ['scheme', 'sheaf', 'representable-functor', 'categorical-pullback'],
      note: pair(
        'First distinguish gluing objects from gluing their morphisms. A quotient stack is not in general the same object as the orbit space. Read the definitions of algebraic spaces and stacks side by side after the moduli examples.',
        '先区分对象的粘合与态射的粘合。商叠一般不是轨道空间；读过模问题的例子后，再并排比较代数空间与代数叠的定义。'),
      concepts: ['fpqc-descent-quasi-coherent-sheaves', 'algebraic-space', 'algebraic-stack', 'quotient-stack', 'grothendieck-site', 'grothendieck-topos'],
      readings: [
        {workId: 'work-0526', role: pair('Moduli examples and definitions', '模问题的例子与定义'),
          purpose: pair('Start with families and automorphisms, then read the stack condition and scheme atlases. The examples give a reason for the extra categorical structure.', '先看族和自同构，再读叠条件与概形图册。先知道为什么需要这些结构，定义才不只是条件清单。'),
          locator: pair('§§1.3–1.6; then §§3.1, 3.5 and 4.1.', '1.3—1.6节；随后看3.1、3.5和4.1节。')},
        {workId: 'work-0551', target: 'https://stacks.math.columbia.edu/tag/023R',
          label: pair('The Stacks Project: fpqc descent', 'The Stacks Project：fpqc下降'),
          role: pair('Check the descent theorem', '核对下降定理'),
          purpose: pair('Work from the affine statement to descent of quasi-coherent sheaves. Keep both effectivity and full faithfulness in view; they are separate assertions.', '从仿射情形读到拟凝聚层的下降，分别检查下降数据的有效性与函子的全忠实性。'),
          locator: pair('Tag 023R, Lemma 35.5.1 and Proposition 35.5.2.', 'Tag 023R，引理35.5.1与命题35.5.2。')},
      ],
    },
    {
      id: 'etale-arithmetic',
      title: pair('Étale methods and arithmetic geometry', 'étale方法与算术几何'),
      problem: pair(
        'Over a finite field there is no complex topology to supply the usual Betti numbers. Which coverings should replace ordinary open sets? Étale morphisms provide a way to ask cohomological questions over other fields; arithmetic enters when those invariants interact with Galois actions and Frobenius.',
        '在有限域上，没有复拓扑来提供通常的贝蒂数。应该用什么覆盖代替普通开集？étale态射让我们能在别的域上提出上同调问题；再考察伽罗瓦作用和Frobenius，就会进入算术几何。'),
      prerequisites: ['scheme', 'sheaf', 'galois-extension', 'homological-algebra'],
      note: pair(
        'Begin with finite étale covers and the spectrum of a field. The pro-étale paper is a later branch for infinite constructions and coefficient issues, not a shorter substitute for a first étale course.',
        '先看有限étale覆盖和域的谱。pro-étale论文处理无穷构造与系数方面的问题，是后续分支，不是étale上同调入门的捷径。'),
      concepts: ['etale-fundamental-group', 'etale-cohomology', 'grothendieck-site', 'crystalline-cohomology'],
      readings: [
        {workId: 'work-0310', role: pair('First étale course', '第一门étale课程'),
          purpose: pair('Connect étale morphisms, the fundamental group and sites before the cohomology construction. These course notes are distinct from Milne’s 1980 book.', '先连起étale态射、基本群和景，再读上同调的构造。这是课程讲义，不是Milne于1980年出版的专著。'),
          locator: pair('§§2–3 and 5–10; return to §26 for the Weil-conjecture motivation.', '第2—3、5—10节；韦伊猜想的动机可参看第26节。')},
        {workId: 'work-0548', role: pair('Why enlarge the topology?', '为什么扩大拓扑？'),
          purpose: pair('Read the introduction’s coefficient problem first, then compare the pro-étale and étale sites. This explains a use for the new topology before its technical development.', '先读引言提出的系数问题，再比较pro-étale景与étale景。先明确新拓扑的用途，再进入技术细节。'),
          locator: pair('§1, especially Definitions 1.1–1.2; §§4–5 for the topology and comparison.', '第1节，尤其定义1.1—1.2；拓扑及比较见第4—5节。')},
      ],
    },
    {
      id: 'derived-higher',
      title: pair('Derived geometry and higher categories', '导出几何与高阶范畴'),
      problem: pair(
        'An ordinary fiber product can forget higher Tor groups in an intersection. Derived geometry retains this information in the geometric object. Higher categories provide a language for keeping equivalences and their compatibilities as well. These are related needs, but learning a model of higher categories is not the same task as learning derived geometry.',
        '普通纤维积可能丢掉交会中的高阶Tor信息。导出几何把这些信息保留在几何对象里，高阶范畴则提供记录等价及其相容性的语言。两者密切相关，但学一种高阶范畴模型，并不等于已经学会导出几何。'),
      prerequisites: ['scheme', 'tensor-product-modules', 'chain-complex-modules', 'category-theory', 'simplicial-set'],
      note: pair(
        'Start with Toën’s intersection example. Use HTT to learn the language you actually encounter, then consult SAG for spectral geometry. Simplicial commutative rings and commutative ring spectra are not interchangeable in arbitrary characteristic.',
        '先读Toën关于交会的例子，遇到需要的语言时再查HTT，之后按问题查阅SAG。任意特征下，不能把单纯交换环与交换环谱直接当成同一种东西。'),
      concepts: ['cotangent-complex', 'derived-scheme', 'simplicial-set', 'stable-infinity-category', 'infinity-topos', 'higher-category'],
      readings: [
        {workId: 'work-0144', role: pair('Geometric motivation', '先看几何动机'),
          purpose: pair('Use the intersection discussion to understand what is added to an ordinary scheme. Then compare the definition of a derived scheme with its classical truncation.', '先从交会看普通概形缺少了什么，再比较导出概形的定义与经典截断。'),
          locator: pair('Introduction; §2.2, Definition 2.5 and the truncation discussion; §4.1 for the cotangent complex.', '引言；2.2节的定义2.5及截断讨论；余切复形见4.1节。')},
        {workId: 'work-0229', role: pair('Categorical reference', '查高阶范畴语言'),
          purpose: pair('Read the inner-horn definition with nerves of ordinary categories as examples. Consult the topos chapter when descent begins to involve space-valued sheaves.', '用普通范畴的脉作例子理解内角填充条件；下降涉及空间值层时，再读无穷拓扑斯一章。'),
          locator: pair('§1.1.2, Definition 1.1.2.4; §6.1, especially Definition 6.1.0.4.', '1.1.2节的定义1.1.2.4；6.1节，尤其定义6.1.0.4。')},
        {workId: 'work-0525', role: pair('Spectral reference', '谱几何参考'),
          purpose: pair('Use the introduction to compare spectral and classical geometry, then identify the prerequisites you need. This unfinished draft is for selective reference, not a promised complete course.', '从引言比较谱几何与经典几何，再核对自己需要补哪些基础。这份未完成稿适合按问题查阅，不宜当作一门已经写齐的课程。'),
          locator: pair('§§0.1–0.2, motivation and prerequisites; Chapter 1 is the subsequent scheme and Deligne–Mumford-stack reference.', '0.1—0.2节的动机与先修说明；概形与Deligne–Mumford叠的后续参考见第1章。')},
      ],
    },
    {
      id: 'perfectoid-prismatic',
      title: pair('Perfectoid spaces and prismatic cohomology', 'perfectoid空间与棱镜上同调'),
      problem: pair(
        'A p-adic field has characteristic zero, while its residue field has characteristic p. Tilting relates geometric settings across this divide. Prismatic cohomology addresses a different question: how several integral p-adic cohomology theories can arise from a common construction. Read the connection without conflating the two theories.',
        'p进域的特征是零，剩余域的特征却是p。倾斜把这两种特征下的几何联系起来。棱镜上同调处理的则是另一个问题：几种整系数p进上同调理论，能否来自共同的构造？可以沿着两者的联系读下去，但不要把它们混成一套理论。'),
      prerequisites: ['scheme', 'etale-cohomology', 'homological-algebra', 'perfectoid-field'],
      note: pair(
        'You also need complete nonarchimedean fields and some adic geometry. Begin with the Berkeley lectures if that language is new. The papers below are research sources; understanding the examples and comparison statements is a sensible first pass.',
        '这里还需要完备非阿基米德域与一些adic几何。若这些语言还陌生，先读Berkeley讲义。下面两篇是研究论文，初读可以先弄清例子和比较定理说了什么，不必立刻追完所有证明。'),
      concepts: ['perfectoid-field', 'perfectoid-space', 'tilting-perfectoid-spaces', 'prism-p-adic-geometry', 'prismatic-cohomology'],
      readings: [
        {workId: 'work-0095', role: pair('Geometric preparation', '先补几何语言'),
          purpose: pair('Learn adic spaces, perfectoid rings and tilting in a lecture sequence. Read the adic examples before trying to use the perfectoid-space equivalence.', '按讲次学习adic空间、perfectoid环与倾斜。先熟悉adic空间的例子，再使用perfectoid空间的等价。'),
          locator: pair('Lectures 2–4 and 6–7; §§6.1–6.2 and 7.1–7.3.', '第2—4、6—7讲；重点看6.1—6.2及7.1—7.3节。')},
        {workId: 'work-0489', role: pair('The foundational paper', '回到原始论文'),
          purpose: pair('Compare the field and algebra definitions with the geometric tilting theorem. Use the paper to understand the role of almost mathematics, not as a replacement for valuation-theoretic preparation.', '比较域、代数的定义与几何倾斜定理，并看almost mathematics在证明中起什么作用；估值方面的基础仍需另外补齐。'),
          locator: pair('§§3–5; then §6 for analytic topology and §7 for the étale topology.', '第3—5节；解析拓扑见第6节，étale拓扑见第7节。')},
        {workId: 'work-0491', role: pair('Prisms and comparison maps', '棱镜与比较映射'),
          purpose: pair('Work through the prism examples before the site. Use the stated comparison theorems to identify what is being compared and under which hypotheses.', '先算棱镜的例子，再读棱镜景；读比较定理时，逐项写清比较的对象和所需假设。'),
          locator: pair('§1, Definition 1.1 and Example 1.3; §§2–4; §9 for the étale comparison.', '第1节的定义1.1与例1.3；第2—4节；étale比较见第9节。')},
      ],
    },
  ],
};

// A check means the title/author/version, full-text access and listed locators
// were inspected, not that the work has undergone a new mathematical review.
// PDF URLs identify the inspected source, not a second catalogue record.
export const algebraicGeometrySourceChecks = {
  'work-0550': {checked: '2026-10-19', fullText: 'https://math.stanford.edu/~vakil/216blog/FOAGoct2125public.pdf', version: pair('October 21, 2025 author draft', '作者2025年10月21日稿'), kind: pair('Book draft', '专著草稿')},
  'work-0054': {checked: '2026-10-19', fullText: 'https://www.jmilne.org/math/CourseNotes/AG.pdf', version: pair('v6.10, November 11, 2024', 'v6.10，2024年11月11日'), kind: pair('Course notes', '课程讲义')},
  'work-0453': {checked: '2026-10-19', fullText: 'https://www.maths.gla.ac.uk/~ajb/dvi-ps/Homologicalalgebra.pdf', version: pair('February 28, 2009; 15 pages', '2009年2月28日，15页'), kind: pair('Short lecture notes', '短篇讲义')},
  'work-0551': {checked: '2026-10-19', fullText: 'https://stacks.math.columbia.edu/', version: pair('Continuously maintained reference; stable tags 02FN and 023R', '持续维护的在线参考；稳定标签02FN与023R'), kind: pair('Online reference project', '在线参考项目')},
  'work-0526': {checked: '2026-10-19', fullText: 'https://sites.math.washington.edu/~jarod/moduli-versions/moduli-1-5-26.pdf', version: pair('January 5, 2026 draft', '2026年1月5日草稿'), kind: pair('Book draft', '专著草稿')},
  'work-0310': {checked: '2026-10-19', fullText: 'https://www.jmilne.org/math/CourseNotes/LEC.pdf', version: pair('v2.21, March 22, 2013', 'v2.21，2013年3月22日'), kind: pair('Course notes, not the 1980 book', '课程讲义，并非1980年专著')},
  'work-0548': {checked: '2026-10-19', fullText: 'https://people.mpim-bonn.mpg.de/scholze/proetale.pdf', version: pair('Author-hosted text; Astérisque 369 (2015)', '作者公开稿；发表于Astérisque 369（2015）'), kind: pair('Research paper', '研究论文')},
  'work-0144': {checked: '2026-10-19', fullText: 'https://arxiv.org/pdf/1401.1044', version: pair('arXiv:1401.1044v2, September 12, 2014', 'arXiv:1401.1044v2，2014年9月12日'), kind: pair('Survey article', '综述论文')},
  'work-0229': {checked: '2026-10-19', fullText: 'https://www.math.ias.edu/~lurie/papers/HTT.pdf', version: pair('Author-hosted version; author page records April 2017 update', '作者公开版本；作者页记载修订于2017年4月'), kind: pair('Research monograph', '研究专著')},
  'work-0525': {checked: '2026-10-19', fullText: 'https://www.math.ias.edu/~lurie/papers/SAG-rootfile.pdf', version: pair('February 3, 2018, unfinished; author warns of broken references', '2018年2月3日未完成稿；作者注明部分引用失效'), kind: pair('Unfinished book draft', '未完成专著草稿')},
  'work-0095': {checked: '2026-10-19', fullText: 'https://people.mpim-bonn.mpg.de/scholze/Berkeley.pdf', version: pair('2020 author-hosted edition', '作者公开的2020年版本'), kind: pair('Graduate lecture book', '研究生讲义专著')},
  'work-0489': {checked: '2026-10-19', fullText: 'https://arxiv.org/pdf/1111.4914', version: pair('arXiv:1111.4914v1 (2011); linked PDF carries November 27, 2024 typesetting date', 'arXiv:1111.4914v1（2011）；链接PDF另载2024年11月27日排版日期'), kind: pair('Foundational research paper', '奠基性研究论文')},
  'work-0491': {checked: '2026-10-19', fullText: 'https://arxiv.org/pdf/1905.08229', version: pair('arXiv:1905.08229v4, January 12, 2022', 'arXiv:1905.08229v4，2022年1月12日'), kind: pair('Foundational research paper', '奠基性研究论文')},
};

export const algebraicGeometryPrerequisites = {
  'commutative-algebra': {url: '/en/notes/reading-notes/library/algebra/commutative-algebra.html', title: pair('Commutative algebra', '交换代数')},
  'homological-algebra': {url: '/en/notes/reading-notes/library/algebra/homological-algebra.html', title: pair('Homological algebra', '同调代数')},
  'category-theory': {url: '/en/notes/reading-notes/library/algebra/category-theory.html', title: pair('Category theory', '范畴论')},
};
