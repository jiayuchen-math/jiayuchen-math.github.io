# Honours Linear Algebra — Week 1 Notes

## 1. Systems of linear equations

A linear system can be written as $AX=b$. The matrix $A$ is the coefficient matrix, $X$ is the vector of unknowns, and $b$ is the right-hand side.

For example,

$$
\begin{cases}
3x+2y+z=39,\\
2x+3y+z=34,\\
x+2y+3z=26
\end{cases}
$$

has augmented matrix

$$
\left[\begin{array}{ccc|c}3&2&1&39\\2&3&1&34\\1&2&3&26\end{array}\right].
$$

Elimination gives

$$
\begin{bmatrix}3&2&1&39\\2&3&1&34\\1&2&3&26\end{bmatrix}
\longrightarrow
\begin{bmatrix}3&2&1&39\\0&5&1&24\\0&0&36&99\end{bmatrix},
$$

so

$$z=\frac{11}{4},\qquad y=\frac{17}{4},\qquad x=\frac{17}{4}.
$$

## 2. Matrices

An $m\times n$ matrix is a rectangular array with $m$ rows and $n$ columns. The $(i,j)$-entry is $a_{ij}$. The identity matrix is $I_n$, and the transpose is $A^T$.

Matrix addition and scalar multiplication are entrywise. A square matrix is triangular if it is upper or lower triangular, and diagonal if all off-diagonal entries vanish.

## 3. Elementary row operations

The three operations are:

1. interchange two rows;
2. multiply a row by a nonzero scalar;
3. add a multiple of one row to another.

All are reversible, so they preserve the solution set. Gaussian elimination uses them to produce row echelon form. Reduced row echelon form additionally has pivots equal to $1$ and zeroes elsewhere in each pivot column.

### Reading a solution

$$
\left[\begin{array}{ccc|c}1&0&2&3\\0&1&-1&4\\0&0&0&0\end{array}\right]
$$

gives $x_3=t$, $x_1=3-2t$, $x_2=4+t$. Thus

$$
X=\begin{bmatrix}3\\4\\0\end{bmatrix}+t\begin{bmatrix}-2\\1\\1\end{bmatrix}.
$$

A row $[0\ 0\ 0\mid c]$ with $c\ne0$ means $0=c$, so the system is inconsistent.

## 4. Inverse matrices

$A$ is invertible if $AA^{-1}=A^{-1}A=I$. Compute the inverse by

$$[A\mid I]\longrightarrow[I\mid A^{-1}].$$

If $A$ and $B$ are invertible, then $(AB)^{-1}=B^{-1}A^{-1}$. Also,
$(A^T)^{-1}=(A^{-1})^T$. A triangular matrix with nonzero diagonal entries is invertible and its inverse has the same triangular form.

## 5. LU decomposition

If elimination reduces $A$ to an upper triangular matrix $U$ without row swaps, then

$$A=LU,$$

where $L$ is lower triangular. For

$$A=\begin{bmatrix}3&2&1\\2&3&1\\1&2&3\end{bmatrix},$$

one obtains

$$
L=\begin{bmatrix}1&0&0\\2/3&1&0\\1/3&4/5&1\end{bmatrix},\qquad
U=\begin{bmatrix}3&2&1\\0&5/3&1/3\\0&0&12/5\end{bmatrix}.
$$

To solve $Ax=b$, solve $Ld=b$ first and then $Ux=d$. This is forward substitution followed by back substitution.

## 6. Vector spaces and null spaces

$$
\nul(A)=\{X\in\mathbb R^n:AX=0\}
$$

is the null space of $A$.

It is a subspace: if $u,v\in\nul(A)$ and $a\in\mathbb R$, then

$$A(au+v)=aAu+Av=0.$$

The span of a set is the collection of all finite linear combinations of its vectors; the span is always a subspace.

## Summary

Systems, matrices, Gaussian elimination, inverses, LU decomposition, and null spaces are different ways of describing the same linear structure.

## 7. Classifying the solutions of a system

After row reduction, every linear system falls into one of three cases.

1. It has no solution, because a row of the form
   $$[0\ \cdots\ 0\mid c],\qquad c\ne 0,$$
   represents the contradiction $0=c$.
2. It has exactly one solution, when every variable is a pivot variable.
3. It has infinitely many solutions, when the system is consistent and at least one free variable remains.

This classification is more useful than simply obtaining one numerical answer: it tells us the shape of the whole solution set.

### Example: two free variables

Consider

$$
\begin{aligned}
x_1+2x_3-x_4&=3,\\
x_2-x_3+2x_4&=1.
\end{aligned}
$$

The variables $x_3$ and $x_4$ are free. Set $x_3=s$ and $x_4=t$. Then

$$
X=\begin{bmatrix}3-2s+t\\1+s-2t\\s\\t\end{bmatrix}
=\begin{bmatrix}3\\1\\0\\0\end{bmatrix}
s\begin{bmatrix}-2\\1\\1\\0\end{bmatrix}
t\begin{bmatrix}1\\-2\\0\\1\end{bmatrix}.
$$

Thus the solution set is an affine plane in $\mathbb R^4$: one particular solution plus the span of two direction vectors.

### Example: detecting inconsistency

Suppose elimination gives

$$
\begin{bmatrix}1&2&-1&\mid&4\\0&1&3&\mid&2\\0&0&0&\mid&5\end{bmatrix}.
$$

The last row says $0=5$, so the system has no solution. No choice of free variables can repair this contradiction.

## 8. Homogeneous systems and dependence

A homogeneous system has the form $AX=0$. It is always consistent because $X=0$ is a solution. If there are more unknowns than equations, then at least one variable is free after elimination, so there is a nonzero solution.

For example, a system with $m$ equations and $n>m$ unknowns has at most $m$ pivots. Therefore at least $n-m$ variables are free. This observation is the first appearance of a dimension count: the number of free variables measures how many independent directions occur in the null space.

## 9. Matrices as transformations

An $m\times n$ matrix defines a function

$$
T_A:\mathbb R^n\to\mathbb R^m,\qquad T_A(X)=AX.
$$

The columns of $A$ describe where the standard basis vectors are sent. If $A=[a_1\ \cdots\ a_n]$ and $X=(x_1,\ldots,x_n)^T$, then

$$AX=x_1a_1+\cdots+x_na_n.$$

Consequently, $AX=b$ is solvable exactly when $b$ lies in the span of the columns of $A$. Row reduction is therefore not merely a computational trick: it determines which vectors can be produced by the transformation.

## 10. Elementary matrices

Each elementary row operation can be represented by multiplication on the left by an elementary matrix $E$. For instance, swapping two rows of $A$ is the same as multiplying $A$ by a permutation matrix. A row replacement has the form

$$E=I+cE_{ij},$$

where $E_{ij}$ has a single $1$ in position $(i,j)$. Since every row operation is reversible, every elementary matrix is invertible. If

$$E_k\cdots E_2E_1A=U,$$

then the elimination process can be read as matrix multiplication. This point of view explains why row reduction interacts naturally with inverses and LU decomposition.

## 11. Inverses in practice

For a square matrix $A$, the equation $AX=b$ has the solution $X=A^{-1}b$ whenever $A$ is invertible. The augmented-matrix algorithm computes the inverse by performing the same row operations on $I$:

$$[A\mid I]\longrightarrow[I\mid A^{-1}].$$

For a $2\times2$ matrix,

$$
A=\begin{bmatrix}a&b\\c&d\end{bmatrix},\qquad
A^{-1}=\frac1{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix},
$$

provided $ad-bc\ne0$. The determinant formula is a compact special case of the row-reduction procedure.

### A short inverse example

Let

$$A=\begin{bmatrix}1&2\\3&7\end{bmatrix}.$$

The determinant is $1$, so $A$ is invertible and

$$A^{-1}=\begin{bmatrix}7&-2\\-3&1\end{bmatrix}.$$

Indeed,

$$
\begin{bmatrix}7&-2\\-3&1\end{bmatrix}
\begin{bmatrix}1&2\\3&7\end{bmatrix}
=\begin{bmatrix}1&0\\0&1\end{bmatrix}.
$$

## 12. LU decomposition and repeated solves

Gaussian elimination records its multipliers below the diagonal. For the matrix

$$A=\begin{bmatrix}3&2&1\\2&3&1\\1&2&3\end{bmatrix},$$

the factorization is

$$
A=LU,
\quad L=\begin{bmatrix}1&0&0\\2/3&1&0\\1/3&4/5&1\end{bmatrix},
\quad U=\begin{bmatrix}3&2&1\\0&5/3&1/3\\0&0&12/5\end{bmatrix}.
$$

To solve $Ax=b$, first solve $Ly=b$ by forward substitution and then solve $Ux=y$ by back substitution. The same factorization can be reused for many different right-hand sides $b$, which is why LU is preferable to recomputing an inverse repeatedly.

### Substitution example

If

$$
L=\begin{bmatrix}1&0&0\\2&1&0\\-1&3&1\end{bmatrix},\qquad
b=\begin{bmatrix}2\\5\\1\end{bmatrix},
$$

then $Ly=b$ gives $y_1=2$, $2y_1+y_2=5$, and $-y_1+3y_2+y_3=1$. Hence $y=(2,1,2)^T$. The upper-triangular step is solved from the bottom row upward.

## 13. Null spaces and affine solution sets

The null space is

$$\operatorname{Nul}(A)=\{X:AX=0\}.$$

It is a subspace: it contains $0$, and if $u,v$ are in the null space, then $A(\alpha u+\beta v)=0$ for all scalars $\alpha,\beta$.

If $AX=b$ is consistent and $X_0$ is one solution, then every solution has the form

$$X=X_0+Z,\qquad Z\in\operatorname{Nul}(A).$$

Indeed, $AX=b$ is equivalent to $A(X-X_0)=0$. Thus the null space gives precisely the directions in which one may move from a particular solution while remaining inside the solution set.

## 14. Span, column space, and a working checklist

For vectors $v_1,\ldots,v_r$,

$$\operatorname{Span}\{v_1,\ldots,v_r\}=\{c_1v_1+\cdots+c_rv_r\}.$$

The span is the smallest subspace containing the given vectors. The column space of $A$ is the span of its columns, so the equation $AX=b$ is solvable precisely when $b$ lies in that column space.

When solving a new problem, the following checklist is reliable:

1. Write the augmented matrix.
2. Use reversible row operations to reach echelon form.
3. Check for contradiction rows.
4. Identify pivot and free variables.
5. Parametrize the solution set.
6. Interpret the answer using column space or null space.

## Final summary

The central workflow of the first week is simple but powerful: represent equations as a matrix, simplify by reversible operations, and interpret the resulting pivots and free variables. The same process leads to the notions of inverse matrix, LU decomposition, null space, span, and column space. These are not separate tricks; they are several compatible languages for the same linear structure.

