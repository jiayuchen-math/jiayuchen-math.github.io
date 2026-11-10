import {markdown} from './knowledge-markdown.mjs';

export const localizationLessonId = 'localization-in-practice';
export const localizationLessonTitles = {
 en: 'Mini-lesson · From localization to the structure sheaf',
 zh: '微课 · 从局部化到结构层',
};

const lessons = {
 en: {
  setup: String.raw`**Before you start.** You should be able to compute with quotient rings and recognize a prime ideal. If either step is unfamiliar, use the [commutative algebra preparation guide](/en/resources/library-paths/commutative-algebra.html).

Let $k$ be a field and $A=k[x,y]/(xy)$. Write $x,y$ also for their residue classes. Set $X=\operatorname{Spec}(A)$ and write $D(f)=\{\mathfrak p\in X:f\notin\mathfrak p\}$. Each standard open $D(f)$ has ring of sections $A_f$, obtained by making $f$ invertible.

**One worked calculation.** In $A_x$, the equation $xy=0$ gives $y=x^{-1}(xy)=0$. Thus $A_x\cong k[x,x^{-1}]$: the map sending $y$ to $0$ and $x$ to $x$ has inverse induced by the image of $x$ in $A_x$. The open $D(x)$ is the part of the $x$-axis away from the origin.`,
  task: String.raw`**Try it.** Compute $A_y$. Then decide whether the sections $1$ on $D(x)$ and $0$ on $D(y)$ glue on their union, and whether that glued section extends to $X$.`,
  hintLabel: 'A hint',
  hint: String.raw`Compute $D(x)\cap D(y)=D(xy)$. Which prime ideal lies outside both opens? Compare what a global polynomial would restrict to on the two axes.`,
  solutionLabel: 'Work through the solution',
  solution: String.raw`In $A_y$ the class $y$ is invertible, so $x=0$ and $A_y\cong k[y,y^{-1}]$. The overlap is $D(0)=\varnothing$. The two sections therefore glue uniquely on $D(x)\cup D(y)=X\setminus\{(x,y)\}$; the ideal $(x,y)$ is maximal since its quotient is $k$.

Suppose the glued section extended to $X$. A global section is represented by a polynomial $P(x,y)$. Its restrictions would give $P(x,0)=1$ in $k[x,x^{-1}]$ and $P(0,y)=0$ in $k[y,y^{-1}]$. The polynomial rings inject into their Laurent polynomial rings, so these equalities also hold as polynomial identities. Evaluating at the origin forces $P(0,0)$ to equal both $1$ and $0$. Hence no global extension exists.`,
  next: String.raw`**Ready to move on?** Explain where you used the sheaf axiom and where you used the polynomial description of global sections. If the calculation is the stumbling block, review [localization](/en/resources/encyclopedia/localization-commutative-ring/). If the gluing is the stumbling block, read [The Stacks Project, §26.5](https://stacks.math.columbia.edu/tag/01HR) and compare $D(f)$ with $A_f$.`,
 },
 zh: {
  setup: String.raw`**先修检查。** 先确认自己会在商环中计算，并能识别素理想。若其中一步还不熟悉，可先看[交换代数先修指南](/en/resources/library-paths/commutative-algebra.html)。

设 $k$ 为域，$A=k[x,y]/(xy)$，仍以 $x,y$ 表示它们的剩余类。记 $X=\operatorname{Spec}(A)$，令 $D(f)=\{\mathfrak p\in X:f\notin\mathfrak p\}$。基本开集 $D(f)$（standard open）上的截面环是 $A_f$，它由把 $f$ 变成可逆元得到。

**先算一个例子。** 在 $A_x$ 中，$xy=0$ 给出 $y=x^{-1}(xy)=0$，所以 $A_x\cong k[x,x^{-1}]$。把 $y$ 送到 $0$、把 $x$ 送到 $x$ 所得的映射，其逆由 $x$ 在 $A_x$ 中的像诱导。开集 $D(x)$ 就是 $x$ 轴去掉原点的部分。`,
  task: String.raw`**动手检查。** 算出 $A_y$。判断 $D(x)$ 上的截面 $1$ 和 $D(y)$ 上的截面 $0$ 能否粘合到两者的并集上，再判断粘合后的截面能否延拓到 $X$。`,
  hintLabel: '展开提示',
  hint: String.raw`先算 $D(x)\cap D(y)=D(xy)$。哪个素理想同时落在两个开集之外？再比较同一个整体多项式在两条轴上的限制。`,
  solutionLabel: '展开参考解',
  solution: String.raw`在 $A_y$ 中，$y$ 可逆，因此 $x=0$，且 $A_y\cong k[y,y^{-1}]$。交集为 $D(0)=\varnothing$，所以两个截面唯一粘合到 $D(x)\cup D(y)=X\setminus\{(x,y)\}$ 上。这里 $(x,y)$ 是极大理想，因为它的商是 $k$。

若所得截面能延拓到 $X$，则该整体截面可由多项式 $P(x,y)$ 表示。其限制给出 $P(x,0)=1$ 在 $k[x,x^{-1}]$ 中成立，而 $P(0,y)=0$ 在 $k[y,y^{-1}]$ 中成立。多项式环单射到相应的 Laurent 多项式环，所以这两式也是多项式恒等式。在原点代值会使 $P(0,0)$ 同时等于 $1$ 和 $0$，故整体延拓不存在。`,
  next: String.raw`**学到什么程度可以继续？** 试着说清楚哪一步用了层公理，哪一步用了整体截面的多项式描述。若卡在计算，回看[交换环的局部化](/en/resources/encyclopedia/localization-commutative-ring/)；若卡在粘合，接着读 [The Stacks Project 第 26.5 节](https://stacks.math.columbia.edu/tag/01HR)，对照 $D(f)$ 与 $A_f$。`,
 },
};

export function renderLocalizationLesson(locale) {
 const lesson = lessons[locale];
 const title = localizationLessonTitles[locale];
 return `<section class="goal-card route-lesson" id="${localizationLessonId}" aria-labelledby="${localizationLessonId}-title">
 <h3 id="${localizationLessonId}-title">${title}</h3>
 ${markdown.render(lesson.setup)}
 ${markdown.render(lesson.task)}
 <details data-portal-disclosure><summary>${lesson.hintLabel}</summary>${markdown.render(lesson.hint)}</details>
 <details data-portal-disclosure><summary>${lesson.solutionLabel}</summary>${markdown.render(lesson.solution)}</details>
 ${markdown.render(lesson.next)}
 </section>`;
}
