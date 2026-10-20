---
title: "Honours Linear Algebra - Weeks 1-3 Review"
subtitle: "Week 4 / No lecture"
lang: en
---

## The same problem, three languages

$Ax=b$: equations / a combination of columns / a linear map $T(x)=Ax$.

**Basis = independent + spanning.** Existence of coordinates comes from spanning; uniqueness from independence. For $\dim V=n$, exactly $n$ vectors: either property implies both. Count matters.

**Rank--nullity.** $A\in M_{m\times n}(K)$, rank $r$:
$$
\dim\ker T=n-r,\qquad
T\text{ injective}\iff r=n,\qquad T\text{ onto}\iff r=m.
$$
For consistent $Ax=b$, all solutions are $x_p+\ker T$. A subspace only when $b=0$.

**Row reduction.** $R=EA$, $E$ invertible: same kernel, row space and column relations. For a column-space basis, use pivot columns of the **original** $A$.

## One matrix ties it together

$$
A=\begin{pmatrix}1&2&1\\0&0&1\end{pmatrix}
\sim R=\begin{pmatrix}1&2&0\\0&0&1\end{pmatrix}.
$$
Pivots $1,3$; $a_2=2a_1$. Thus
$$
\ker A=\operatorname{Span}\left\{\begin{pmatrix}-2\\1\\0\end{pmatrix}\right\},\qquad
\operatorname{Col}(A)=\operatorname{Span}\left\{\begin{pmatrix}1\\0\end{pmatrix},
\begin{pmatrix}1\\1\end{pmatrix}\right\}=\mathbb R^2.
$$
$T:\mathbb R^3\to\mathbb R^2$ is onto, not injective. Check $3=1+2$.
$$
Ax=\begin{pmatrix}3\\1\end{pmatrix}
\iff x=\begin{pmatrix}2\\0\\1\end{pmatrix}
+t\begin{pmatrix}-2\\1\\0\end{pmatrix},\quad t\in\mathbb R.
$$
The two columns in the image are basis vectors; the null vector is a relation among all three columns. Different roles.

## Direct sums; maps in coordinates

$V=U\oplus W$: every $v=u+w$ uniquely. Subtract two decompositions:
$$
u-u'=w'-w\in U\cap W=\{0\}.
\qquad \dim(U+W)=\dim U+\dim W-\dim(U\cap W).
$$
For three summands, pairwise zero intersections do **not** suffice: the $x$-axis, $y$-axis and $y=x$ in $\mathbb R^2$.

**Matrix columns are basis images:**
$$
[T]^\mathcal B_\mathcal C
=\bigl([T(b_1)]_\mathcal C\ \cdots\ [T(b_n)]_\mathcal C\bigr),\qquad
[T(v)]_\mathcal C=[T]^\mathcal B_\mathcal C[v]_\mathcal B.
$$
Composition: rightmost acts first. The intermediate coordinate basis must match.

**Keep the hypotheses.** Equal finite dimensions: injective $\iff$ onto. On $\mathbb R[t]$, differentiation is onto but kills constants. Also, $\dim_{\mathbb R}\mathbb C=2$ while $\dim_{\mathbb C}\mathbb C=1$: always fix the field.
