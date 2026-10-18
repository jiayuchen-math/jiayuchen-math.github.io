// Additive editorial material only. Existing course/check/translation records
// remain the authority for the original study guides and their source dates.
const R = String.raw;
const both = (en, zh) => ({en, zh});

export const hunterSource = {
  title: 'Lecture Notes on PDEs — Chapter 3: Sobolev spaces',
  author: 'John K. Hunter',
  url: 'https://www.math.ucdavis.edu/~hunter/pdes/ch3.pdf',
  sourceUrl: 'https://www.math.ucdavis.edu/~hunter/pdes/pdes.html',
  locator: both('§3.1, Definition 3.1, printed p. 47; §3.2, Example 3.3, printed p. 48 (chapter PDF pages 3–4).',
    '§3.1 定义3.1，印刷页47；§3.2 例3.3，印刷页48（分章 PDF 的第3—4页）。'),
  checked: '2026-10-19',
  access: both('Free full chapter PDF on the author’s university site.', '作者大学网站上的完整分章 PDF，可免费阅读。'),
};

export const weakDerivativeCheck = {
  id: 'check-absolute-value-weak-derivative',
  prompt: both(
    R`On $I=(-1,1)$ let $u(x)=|x|$. Show that its weak derivative is $g(x)=\operatorname{sgn}(x)$ for $x\ne0$, with any value assigned at $0$. Write the test-function identity and explain why the corner does not prevent it.`,
    R`在 $I=(-1,1)$ 上令 $u(x)=|x|$。证明它的弱导数在 $x\ne0$ 时为 $g(x)=\operatorname{sgn}(x)$，在 $0$ 处可以任意赋值。写出测试函数恒等式，并说明原点的折角为什么不妨碍这个结论。`),
  hint: both(
    R`Take $\varphi\in C_c^\infty((-1,1))$ and split the integral at $0$. On the left $|x|=-x$; on the right $|x|=x$. Integrate by parts on each half. The endpoint terms vanish: $\varphi$ is zero near $\pm1$, and the factor $x$ is zero at $0$.`,
    R`取 $\varphi\in C_c^\infty((-1,1))$，在 $0$ 处分开积分。左半边用 $|x|=-x$，右半边用 $|x|=x$，分别做分部积分。端点项都为零：$\varphi$ 在 $\pm1$ 附近为零，而 $0$ 处的因子 $x$ 为零。`),
  solution: both([
    R`Both $u$ and $g$ are locally integrable. For every $\varphi\in C_c^\infty((-1,1))$, the required identity is`,
    R`$$
\int_{-1}^{1}|x|\varphi'(x)\,dx=-\int_{-1}^{1}g(x)\varphi(x)\,dx.
$$`,
    R`Extend $\varphi$ by zero near the endpoints. Splitting the integral gives`,
    R`$$
\begin{aligned}
\int_{-1}^{1}|x|\varphi'(x)\,dx
&=\int_{-1}^{0}(-x)\varphi'(x)\,dx+\int_{0}^{1}x\varphi'(x)\,dx\\
&=[-x\varphi(x)]_{-1}^{0}+\int_{-1}^{0}\varphi(x)\,dx
  +[x\varphi(x)]_{0}^{1}-\int_{0}^{1}\varphi(x)\,dx\\
&=\int_{-1}^{0}\varphi(x)\,dx-\int_{0}^{1}\varphi(x)\,dx
=-\int_{-1}^{1}g(x)\varphi(x)\,dx.
\end{aligned}
$$`,
    R`This proves the identity for every test function, not just for a few choices. The value $g(0)$ changes no Lebesgue integral: weak derivatives are determined only up to equality almost everywhere. There is still no classical derivative of $u$ at $0$. In fact $u\in W^{1,p}((-1,1))$ for $1\le p\le\infty$, since $u$ and $g$ are bounded on this finite interval.`,
    R`If the endpoint terms were unclear, review compact support and integration by parts. If the “almost everywhere” qualification was unclear, review null sets before moving to Sobolev spaces. This calculation is an independently written example using Hunter’s definition; his Example 3.3 treats $x^+$, not $|x|$.`,
  ], [
    R`$u$ 和 $g$ 都局部可积。对每个 $\varphi\in C_c^\infty((-1,1))$，需要验证的恒等式是`,
    R`$$
\int_{-1}^{1}|x|\varphi'(x)\,dx=-\int_{-1}^{1}g(x)\varphi(x)\,dx.
$$`,
    R`把 $\varphi$ 在端点附近补成零。分开积分后得到`,
    R`$$
\begin{aligned}
\int_{-1}^{1}|x|\varphi'(x)\,dx
&=\int_{-1}^{0}(-x)\varphi'(x)\,dx+\int_{0}^{1}x\varphi'(x)\,dx\\
&=[-x\varphi(x)]_{-1}^{0}+\int_{-1}^{0}\varphi(x)\,dx
  +[x\varphi(x)]_{0}^{1}-\int_{0}^{1}\varphi(x)\,dx\\
&=\int_{-1}^{0}\varphi(x)\,dx-\int_{0}^{1}\varphi(x)\,dx
=-\int_{-1}^{1}g(x)\varphi(x)\,dx.
\end{aligned}
$$`,
    R`这里验证的是对所有测试函数都成立的恒等式，不是只检查几个函数。改变 $g(0)$ 不影响勒贝格积分：弱导数只在几乎处处相等的意义下唯一。$u$ 在 $0$ 处仍然没有通常意义的导数。事实上，对 $1\le p\le\infty$ 都有 $u\in W^{1,p}((-1,1))$，因为 $u$ 和 $g$ 在这个有限区间上都有界。`,
    R`如果不清楚端点项为什么消失，先复习紧支集与分部积分；如果不清楚“几乎处处”的含义，先补零测集，再继续读 Sobolev 空间。这是按 Hunter 的定义独立编写的例子；他的例3.3处理的是 $x^+$，不是 $|x|$。`,
  ]),
};

export const pilotSubjects = {
  'algebraic-geometry': {
    route: 'algebraic-geometry',
    title: both('Keep localization beside the geometry', '把局部化和几何放在一起看'),
    opening: both('The useful test here is not how many definitions you can repeat, but whether a fraction in a ring tells you where a function is defined. Keep one affine line in view while reading about sheaves.',
      '读到局部化和层时，先别急着往下赶。拿仿射直线反复算一遍：一个分式在哪个开集上有意义，两个局部表达式怎样才算相同？这些问题比记住定义更能检验是否读懂。'),
    reading: both([
      'Milne remains the starting text for the variety route: chapter 2, sections a–e and h–j, with chapter 4, sections a and d for tangent spaces. Use the existing chapter exercises rather than reading every preliminary chapter again.',
      'For the scheme continuation, use Vakil’s October 21, 2025 draft: §§2.1–2.4 for sheaves and stalks, §§3.2–3.5 for spectra and topology, then §§4.1–4.3 for the structure sheaf and schemes. The route introduction cites the November 18, 2017 early, out-of-date draft. These are different files: the 2025 section suggestions here do not replace or renumber that citation.',
    ], [
      '代数簇这条线仍从 Milne 开始：第2章 a—e、h—j 节，切空间读第4章 a、d 节。直接配合已有的章末习题，不必把每章预备知识都重新读一遍。',
      '继续读概形时，用 Vakil 的2025年10月21日稿：§§2.1—2.4 读层和茎，§§3.2—3.5 读谱及其拓扑，再读 §§4.1—4.3 的结构层和概形。路线原导读引用的是2017年11月18日的早期旧稿，两份文件不能混用章节号；这里的2025版选读并不替换原引用。',
    ]),
    example: both([
      R`Put $A=k[t]$, where $k$ is a field. The opens $D(t)$ and $D(1-t)$ cover $\operatorname{Spec}(A)$ because $(t,1-t)=A$. On their overlap, compare sections in $A_{t(1-t)}$, not by comparing the written denominators.`,
      R`The fractions $t^2/t$ on $D(t)$ and $(t-t^2)/(1-t)$ on $D(1-t)$ both restrict to $t$. The existing drawing and worked check make this calculation explicit. Try the check before opening its hint; then distinguish the existence of the glued section from its uniqueness.`,
    ], [
      R`令 $A=k[t]$，其中 $k$ 是域。因为 $(t,1-t)=A$，$D(t)$ 与 $D(1-t)$ 覆盖 $\operatorname{Spec}(A)$。比较重叠处的截面，要到 $A_{t(1-t)}$ 中比较，不能只看纸面上的分母是否一样。`,
      R`$D(t)$ 上的 $t^2/t$ 和 $D(1-t)$ 上的 $(t-t^2)/(1-t)$ 限制到重叠处都是 $t$。已有的图和例题具体做了这次计算。先自己尝试，再打开提示；读解答时，分清粘合截面的存在性与唯一性各用了什么。`,
    ]),
    skip: both('If the fractions and the cover argument are routine, skip this warm-up and work on stalks or the structure sheaf. If you can compute tangent spaces but cannot restrict a section, review localization and sheaf gluing first; solving the cusp check alone does not settle that gap.',
      '如果分式计算和开覆盖的论证都熟悉，可以跳过这个例子，继续读茎或结构层。如果会算切空间，却不知道截面怎样限制，先补局部化与层的粘合；会做尖点那道题并不能代替这部分基础。'),
    choice: both('Milne supplies concrete variety calculations; the selected Vakil sections explain the passage to schemes. They serve different gaps, so neither book is assigned cover to cover.',
      'Milne 用来练代数簇的具体计算，Vakil 的选读用来理解怎样走到概形。两者补的不是同一个缺口，这里不要求任何一本从头读到尾。'),
  },
  'differential-equations': {
    route: 'analysis-pde',
    title: both('From a calculated solution to a weak derivative', '从求解方程到弱导数'),
    opening: both('An explicit solution is a good place to start, but it does not explain what to do when a function has a corner. The absolute value function is enough to see why the definition of derivative changes in weak PDE methods.',
      '先会求解具体方程是必要的，但碰到有折角的函数，熟悉的求导规则就不够了。不妨从绝对值函数开始，看看 PDE 中为什么要换一种方式谈导数。'),
    reading: both([
      'Keep Lebl as the starting text: §§1.3–1.4 for first-order equations, §§3.3–3.4 and §3.8 for linear systems, then §§4.1–4.4 and §§4.6–4.7 for Fourier methods, heat and waves. Verify initial and boundary data as well as the equation. The existing exercise link has selected answers, not a complete public worked key.',
      'For this bridge, read Hunter §3.1, Definition 3.1, then §3.2, Example 3.3. It gives a short first encounter with weak derivatives. The existing Dyatlov comparison is the longer distribution-theory route; choose it when ready for test-function spaces and convolution. Teschl remains useful for ODE existence and uniqueness, not as a substitute for weak PDE methods.',
    ], [
      '起步仍用 Lebl：§§1.3—1.4 读一阶方程，§§3.3—3.4 和 §3.8 读线性系统，再读 §§4.1—4.4、§§4.6—4.7 的 Fourier 方法、热方程与波动方程。求出式子后，方程、初值、边界条件都要检查。原习题入口提供部分答案，并不是完整的公开详解。',
      '这一步先读 Hunter §3.1 的定义3.1，再看 §3.2 的例3.3，用较短的篇幅接触弱导数。原读物比较中的 Dyatlov 是更完整的分布论路线，准备好测试函数空间与卷积后再选它。Teschl 仍用来补 ODE 的存在唯一性，不能代替弱解这部分。',
    ]),
    example: both([
      R`On $(-1,1)$, $u(x)=|x|$ has a corner at $0$. Its classical derivative is $-1$ on the left and $1$ on the right. The weak derivative is represented by these same values, with the value at $0$ left arbitrary. The claim concerns integrals against every smooth compactly supported test function, not a rule to ignore every exceptional point in any argument.`,
      R`The two panels distinguish the graph of $u$ from a representative of its weak derivative. The holes at $0$ in the right panel leave that representative’s value unspecified; they do not leave a gap in the weak-derivative definition. Work through the check below before using $W^{1,p}$ notation.`,
    ], [
      R`在 $(-1,1)$ 上，$u(x)=|x|$ 在 $0$ 处有折角，通常导数在左边是 $-1$，右边是 $1$。弱导数也可以用这些值表示，$0$ 处任意赋值。这一结论说的是对所有光滑紧支集测试函数成立的积分恒等式，并不是说任何论证都能随意忽略例外点。`,
      R`两幅图分别画 $u$ 和它的弱导数的一个表示。右图在 $0$ 处留空，表示没有指定那一点的值，不是弱导数的定义漏了一点。使用 $W^{1,p}$ 记号前，先把下面这道题算清楚。`,
    ]),
    skip: both('Skip the integrating-factor warm-up only if you can verify the equation and initial value without the solution. Skip this weak-derivative example only if you can prove its test-function identity and explain the almost-everywhere qualification. Neither check replaces the measure and function-space preparation for a weak-solution course.',
      '能独立验证方程与初值，才跳过积分因子那道热身题；能证明测试函数恒等式并解释“几乎处处”，才跳过这里的弱导数例子。两道题都不能代替弱解课程需要的测度论和函数空间基础。'),
    choice: both('Lebl gives equations to calculate and verify. Hunter is a short bridge to Sobolev language, while Dyatlov develops the distribution framework. The point is to choose the next step, not to start three courses at once.',
      'Lebl 提供可以求解和验证的方程，Hunter 用来接入 Sobolev 空间的语言，Dyatlov 则展开分布论。按眼前缺少的内容选下一步，不必同时开三门课。'),
  },
  probability: {
    route: 'probability',
    title: both('Condition on a specified event', '先说清楚对哪个事件取条件'),
    opening: both('A conditioning formula is only useful after the sample space is fixed. Two fair tosses already separate three ideas that are easy to confuse: independent trials, independent events and disjoint events.',
      '条件概率的公式要放在确定的样本空间里才有用。两次公平抛币就能分清三个容易混淆的概念：试验独立、事件独立和事件互斥。'),
    reading: both([
      'Use the July 4, 2006 CHANCE version of Grinstead and Snell named in the course guide. Read §§4.1–4.2 for conditioning, then §§6.1–6.3 for expectation and variance. The practice source links odd-numbered answers; the instructor solution set is not a public complete key.',
      'When elementary conditioning is secure, use the existing Lawler comparison, §§1–3 and Exercise 4.1, to revisit probability spaces and independence. Add real analysis and measure theory before expecting conditional expectation to follow from finite ratios alone. The route introduction also cites a July 22, 2006 CHANCE file: check which edition you opened before using locators.',
    ], [
      '课程页用的是 Grinstead 与 Snell 的 CHANCE 2006年7月4日版。先读 §§4.1—4.2 的条件概率，再读 §§6.1—6.3 的期望与方差。习题来源页提供奇数题答案；给教师的整套解答并不是公开的完整答案册。',
      '初等条件概率熟悉后，可用原读物比较中的 Lawler §§1—3 及习题4.1，重新看概率空间和独立性。继续读条件期望前要补实分析与测度论，不能只靠有限样本空间里的比值公式。路线原导读还引用了2006年7月22日的 CHANCE 文件，使用章节位置前先确认打开的是哪一版。',
    ]),
    example: both([
      R`For two fair independent tosses, write $\Omega=\{HH,HT,TH,TT\}$ with mass $1/4$ on each ordered outcome. Let $A=\{HH,HT\}$ mean “first toss heads” and $B=\{HH,HT,TH\}$ mean “at least one heads.”`,
      R`Conditioning on $B$ leaves three outcomes, each with conditional mass $1/3$. Thus $\mathbb P(A\mid B)=2/3$, whereas $\mathbb P(B\mid A)=1$. The tosses are independent; $A$ and $B$ are not. Use the existing diagram and check for the intersection calculation rather than memorizing the answer $2/3$.`,
    ], [
      R`公平且独立地抛币两次，写出 $\Omega=\{HH,HT,TH,TT\}$，每个有序结果的概率都是 $1/4$。令 $A=\{HH,HT\}$ 表示“第一次是正面”，$B=\{HH,HT,TH\}$ 表示“至少一次是正面”。`,
      R`给定 $B$ 后剩下三个结果，条件概率各为 $1/3$。因此 $\mathbb P(A\mid B)=2/3$，而 $\mathbb P(B\mid A)=1$。两次抛币相互独立，但 $A$ 和 $B$ 不独立。对照已有的图和例题，把交集算清楚，不要只记住答案 $2/3$。`,
    ]),
    skip: both('If you can justify both conditional probabilities and distinguish dependence from disjointness, go on to the Bernoulli-average check. If the sample space is uncertain, review ordered outcomes first. Passing these finite checks does not replace the integration theory needed for measure-theoretic probability.',
      '能说明两个条件概率的来由，也分得清“不独立”与“互斥”，就继续做 Bernoulli 平均值那道题。样本空间还不清楚时，先补有序结果的计数。这些有限情形的题做通了，也不等于已经具备测度论概率需要的积分基础。'),
    choice: both('Grinstead and Snell lets you calculate before abstracting; Lawler is the change of language afterward. Keep the conditioning example as a reference when sigma-algebras enter, but do not assume the finite formula covers conditioning on a null event.',
      '先用 Grinstead 与 Snell 做具体计算，再用 Lawler 换到测度论的语言。读到 σ 代数时可以回看这个例子，但不要把有限情形的公式直接套到概率为零的条件事件上。'),
  },
};

// Stages refer to the existing goal-path records, not a new curriculum.
export const pilotRouteSteps = {
  'algebraic-geometry': [
    {stage: 2, title: both('Localization and gluing', '局部化与粘合'),
      text: both('Read the sheaf selection when principal localizations are usable. Try the overlap calculation before opening its hint; review the preparation node only if equality of fractions is unclear.',
        '会用主局部化后再读层的选读。先做重叠处的计算，再打开提示；分式相等的判定还不清楚时，回先修节点补这一点。'),
      links: ['scheme-reading', 'ag-gluing', 'ag-localization-review', 'ag-sheaf-review']},
    {stage: 3, title: both('Varieties, then the scheme continuation', '代数簇与概形选读'),
      text: both('Use the two-lines and cusp checks to decide whether Milne’s variety review is needed. The scheme selection uses the 2025 Vakil draft; the introduction’s 2017 draft remains a separate citation.',
        '用两条直线和尖点的题判断是否需要复习 Milne 的代数簇部分。概形选读用2025版 Vakil；原导读引用的2017旧稿仍保留，两份引用分开使用。'),
      links: ['primary-reading', 'ag-two-lines', 'ag-cusp', 'practice']},
  ],
  'analysis-pde': [
    {stage: 1, title: both('Check the elementary calculation', '先检查具体计算'),
      text: both('Try the existing initial-value problem and verify the answer by substitution. If the product rule or integration step is the obstacle, use the real-analysis preparation review selectively.',
        '先做已有的初值问题，把答案代回去验证。卡在乘积法则或积分步骤时，有针对性地回看分析基础，不必把整条路线重走一遍。'),
      links: ['pde-initial-value', 'primary-reading', 'practice', 'pde-analysis-review']},
    {stage: 2, title: both('Integration and function spaces', '积分与函数空间'),
      text: both('Before using almost-everywhere statements in PDE, check null sets, integrability and the role of test functions. Use the existing preparation nodes to identify a gap, not as compulsory courses to repeat.',
        '在 PDE 中使用几乎处处成立的结论前，先弄清零测集、可积性和测试函数的作用。用已有先修节点查缺口，不必把它们当成必须重修的课程。'),
      links: ['pde-measure-review', 'pde-functional-review']},
    {stage: 3, title: both('Work through one weak derivative', '完整算一次弱导数'),
      text: both('Read Hunter’s definition, prove the absolute-value identity with the hint closed, then compare the longer distribution route. Solving a heat equation by separation of variables alone does not establish this preparation.',
        '读 Hunter 的定义，先不看提示证明绝对值函数的恒等式，再考虑更完整的分布论路线。只会用分离变量法解热方程，还不能说明这部分准备已经够了。'),
      links: ['hunter', 'pde-weak-check', 'reading-comparison']},
  ],
  probability: [
    {stage: 1, title: both('Specify the finite model', '先写出有限模型'),
      text: both('Use the two-toss diagram and check. State the ordered sample space and which event is given before using a ratio. The hint and solution are already beside the original check.',
        '先看两次抛币的图并做例题。使用比值前，写出有序样本空间和给定事件。提示与解答就在原题旁边。'),
      links: ['prob-conditioning', 'prob-figure', 'primary-reading', 'practice']},
    {stage: 2, title: both('Add the integration language', '补上积分的语言'),
      text: both('If dominated convergence or almost-everywhere equality is unfamiliar, review those nodes before taking the measure-theoretic branch. A correct finite conditional probability is not a reason to skip them.',
        '如果控制收敛或几乎处处相等还不熟悉，先补相应节点，再走测度论概率这条线。有限条件概率算对了，并不是跳过它们的理由。'),
      links: ['prob-analysis-review', 'prob-measure-review', 'reading-comparison']},
    {stage: 3, title: both('Track the use of independence', '找出独立性用在哪一步'),
      text: both('In the Bernoulli-average solution, separate linearity of expectation from the variance calculation. Return to elementary conditioning only for a specific gap; do not treat that calculation as a definition of general conditional expectation.',
        '读 Bernoulli 平均值的解答时，把期望的线性性质与方差计算分开，指出哪里用了独立性。初等条件概率按需回看，不要把有限情形的计算当成一般条件期望的定义。'),
      links: ['prob-averages', 'prob-conditioning', 'check-learning']},
  ],
};
