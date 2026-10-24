---
title: "Calculus - Week 1"
subtitle: "Limits and continuity · Lectures 1–4"
lang: en
---

The first question is not how to substitute a number into a formula, but what the values of the formula do near that number. A function can have a limit at a point even when its value there is missing or different. We start with that distinction, make it precise, and then use it to study continuity.

# Preliminary

- $\mathbb{N}$ denotes the set of all positive integers.

- $\mathbb{Z}$ denotes the set of all integers.

- $\mathbb{Q}$ denotes the set of all rational numbers.

- $\mathbb{R}$ denotes the set of all real numbers.

# Lecture 1: approaching a point

## 1. Key idea

> We use limits to describe the tendency of a function as the variable approaches a given point, but not the value at the point.

## 2. Important examples

### Example 1: Same limit, different value at the point

$$
f(x)=
\begin{cases}
x^2\sin\dfrac{1}{x},&x\ne0,\\
0,&x=0,
\end{cases}
$$

![](image.png){width=65%}

$$
g(x)=
\begin{cases}
x\sin\dfrac{1}{x},&x\ne0,\\
1,&x=0.
\end{cases}
$$

![](image-1.png){width=65%}

For $x\ne0$, the useful estimates are

$$
|f(x)|\le |x|^2,\qquad |g(x)|\le |x|.
$$

Therefore:

$$
\lim_{x\to0}f(x)=0,\qquad
\lim_{x\to0}g(x)=0.
$$

My takeaway:

> If $x$ gets close to 0, keeping $x\ne0$, $f(x)$ approaches 0 with error $\leq |x|^2$; $g(x)$ approaches 0 with error $\leq |x|$.

### Example 2: average velocity and instantaneous velocity

**Average velocity:**

$$
\frac{\Delta s}{\Delta t}
=\frac{f(t_2)-f(t_1)}{t_2-t_1}.
$$

With $h=t_2-t_1$:

$$
\frac{f(t_1+h)-f(t_1)}{h}.
$$

**Instantaneous velocity at $t_0$:**

$$
v(t_0)=\lim_{h\to0}\frac{f(t_0+h)-f(t_0)}{h}
=\lim_{t\to t_0}\frac{f(t)-f(t_0)}{t-t_0}.
$$

## Informal definition of limit

> Assume $f(x)$ is defined on an open interval about $c$, except possibly at $c$ itself. If $f(x)$ is arbitrarily close to $L$ for all $x$ sufficiently close to $c$ other than $c$ itself, then

$$
\lim_{x\to c}f(x)=L.
$$

This is read "the limit of $f(x)$ as $x$ approaches $c$ is $L$."

## 3. Limit calculation techniques

### Algebraic simplification

$$
\lim_{x\to1}\frac{x^2-1}{x-1}
=\lim_{x\to1}(x+1)
=2.
$$

### Rationalizing the denominator

$$
\lim_{x\to1}\frac{\sqrt{x}-1}{x-1}
=\lim_{x\to1}\frac{1}{\sqrt{x}+1}
=\frac12.
$$

**Remark:** Simplification when calculating limits.

**General strategy:**

1.  Check direct substitution.

2.  Factor or rationalize if necessary.

3.  Simplify, then evaluate the limit.

## Class 2: Describing the behavior of a function as $x\to0$

**1. Jump**

![](image-2.png){width=65%}

**2. Unbounded**

![](image-3.png){width=65%}

**3. Oscillation**

![](image-4.png){width=65%}

## 4. When a limit does not exist

| Type | Behavior near the point | Example |
| --- | --- | --- |
| Jump | Different left and right limits | Unit step function |
| Unbounded | Values grow without bound | $1/x$ near zero |
| Oscillation | No single limiting value | $\sin(1/x)$ near zero |

# Lecture 2: the definition and how to use it

## Definition of limit (Informal)

$$
g(x)=
\begin{cases}
2x, & \text{if } x\ne4,\\
0, & \text{if } x=4.
\end{cases}
$$

By the informal description of a limit: if $x$ gets sufficiently close to $4$, but is not equal to $4$, then $g(x)$ gets arbitrarily close to $8$.

We need to show that the gap between $g(x)$ and $L=8$, namely $|g(x)-8|$, can be made as small as we choose if $x$ is kept close enough to $c=4$, but is not equal to $4$.

## Definition

Let $f(x)$ be defined on an open interval $I$ about $c$, except possibly at $c$ itself. We say that the limit of $f(x)$ as $x$ approaches $c$ is the number $L$, and write

$$
\lim_{x\to c}f(x)=L,
$$

if, for every $\varepsilon>0$, there exists a corresponding $\delta>0$ such that

$$
|f(x)-L|<\varepsilon
\quad\text{whenever }x\in I\text{ and }0<|x-c|<\delta.
$$

## Simpler writing

We say $\lim_{x\to c}f(x)=L$ if, for any $\varepsilon>0$, there exists $\delta>0$ such that

$$
\text{if }x\in I,\quad 0<|x-c|<\delta,
\quad\text{then }|f(x)-L|<\varepsilon.
$$

## Personal interpretation

- $\varepsilon$: how close we require $f(x)$ to be to $L$.

- $\delta$: how close $x$ needs to be to $c$ in order to satisfy that requirement.

- $|f(x)-L|<\varepsilon$: $f(x)$ lies within an $\varepsilon$-neighborhood of $L$.

- $0<|x-c|<\delta$: $x$ lies within a $\delta$-neighborhood of $c$, but $x\ne c$.

The key idea is

$$
\boxed{\text{Given any }\varepsilon>0,\text{ we can find a }\delta>0}
$$

such that

$$
x\text{ is sufficiently close to }c
\quad\Longrightarrow\quad
f(x)\text{ is within }\varepsilon\text{ of }L.
$$

In other words, $\varepsilon$ is the required accuracy for the output, while $\delta$ is how much accuracy we need for the input.

Thus, the $\varepsilon$-$\delta$ definition gives a precise mathematical meaning to the intuitive statement: if $x$ is sufficiently close to $c$, then $f(x)$ is sufficiently close to $L$.

## Useful remarks

The order of the quantifiers matters. The number $\delta$ may depend on $\varepsilon$, on the function, and on the point $c$, but not on the particular $x$ that will later be chosen. We need one radius that works for every point in the punctured interval. Making $\delta$ smaller never spoils a valid choice.

The condition $0<|x-c|$ deliberately excludes $c$. Continuity will put the value at $c$ back into the discussion.

We shall often use the following arguments:

1.  Let $a$ be a real number. If, for every $\varepsilon>0$, we have $a\leq\varepsilon$, then $a\leq0$.

2.  Let $a$ be a real number. If, for every $\varepsilon>0$, we have

$$
-\varepsilon\leq a\leq\varepsilon,
$$

then $a=0$.

## Example: revisiting $g(x)$

Consider

$$
g(x)=
\begin{cases}
2x, & \text{if }x\ne4,\\
0, & \text{if }x=4.
\end{cases}
$$

Show that

$$
\lim_{x\to4}g(x)=8.
$$

**Analysis.** For every $\varepsilon>0$, we need

$$
|g(x)-8|=|2x-8|<\varepsilon,
\qquad x\ne4,
$$

which requires

$$
0<|x-4|<\frac{\varepsilon}{2}.
$$

**Proof.** Given arbitrary $\varepsilon>0$, take

$$
\delta=\frac{\varepsilon}{2}.
$$

Then

$$
|g(x)-8|=|2x-8|=2|x-4|<2\delta=\varepsilon
$$

whenever $0<|x-4|<\delta$. By the definition of limit,

$$
\lim_{x\to4}g(x)=8.
$$

## Exercise

Prove that

$$
\lim_{x\to1}\frac{1}{x}=1.
$$

**Hint.** Restrict $x$ by taking $x>\frac12$. Then

$$
\left|\frac{1}{x}-1\right|=\frac{|x-1|}{|x|}<2|x-1|.
$$

**Solution.** Given $\varepsilon>0$, choose $\delta=\min\{1/2,\varepsilon/2\}$. If $0<|x-1|<\delta$, then $x>1/2$ and the displayed estimate is less than $\varepsilon$. The first restriction keeps the denominator away from zero; the second controls the error.

## Exercise 1.1.5 revisited

Using the definition of limit, prove that the following functions have no limit as $x\to0$.

### (a)

$$
U(x)=
\begin{cases}
0, & x<0,\\
1, & x\geq0.
\end{cases}
$$

### (b)

$$
g(x)=
\begin{cases}
\dfrac{1}{x}, & x\ne0,\\
0, & x=0.
\end{cases}
$$

### (c)

$$
f(x)=
\begin{cases}
0, & x\leq0,\\
\sin\dfrac{1}{x}, & x>0.
\end{cases}
$$

**Tip.** Suppose the limit exists and derive a contradiction.

### For (b)

Suppose

$$
\lim_{x\to0}\frac{1}{x}=L.
$$

Use the definition with $\varepsilon_0=1$. It would give a radius $\delta>0$ on which $|1/x-L|<1$. Choose

$$
0<x<\min\{\delta,1/(|L|+2)\}.
$$

Then $1/x>|L|+2$, so $|1/x-L|\ge 1/x-|L|>2$, a contradiction.

**Solutions to (a) and (c).** For the step function, points on the two sides have values $0$ and $1$. If a limit $L$ existed, choose $\varepsilon=1/3$ and a common radius. These two values would satisfy $1\le |1-L|+|L|<2/3$, which is impossible.

For (c), positive points $x_n=(\pi/2+2n\pi)^{-1}$ and $y_n=(3\pi/2+2n\pi)^{-1}$ approach zero and give values $1$ and $-1$. A proposed limit would have to be within $1/2$ of both values for all sufficiently large $n$, again impossible. These sequences are a convenient way to choose points in every sufficiently small neighborhood; a formal sequence criterion comes in Week 2.

# Lecture 3: limit laws and one-sided limits

**Date:** 2026.9.10

## Theorem 1.1.3 (Limit Laws)

Assume that

$$
\lim_{x\to c}f(x)=L
\qquad\text{and}\qquad
\lim_{x\to c}g(x)=M.
$$

### (a) Sum Rule

$$
\lim_{x\to c}\bigl(f(x)+g(x)\bigr)
=\lim_{x\to c}f(x)+\lim_{x\to c}g(x).
$$

**Proof.** Let $\varepsilon>0$. Choose $\delta_1,\delta_2>0$ so that $|f(x)-L|<\varepsilon/2$ and $|g(x)-M|<\varepsilon/2$. For $\delta=\min\{\delta_1,\delta_2\}$,

$$
|(f(x)+g(x))-(L+M)|\le |f(x)-L|+|g(x)-M|<\varepsilon.
$$

### (b) Product Rule

$$
\lim_{x\to c}\bigl(f(x)\cdot g(x)\bigr)
=\lim_{x\to c}f(x)\cdot\lim_{x\to c}g(x).
$$

**Proof.** Since $f(x)\to L$, it is bounded near $c$; take a neighborhood where $|f(x)|\le |L|+1$. Then

$$
|f(x)g(x)-LM|\le |f(x)||g(x)-M|+|M||f(x)-L|,
$$

For an explicit choice, first restrict to $|f(x)-L|<1$. Also impose

$$
|g(x)-M|<\frac{\varepsilon}{2(|L|+1)},
\qquad |f(x)-L|<\frac{\varepsilon}{2(|M|+1)}.
$$

Take the minimum of the three radii. The two terms in the estimate are then respectively less than $\varepsilon/2$ and at most $\varepsilon/2$. This also covers $L=0$ or $M=0$, without division by either number.

### (c) Quotient Rule

If $M\ne0$, then

$$
\lim_{x\to c}\frac{f(x)}{g(x)}
=\frac{\displaystyle\lim_{x\to c}f(x)}
{\displaystyle\lim_{x\to c}g(x)}.
$$

**Proof.** Since $g(x)\to M\ne0$, eventually $|g(x)|>|M|/2$. Hence

$$
\left|\frac1{g(x)}-\frac1M\right|
=\frac{|g(x)-M|}{|g(x)||M|}
\le \frac{2|g(x)-M|}{|M|^2}\to0.
$$

Thus $1/g(x)\to1/M$, and the quotient rule follows from the product rule.

## Remark: Does the Converse Hold?

The Sum Rule requires that both limits on the right-hand side exist. In general, the converse is false: the existence of

$$
\lim_{x\to c}(f(x)+g(x))
$$

does not imply that both $\lim_{x\to c}f(x)$ and $\lim_{x\to c}g(x)$ exist.

### Counterexample

Let

$$
f(x)=\sin\frac{1}{x},
\qquad
g(x)=-\sin\frac{1}{x}.
$$

Consider $x\to0$. Although

$$
\lim_{x\to0}\sin\frac{1}{x}
$$

does not exist, we have

$$
f(x)+g(x)=0.
$$

Therefore,

$$
\lim_{x\to0}(f(x)+g(x))=0
$$

exists. Thus,

$$
\boxed{
\lim(f+g)\text{ exists}
\not\Longrightarrow
\lim f,\lim g\text{ both exist}
}
$$

The problematic behavior of two functions can cancel each other out.

## Exercise 1.1.9 (Limits of Polynomials)

If

$$
P(x)=\sum_{k=0}^{n}a_kx^k
=a_nx^n+a_{n-1}x^{n-1}+\cdots+a_0,
$$

then

$$
\lim_{x\to c}P(x)
=\sum_{k=0}^{n}a_kc^k
=P(c).
$$

## Exercise 1.1.10 (Limits of Rational Functions)

If $P(x)$ and $Q(x)$ are polynomials and $Q(c)\ne0$, then

$$
\lim_{x\to c}\frac{P(x)}{Q(x)}=\frac{P(c)}{Q(c)}.
$$

## Theorem 1.1.4 (The Sandwich Theorem)

Suppose that

$$
g(x)\leq f(x)\leq h(x)
$$

for all $x$ in some open interval containing $c$, except possibly at $x=c$. Suppose also that

$$
\lim_{x\to c}g(x)=\lim_{x\to c}h(x)=L.
$$

Then

$$
\lim_{x\to c}f(x)=L.
$$

**Proof.** Given $\varepsilon>0$, choose $\delta>0$ so that $L-\varepsilon<g(x)$ and $h(x)<L+\varepsilon$ whenever $0<|x-c|<\delta$. The inequalities $g(x)\le f(x)\le h(x)$ then imply $|f(x)-L|<\varepsilon$.

![](image-5.png){width=65%}

## Exercise 1.1.12

Assume $I$ is an open interval, $c\in I$, and

$$
f(x)\leq b
\qquad\text{for all }x\in I\setminus\{c\}.
$$

Then

$$
\lim_{x\to c}f(x)\leq b,
$$

provided the limit exists.

**Proof.** Write $L=\lim_{x\to c}f(x)$. If $L>b$, take $\varepsilon=(L-b)/2$. Near $c$ the definition gives $f(x)>L-\varepsilon=(L+b)/2>b$, contradicting the assumed upper bound.

## Exercise 1.1.13 (Order-preserving Property of Limits)

If

$$
f(x)\leq g(x)
$$

for all $x$ in some open interval containing $c$, except possibly at $x=c$, and both limits exist, then

$$
\lim_{x\to c}f(x)\leq\lim_{x\to c}g(x).
$$

Limits preserve the non-strict inequality $\leq$, but may not preserve the strict inequality $<$. For example, let

$$
f(x)=x^2,
\qquad g(x)=2x^2.
$$

For $x\ne0$, $f(x)<g(x)$, but

$$
\lim_{x\to0}x^2=\lim_{x\to0}2x^2=0.
$$

## Lemma 1.1.5

For $\theta$ measured in radians,

$$
-|\theta|\leq\sin\theta\leq|\theta|,
\qquad
-|\theta|\leq1-\cos\theta\leq|\theta|.
$$

In particular, for $0<\theta\leq\dfrac{\pi}{2}$,

$$
0<\sin\theta<\theta.
$$

**Geometric proof.** For $0<\theta<\pi/2$, take $A=(1,0)$ and $P=(\cos\theta,\sin\theta)$ on the unit circle. The chord $AP$ is shorter than the arc of length $\theta$. Therefore

$$
\sin^2\theta+(1-\cos\theta)^2=|AP|^2<\theta^2.
$$

Each nonnegative term gives $|\sin\theta|<\theta$ and $1-\cos\theta<\theta$ in this range. At $\theta=\pi/2$ the claimed inequalities also hold. Symmetry handles negative angles. For $|\theta|\ge\pi/2$, use $|\sin\theta|\le1\le|\theta|$ and $1-\cos\theta=2\sin^2(\theta/2)\le 2|\sin(\theta/2)|\le |\theta|$; the last sine bound is already established globally.

This argument precedes differentiation. Using the mean value theorem here would reverse the logical order: the derivatives of sine and cosine will themselves use the trigonometric limit below.

![](image-7.png){width=65%}

## One-sided Limits

### Left-hand limit

$$
\lim_{x\to c^-}f(x)=L
$$

if, for every $\varepsilon>0$, there exists $\delta>0$ such that

$$
c-\delta<x<c
\quad\Longrightarrow\quad
|f(x)-L|<\varepsilon.
$$

### Right-hand limit

$$
\lim_{x\to c^+}f(x)=L
$$

if, for every $\varepsilon>0$, there exists $\delta>0$ such that

$$
c<x<c+\delta
\quad\Longrightarrow\quad
|f(x)-L|<\varepsilon.
$$

The two-sided limit exists if and only if the one-sided limits both exist and are equal:

$$
\lim_{x\to c}f(x)=L
\quad\Longleftrightarrow\quad
\lim_{x\to c^-}f(x)=\lim_{x\to c^+}f(x)=L.
$$

### Examples at $x\to0$

#### Example 1: The $0$-$1$ step function.

$$
U(x)=
\begin{cases}
0, & x<0,\\
1, & x\geq0.
\end{cases}
$$

Then

$$
\lim_{x\to0^-}U(x)=0,
\qquad
\lim_{x\to0^+}U(x)=1,
$$

so the two-sided limit does not exist.

#### Example 2: The function $1/x$.

$$
\lim_{x\to0^-}\frac{1}{x}=-\infty,
\qquad
\lim_{x\to0^+}\frac{1}{x}=+\infty.
$$

Thus, $1/x$ has no finite two-sided limit at $0$.

#### Example 3: The oscillating function $\sin(1/x)$.

$$
\lim_{x\to0^-}\sin\frac{1}{x}
\quad\text{and}\quad
\lim_{x\to0^+}\sin\frac{1}{x}
$$

both do not exist.

#### The density of $\mathbb{Q}$ in $\mathbb{R}$.

We say that $\mathbb{Q}$ is dense in $\mathbb{R}$ if every non-empty open interval contains a rational number. For any $a,b\in\mathbb{R}$ with $a<b$, there exists $q\in\mathbb{Q}$ such that

$$
a<q<b.
$$

Equivalently, for every $x\in\mathbb{R}$ and every $\varepsilon>0$, there exists $q\in\mathbb{Q}$ such that

$$
|q-x|<\varepsilon.
$$

The irrational numbers are also dense in $\mathbb{R}$.

#### Example 4: The Dirichlet function.

$$
D(x)=
\begin{cases}
1, & x\in\mathbb{Q},\\
0, & x\in\mathbb{R}\setminus\mathbb{Q}.
\end{cases}
$$

Every interval to the left or right of $0$ contains both rational and irrational numbers. Hence,

$$
\lim_{x\to0^-}D(x)
\quad\text{and}\quad
\lim_{x\to0^+}D(x)
$$

both do not exist.

## Theorem 1.1.6

Suppose that $f(x)$ is defined on an open interval containing $c$, except possibly at $c$ itself. Then $f(x)$ has a limit as $x$ approaches $c$ if and only if its left-hand and right-hand limits both exist and are equal:

$$
\lim_{x\to c}f(x)=L
\quad\Longleftrightarrow\quad
\lim_{x\to c^-}f(x)=\lim_{x\to c^+}f(x)=L.
$$

### Proof

If $\lim_{x\to c}f(x)=L$, the $\varepsilon$-$\delta$ condition immediately implies the same estimate for $x<c$ and for $x>c$. Therefore both one-sided limits equal $L$.

Conversely, suppose both one-sided limits equal $L$. Given $\varepsilon>0$, choose $\delta_1,\delta_2>0$ from the left- and right-hand definitions and let

$$
\delta=\min\{\delta_1,\delta_2\}.
$$

If $0<|x-c|<\delta$, then either $c-\delta<x<c$ or $c<x<c+\delta$. In either case,

$$
|f(x)-L|<\varepsilon.
$$

Thus $\lim_{x\to c}f(x)=L$.

## Theorem 1.1.7

For $\theta$ measured in radians,

$$
\lim_{\theta\to0}\frac{\sin\theta}{\theta}=1.
$$

![](image-8.png){width=65%}

### Proof

For $0<\theta<\dfrac{\pi}{2}$,

$$
\cos\theta\leq\frac{\sin\theta}{\theta}\leq1.
$$

Since $\lim_{\theta\to0}\cos\theta=1$, the Sandwich Theorem gives

$$
\lim_{\theta\to0^+}\frac{\sin\theta}{\theta}=1.
$$

For $\theta<0$,

$$
\frac{\sin\theta}{\theta}
=\frac{\sin(-\theta)}{-\theta},
$$

so the left-hand limit is also $1$. Therefore,

$$
\boxed{\displaystyle\lim_{\theta\to0}\frac{\sin\theta}{\theta}=1}.
$$

### Consequences

For any constant $k\ne0$,

$$
\lim_{\theta\to0}\frac{\sin(k\theta)}{\theta}
=k\lim_{\theta\to0}\frac{\sin(k\theta)}{k\theta}=k.
$$

Also,

$$
\lim_{x\to0}\frac{\sin(\sin x)}{\sin x}=1,
$$

and, for $n$ nested sine functions,

$$
\lim_{x\to0}
\frac{\sin\bigl(\sin(\cdots\sin x\cdots)\bigr)}{x}=1.
$$

### Proof of $\displaystyle\lim_{x\to0}\frac{\sin(\sin x)}{x}=1$

Since $\lim_{x\to0}\sin x=0$, Theorem 1.1.7 gives

$$
\lim_{x\to0}\frac{\sin(\sin x)}{\sin x}=1.
$$

Moreover,

$$
\frac{\sin(\sin x)}{x}
=\frac{\sin(\sin x)}{\sin x}\cdot\frac{\sin x}{x}.
$$

Therefore,

$$
\begin{aligned}
\lim_{x\to0}\frac{\sin(\sin x)}{x}
&=\left(\lim_{x\to0}\frac{\sin(\sin x)}{\sin x}\right)
\left(\lim_{x\to0}\frac{\sin x}{x}\right)\\
&=1\cdot1=1.
\end{aligned}
$$

# Lecture 4: continuity

## Example 1.1.19

$$
f(x)=
\begin{cases}
x, & x<0,\\
1, & 0\leq x<1,\\
2, & x=1,\\
x, & x>1.
\end{cases}
$$

![](image-9.png){width=65%}

## Definition 1.1.8 (Continuity at a Point)

Let $c$ be a real number that is either an interior point or an endpoint of an interval in the domain of $f$.

### (a) Interior point

$f$ is continuous at $c$ if

$$
\lim_{x\to c}f(x)=f(c).
$$

### (b) Right-continuity

$f$ is right-continuous at $c$ (or continuous from the right) if

$$
\lim_{x\to c^+}f(x)=f(c).
$$

### (c) Left-continuity

$f$ is left-continuous at $c$ (or continuous from the left) if

$$
\lim_{x\to c^-}f(x)=f(c).
$$

# Additional examples from the lectures

## Uniqueness of the limit

**Proposition.** A function cannot have two different limits at the same point. If $\lim_{x\to c}f(x)=L$ and $\lim_{x\to c}f(x)=K$, then $L=K$.

**Proof.** Suppose $L\ne K$ and choose $\varepsilon=|L-K|/3$. The two $\varepsilon$-neighborhoods of $L$ and $K$ are disjoint, but the definition of limit would force $f(x)$ to lie in both for $x$ sufficiently close to $c$. This contradiction proves $L=K$.

## A useful $\varepsilon$-$\delta$ example

To prove $\lim_{x\to2}x^2=4$, observe

$$
|x^2-4|=|x-2||x+2|.
$$

If $|x-2|<1$, then $|x+2|<5$. Thus it is enough to take $\delta=\min\{1,\varepsilon/5\}$.

## Power and root rules

The limit laws imply

$$
\lim_{x\to c}[f(x)]^n=\left(\lim_{x\to c}f(x)\right)^n.
$$

If $f(x)\ge0$ near $c$ and the right-hand limit is nonnegative, then

$$
\lim_{x\to c}\sqrt[n]{f(x)}=\sqrt[n]{\lim_{x\to c}f(x)}.
$$

For example,

$$
\lim_{x\to4}\sqrt{x}=2,
\qquad
\lim_{x\to1}\frac{x^3+2x}{x+1}=\frac32.
$$

## One-sided limit example

For $f(x)=|x|/x$,

$$
\lim_{x\to0^-}f(x)=-1,\qquad \lim_{x\to0^+}f(x)=1,
$$

so the two-sided limit does not exist. This is the simplest model of a jump discontinuity.

## Continuity test and types of discontinuity

At an interior point $c$, continuity requires all three conditions:

1.  $f(c)$ is defined;

2.  $\lim_{x\to c}f(x)$ exists;

3.  $\lim_{x\to c}f(x)=f(c)$.

For the piecewise function in Example 1.1.19, the point $0$ is a jump discontinuity because the one-sided limits are $0$ and $1$. At $1$, the two-sided limit is $1$ but $f(1)=2$, so the discontinuity is removable: changing the value at $1$ to $1$ would make the function continuous there.

## Riemann-type example

On $[0,1]$, put $R(p/q)=1/q$ when $p/q$ is in lowest terms with $q>0$, and put $R(x)=0$ for irrational $x$. In particular $R(0)=R(1)=1$. This is also called Thomae's function. The lecture extends it periodically outside $[0,1]$.

**At a rational point.** If $c=p/q$, irrational points occur arbitrarily close to $c$ and have value zero, whereas $R(c)=1/q$. Taking $\varepsilon=1/(2q)$ disproves continuity. At $0$ or $1$, use points from inside the interval.

**At an irrational point.** Fix an irrational $c\in(0,1)$ and $\varepsilon>0$. Choose an integer $N>1/\varepsilon$. There are only finitely many reduced fractions in $[0,1]$ with denominator at most $N$; call this finite set $E_N$. None equals $c$, so the distance from $c$ to $E_N$ is positive. Choose $\delta$ smaller than that distance and than $c$ and $1-c$.

If $|x-c|<\delta$, either $x$ is irrational and $R(x)=0$, or its reduced denominator is greater than $N$ and $R(x)<1/N<\varepsilon$. Since $R(c)=0$, this is exactly continuity at $c$.

The useful idea is that the tall spikes form a finite set once a height is fixed. Density of the rationals by itself does not rule out continuity.

## Continuity on an interval and continuous extension

Continuity on $[a,b]$ means ordinary continuity on $(a,b)$, right-continuity at $a$, and left-continuity at $b$. Use the corresponding endpoint convention for a half-open interval.

If $f$ is continuous on an interval except at $c$ and $\lim_{x\to c}f(x)=L$ exists, defining $f(c)=L$ gives its unique continuous extension at $c$. For example, the function $\sin x/x$ extends to a continuous function at zero by assigning the value $1$. An infinite or oscillating limit cannot be repaired by changing just one function value.

## Review problems

1. Prove $\lim_{x\to2}x^2=4$ without quoting the polynomial limit law. Explain why the restriction $|x-2|<1$ is useful.

2. Give functions whose sum has a limit but neither summand does. Then give an example showing that strict inequalities need not survive a limit.

3. Compare $\sin(1/x)$, $x\sin(1/x)$ and $x^2\sin(1/x)$ near zero. Which can be extended continuously? Differentiability will be a separate question in Week 3.

## Lecture sources

Xing-Bin Pan, MAT1011 lecture slides, Lectures 1–4: limits and limit language; limit laws and the geometric trigonometric limit; continuity and the Riemann function (Lecture 4, pp.20–29). The original diagrams and lecture numbering are retained. Course assessment recorded in the original draft: class 5%, homework 15%, quizzes 20%, midterm 20%, final 40%.
