---
title: "Mathematical Analysis - Week 5"
subtitle: "Lecture 16: Integrable and non-integrable functions"
lang: en
---

## Two ways integrability can fail

**Proposition 2.1.2.** Riemann integrable on a bounded interval of positive length $\Rightarrow$ bounded.

Proof idea: if $f$ is unbounded, some cell $I_k$ of any finite partition has unbounded $f$. Fix all other tags; their sum is $A$. For any $T>0$, choose $c_k$ with
$$
|f(c_k)|\Delta x_k>T+|A|\quad\Rightarrow\quad |S(f,P,\mathbf c)|>T.
$$
This works even for arbitrarily small mesh. No finite common limit.

**Ex.2.1.2.** $1/x$ and $1/x^2$ on $(0,1)$: unbounded, hence not Riemann integrable. For $1/x$, just take $0<c_1<\min\{x_1,\Delta x_1/T\}$; the first term alone exceeds $T$.

**Ex.2.1.3.** $D=1_{\mathbb Q}$ is bounded, but on $[a,b]$, $a<b$,
$$
S(D,P,\mathbf c)=
\begin{cases}b-a,&\text{all tags rational},\\0,&\text{all tags irrational}.\end{cases}
$$
Both choices work for every mesh. Boundedness alone is not enough.

## Upper and lower sums

For bounded $f$ on $[a,b]$, write $I_k=[x_{k-1},x_k]$ and
$$
\begin{aligned}
M_k&=\sup_{I_k}f,&m_k&=\inf_{I_k}f,&\omega_k&=M_k-m_k,\\
U(P)&=\sum_kM_k\Delta x_k,&L(P)&=\sum_km_k\Delta x_k,\\[-2pt]
\Delta(P)&=U(P)-L(P)=\sum_k\omega_k\Delta x_k.
\end{aligned}
$$
Always $L(P)\le S(f,P,\mathbf c)\le U(P)$. Use $\sup,\inf$; extrema need not be attained.

Refining $P$ to $Q$ gives $L(P)\le L(Q)\le U(Q)\le U(P)$. Define
$$
\underline J=\sup_P L(P),\qquad \overline J=\inf_P U(P).
$$
**Theorems 2.1.3--5.** For bounded $f$ on $[a,b]$, the following are equivalent:
$$
\begin{aligned}
f\text{ integrable}
&\iff \underline J=\overline J\\
&\iff \Delta(P)\to0\quad(\|P\|\to0)\\
&\iff \forall\varepsilon>0\ \exists P:\ \Delta(P)<\varepsilon.
\end{aligned}
$$
Last criterion: only need to construct **one good partition** for each $\varepsilon$.
Indeed $0\le\overline J-\underline J\le U(P)-L(P)<\varepsilon$.

\newpage

**Corollary.** For bounded $f$, non-integrability $\iff\exists\varepsilon_0>0\ \forall P:\Delta(P)\ge\varepsilon_0$.

Examples: $\Delta(D,P)=b-a$. For $f(x)=x^2$ on $[0,b]$,
$$
\Delta(P)=\sum_k(x_k+x_{k-1})(\Delta x_k)^2
\le2b^2\|P\|\to0.
$$

## Uniform continuity

**Definition 2.1.6.** $f$ is uniformly continuous on $E$ if
$$
\forall\varepsilon>0\ \exists\delta>0\ \forall x,y\in E:
\quad |x-y|<\delta\ \Rightarrow\ |f(x)-f(y)|<\varepsilon.
$$
Same $\delta$ everywhere. Ordinary continuity allows $\delta$ to depend on the base point.

To disprove it: find $x_n,y_n$ with $|x_n-y_n|\to0$ but a fixed positive output gap.
$$
\begin{array}{c|c|c|c}
f\text{ on }E&x_n&y_n&|f(x_n)-f(y_n)|\\\hline
1/x\text{ on }(0,1]&1/n&1/(n+1)&1\\[4pt]
x^2\text{ on }[1,\infty)&n&n+1/n&2+1/n^2\\[4pt]
\sin(1/x)\text{ on }(0,\pi)&1/(2\pi n)&1/(2\pi n+\pi/2)&1
\end{array}
$$
All three are continuous on their domains, none uniformly continuous.

**Lemma 2.1.7.** Continuous on $[a,b]$ $\Rightarrow$ uniformly continuous.

Proof (subsequence trick). Otherwise, for some $\varepsilon_0>0$ choose
$$
|x_n-y_n|<1/n,\qquad |f(x_n)-f(y_n)|\ge\varepsilon_0.
$$
Compactness gives $x_{n_j}\to c\in[a,b]$; then also $y_{n_j}\to c$. Continuity gives
$$
|f(x_{n_j})-f(y_{n_j})|
\le |f(x_{n_j})-f(c)|+|f(y_{n_j})-f(c)|\to0.
$$
Contradiction. Closedness keeps $c$ in the domain; boundedness gives the subsequence.

## From continuity to integrability

**Theorem 2.1.8, continuous case.** $f\in C[a,b]\Rightarrow f$ is Riemann integrable.

Proof: uniform continuity gives $\delta>0$ such that
$$
|x-y|<\delta\ \Rightarrow\ |f(x)-f(y)|<\frac{\varepsilon}{b-a}.
$$
If $\|P\|<\delta$, the maximum and minimum on each cell differ by less than $\varepsilon/(b-a)$. Hence
$$
\Delta(P)=\sum_k\omega_k\Delta x_k
<\frac{\varepsilon}{b-a}\sum_k\Delta x_k=\varepsilon.
$$
The interval matters: continuous on $(0,1]$ need not even be bounded ($1/x$).

\newpage

## Small intervals around the bad points

**Theorem 2.1.8, finite discontinuities.** Bounded on $[a,b]$ + finitely many discontinuities $\Rightarrow$ integrable.

Proof / **Ex.2.1.8(a)**: let $|f|\le M$, $M>0$. Cover the bad points by finitely many intervals of total length $\ell<\varepsilon/(4M)$; choose their other endpoints at continuity points. The remaining closed intervals have continuous $f$.

Partition the good pieces finely enough that their total oscillation sum is $<\varepsilon/2$. Include all covering endpoints in $P$. Then
$$
\Delta(P)=\Delta_{\rm good}+\Delta_{\rm bad}
<\frac{\varepsilon}{2}+2M\ell<\varepsilon.
$$
One good partition suffices. No need to control every fine partition again.

**Ex.2.1.4.** $f(x)=\sin(1/x)$ for $x>0$, $f(0)=0$: bounded, only discontinuous at $0$, so integrable on $[0,1]$. Fast oscillation near one point can be confined to a short interval.

**Ex.2.1.5(a): restriction.** If $f$ is integrable on $[a,b]$, it is integrable on each $[u,v]\subseteq[a,b]$. Add $u,v$ to a partition with small $\Delta$; refinement decreases $\Delta$, and the sum over $[u,v]$ is no larger than the whole sum.

**Ex.2.1.5(b,c): finite changes.** Changing finitely many values preserves integrability and the integral. For $m$ changed points, let $K=\max|f-g|$ there. Each point belongs to at most two cells, so for the same tags,
$$
|S(f,P,\mathbf c)-S(g,P,\mathbf c)|\le2mK\|P\|\to0.
$$
In particular, bounded functions have the same integrability on $[a,b]$ and $(a,b)$ in the lecture's endpoint convention. Endpoint values do not affect the integral. Thus $\sin(1/x)$ is also integrable on $(0,1]$.

**Ex.2.1.6(a).** Bounded $f$, continuous except possibly at $\{a_n\}$ with $a_n\to c$: still integrable.

Idea: one short interval around $c$ contains the whole tail. Only finitely many exceptional points remain outside; cover those too. Make the total covered length $<\varepsilon/(4M)$ and use the same good/bad estimate.

**Ex.2.1.6(b).**
$$
f(x)=\operatorname{sgn}\!\left(\sin\frac{\pi}{x}\right)\quad(0<x\le1),
\qquad f(0)=0.
$$
Bounded by $1$; continuous between consecutive $1/n$. Possible discontinuities: $1/n$ and $0$, with only one accumulation point. Apply (a). Infinitely many discontinuities can still be allowed.

\newpage

## The Riemann function

**Ex.2.1.7.** Recall
$$
\zeta(x)=\begin{cases}
1/q,&x=p/q\text{ in lowest terms},\ q>0,\\
0,&x\notin\mathbb Q.
\end{cases}
\qquad 0\le\zeta\le1.
$$
Claim: $\displaystyle\int_a^b\zeta(x)\,dx=0$ for every $a<b$.

Key observation: for any $\eta>0$, only finitely many points in $[a,b]$ have $\zeta(x)\ge\eta$. Indeed $q\le1/\eta$, and then only finitely many numerators $p$ are possible.

Take $\eta=\varepsilon/[2(b-a)]$ and let $N$ be the number of these points. In any partition, at most $2N$ cells contain one of them. On the other cells, $\sup\zeta\le\eta$. Thus
$$
0=L(P)\le U(P)
\le 2N\|P\|+\eta(b-a)<\varepsilon
\quad\text{if }\|P\|<\frac{\varepsilon}{4\max\{N,1\}}.
$$
$L(P)=0$ because every cell contains irrationals. All tagged sums are squeezed to $0$.

**Ex.2.1.8(b): one-partition version.** Cover the same finite set by intervals of total length $<\varepsilon/2$, with irrational interior covering endpoints. Use these endpoints to form $P$. On the covered cells use $\omega\le1$; on the rest use $\omega\le\eta$. Then
$$
\Delta(P)<1\cdot\frac{\varepsilon}{2}+\eta(b-a)=\varepsilon.
$$
The important set here is where the values are **large**, rather than all rational points.

## What to estimate

$$
\begin{array}{l|l}
\text{Continuous on }[a,b]&\text{uniformly small cell oscillation}\\[3pt]
\text{Finitely many bad points / one convergent sequence}
&\text{small total length around bad points}\\[3pt]
\text{Riemann function }\zeta&\text{finitely many large values}
\end{array}
$$

$D$ versus $\zeta$: both are nonzero on the rationals. For $D$, every cell has oscillation $1$; for $\zeta$, the large spikes can be covered cheaply. The quantity to control is always
$$
\boxed{\Delta(P)=\sum_k(\sup_{I_k}f-\inf_{I_k}f)\,\Delta x_k.}
$$
