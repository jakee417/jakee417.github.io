---
title: "When Is the Paired t-Test Uniformly More Powerful?"
author: jake
date: 2026-10-25 17:09:00 -0700
categories: [Math]
tags: [statistics]
math: true
mermaid: true
markdown: kramdown
---

## Abstract

We compare the paired $t$-test on $n$ pairs with the independent two-sample $t$-test on $n + n$ observations, at the same level $\alpha$ and the same total sample size, in the normal model with common marginal variance $\sigma^2$ and within-pair correlation $\rho$. The paired test is uniformly more powerful (power at least as large at _every_ alternative) if and only if $\rho \ge \rho^{\ast}(n, \alpha)$, where $\rho^{\ast}$ is the supremum of an explicit threshold function $\rho_\lambda$ indexed by the noncentrality. We evaluate the two ends of that function exactly: $\rho_\lambda \to \rho_{\mathrm{loc}}$ as $\lambda \to 0$ (a local, second-order threshold) and $\rho_\lambda \to \rho_{\mathrm{tail}}$ as $\lambda \to \infty$, where $\rho_{\mathrm{tail}} = 1 - \frac{(n - 1) + c_I^2/2}{(n - 1) + c_P^2}$ has a closed form in the two critical values. In every case computed, $\rho_\lambda$ increases monotonically from $\rho_{\mathrm{loc}}$ to $\rho_{\mathrm{tail}}$, identifying $\rho^{\ast} = \rho_{\mathrm{tail}}$; the bound $\rho^{\ast} \ge \rho_{\mathrm{tail}}$ is proved, as are the necessities $\rho > 0$ and $\rho^{\ast}(n, \alpha) \to 0$. In particular a positive correlation is necessary but, for every finite $n$, not sufficient: domination is decided in the far tail, at alternatives so large that both powers are exponentially close to $1$.

## Setup and Power Functions

Let $(X_i, Y_i)$, $i = 1, \dots, n$, be i.i.d. bivariate normal with means $(\mu_X, \mu_Y)$, common variance $\sigma^2 > 0$, and correlation $\rho \in (-1, 1)$. Write $\delta = \mu_X - \mu_Y$ and test $H_0 : \delta = 0$ against $H_1 : \delta \ne 0$ at level $\alpha \in (0, 1)$ (two-sided throughout; see Remark 7.3).

The _paired design_ analyzes the differences $D_i = X_i - Y_i \sim N(\delta, \sigma_D^2)$ with $\sigma_D^2 = 2\sigma^2(1 - \rho)$ by the one-sample $t$-test, rejecting when $\lvert T_P \rvert > c_{n - 1}$, where $c_\nu = t_{1 - \alpha/2, \nu}$ is the two-sided $t$ critical value.

The _independent design_ observes two independent samples of size $n$ from the same marginals and applies the pooled two-sample $t$-test, rejecting when $\lvert T_I \rvert > c_{2n - 2}$. Both tests are exact level $\alpha$ and UMPU within their design [2].

Under the alternative, $T_P$ and $T_I$ have noncentral $t$ distributions. Writing $T_\nu(\lambda) = (Z + \lambda)/W_\nu$ with $Z \sim N(0, 1)$ independent of $W_\nu = \sqrt{V_\nu/\nu}$, $V_\nu \sim \chi^2_\nu$, the noncentralities are

$$
\lambda_P = \frac{\delta \sqrt{n}}{\sigma_D}
= \frac{\lambda}{\sqrt{1 - \rho}}
$$

and

$$
\lambda_I = \frac{\delta \sqrt{n}}{\sigma \sqrt{2}} =: \lambda,
$$

so $(\delta, \sigma)$ enters both power functions only through the single parameter $\lambda \in \mathbb{R}$. Define the generic two-sided power function, for $\nu \ge 1$ and $\lambda \in \mathbb{R}$,

$$
\begin{aligned}
\Phi_\nu(\lambda)
&= \mathbb{P}\bigl(\lvert T_\nu(\lambda) \rvert > c_\nu\bigr) \\
&= \int_0^\infty \Bigl[ \Phi(\lambda - c_\nu w) + \Phi(-\lambda - c_\nu w) \Bigr] f_\nu(w) \, dw,
\end{aligned}
$$

where $\Phi, \varphi$ are the standard normal cdf and pdf and $f_\nu$ is the density of $W_\nu$; the second equality conditions on $W_\nu = w$ and uses $\mathbb{P}(\lvert Z + \lambda \rvert > c_\nu w) = \Phi(\lambda - c_\nu w) + \Phi(-\lambda - c_\nu w)$. The paired test has power $\Phi_{n - 1}\bigl(\lambda/\sqrt{1 - \rho}\bigr)$ and the independent test has power $\Phi_{2n - 2}(\lambda)$. We say the paired test is _uniformly more powerful_ if its power is $\ge$ the independent test's power at every $\lambda \ne 0$.

## Two Monotonicity Lemmas

**Lemma 2.1 (Monotonicity in the noncentrality).** For each $\nu$, $\Phi_\nu$ is even, $\Phi_\nu(0) = \alpha$, and $\Phi_\nu$ is strictly increasing on $[0, \infty)$, with $\Phi_\nu(\lambda) \to 1$ as $\lambda \to \infty$ and $\Phi_\nu(\lambda) < 1$ for all finite $\lambda$.

<details><summary>Proof</summary>

Evenness and $\Phi_\nu(0) = \alpha$ are immediate from the integral representation. Differentiate the integrand with respect to $\lambda$ (justified since the derivative is bounded by $2\varphi(0)$):

$$
\frac{\partial}{\partial \lambda}
\Bigl[ \Phi(\lambda - c_\nu w) + \Phi(-\lambda - c_\nu w) \Bigr]
= \varphi(\lambda - c_\nu w) - \varphi(\lambda + c_\nu w).
$$

For $\lambda, w > 0$, $(\lambda + c_\nu w)^2 - (\lambda - c_\nu w)^2 = 4\lambda c_\nu w > 0$, so $\varphi(\lambda + c_\nu w) < \varphi(\lambda - c_\nu w)$ and the derivative is strictly positive for almost every $w$; hence $\Phi_\nu$ is strictly increasing on $[0, \infty)$.

For the limit, write the _deficit_

$$
1 - \Phi_\nu(\lambda)
= \mathbb{E}\bigl[\Phi(c_\nu W_\nu - \lambda) - \Phi(-c_\nu W_\nu - \lambda)\bigr]
\le \mathbb{E}\, \Phi(c_\nu W_\nu - \lambda);
$$

the integrand tends to $0$ pointwise in $W_\nu$ as $\lambda \to \infty$ and is dominated by $1$, so the deficit tends to $0$ by dominated convergence. The deficit is strictly positive for finite $\lambda$ since the integrand is positive on a set of positive measure.

</details>

**Lemma 2.2 (Monotonicity in the degrees of freedom; Tang [1]).** For each $\lambda \ne 0$, $\Phi_\nu(\lambda)$ is strictly increasing in $\nu$.

This is the classical monotonicity of the noncentral $F$ power in its denominator degrees of freedom (note $T_\nu(\lambda)^2 \sim F_{1, \nu}(\lambda^2)$), proved by Tang [1]; it is readily verified numerically, e.g. at $\alpha = 0.05$, $\Phi_9(2) = 0.431 < \Phi_{18}(2) = 0.473$ and $\Phi_4(1) = 0.122 < \Phi_8(1) = 0.143$.

**Corollary 2.3 ($\rho > 0$ is necessary).** If $\rho \le 0$, the paired test is strictly dominated at every alternative: for all $\lambda > 0$,

$$
\Phi_{n - 1}\Bigl(\frac{\lambda}{\sqrt{1 - \rho}}\Bigr) < \Phi_{2n - 2}(\lambda).
$$

<details><summary>Proof</summary>

If $\rho \le 0$ then $\lambda/\sqrt{1 - \rho} \le \lambda$, so by Lemmas 2.1 and 2.2,

$$
\Phi_{n - 1}\Bigl(\frac{\lambda}{\sqrt{1 - \rho}}\Bigr)
\le \Phi_{n - 1}(\lambda)
< \Phi_{2n - 2}(\lambda).
$$

</details>

## The Threshold Function and the Main Theorem

For fixed $\lambda > 0$ consider the paired power as a function of $\rho$. By Lemma 2.1 it is continuous and strictly increasing in $\rho$ (since $\lambda/\sqrt{1 - \rho}$ is), equals $\Phi_{n - 1}(\lambda) < \Phi_{2n - 2}(\lambda)$ at $\rho = 0$ (Lemma 2.2), and tends to $1 > \Phi_{2n - 2}(\lambda)$ as $\rho \to 1^{-}$. Hence there is a unique root

$$
\rho_\lambda \in (0, 1)
$$

$$
\Phi_{n - 1}\Bigl(\frac{\lambda}{\sqrt{1 - \rho_\lambda}}\Bigr)
= \Phi_{2n - 2}(\lambda).
$$

Set $\rho^{\ast}(n, \alpha) := \sup_{\lambda > 0} \rho_\lambda \in (0, 1]$.

**Theorem 3.1 (Necessary and sufficient condition).** The paired test is uniformly more powerful than the independent test if and only if $\rho \ge \rho^{\ast}(n, \alpha)$. If $\rho > \rho^{\ast}(n, \alpha)$ the domination is strict at every alternative.

<details><summary>Proof</summary>

Suppose $\rho \ge \rho^{\ast}$. For every $\lambda > 0$, $\rho \ge \rho_\lambda$, so $\lambda/\sqrt{1 - \rho} \ge \lambda/\sqrt{1 - \rho_\lambda}$ and Lemma 2.1 gives

$$
\Phi_{n - 1}\Bigl(\frac{\lambda}{\sqrt{1 - \rho}}\Bigr)
\ge \Phi_{n - 1}\Bigl(\frac{\lambda}{\sqrt{1 - \rho_\lambda}}\Bigr)
= \Phi_{2n - 2}(\lambda),
$$

with strict inequality throughout if $\rho > \rho^{\ast}$.

Conversely, if $\rho < \rho^{\ast}$ there exists $\lambda > 0$ with $\rho_\lambda > \rho$, and the same chain with reversed inequalities shows the paired power is strictly smaller at that $\lambda$.

</details>

Thus the entire comparison is encoded in the one-parameter family $\rho_\lambda$. We now evaluate its two ends.

## The Local End: $\lambda \to 0$

**Proposition 4.1.** As $\lambda \to 0$,

$$
\Phi_\nu(\lambda) = \alpha + A(\nu) \, \lambda^2 + o(\lambda^2)
$$

$$
A(\nu) := c_\nu \, \mathbb{E}\bigl[ W_\nu \, \varphi(c_\nu W_\nu) \bigr] > 0.
$$

Consequently, whenever $A(n - 1) < A(2n - 2)$, $\rho_\lambda \to \rho_{\mathrm{loc}} := 1 - \dfrac{A(n - 1)}{A(2n - 2)}$ as $\lambda \to 0^{+}$.

<details><summary>Proof</summary>

Taylor-expand the integrand of the power function in $\lambda$: the first derivative vanishes at $\lambda = 0$ (evenness), and

$$
\left. \frac{\partial^2}{\partial \lambda^2}
\Bigl[ \Phi(\lambda - a) + \Phi(-\lambda - a) \Bigr] \right|_{\lambda = 0}
= 2a \, \varphi(a),
$$

where $a = c_\nu w$, since $\frac{d^2}{d\lambda^2} \Phi(\lambda - a) = -(\lambda - a) \varphi(\lambda - a)$ and similarly for the second term. Termwise expansion is justified by dominated convergence (all derivatives are bounded by polynomials in $w$ times $\varphi$, and $W_\nu$ has moments of all orders), giving $\Phi_\nu(\lambda) = \alpha + \lambda^2 c_\nu \mathbb{E}[W_\nu \varphi(c_\nu W_\nu)] + o(\lambda^2)$.

Hence the power gap satisfies

$$
\Phi_{n - 1}\Bigl(\frac{\lambda}{\sqrt{1 - \rho}}\Bigr) - \Phi_{2n - 2}(\lambda)
= \lambda^2 \left[ \frac{A(n - 1)}{1 - \rho} - A(2n - 2) \right] + o(\lambda^2).
$$

At $\rho = \rho_\lambda$ the left side is $0$; dividing by $\lambda^2$ and letting $\lambda \to 0^+$ yields $A(n - 1)/(1 - \rho_\lambda) \to A(2n - 2)$, i.e. $\rho_\lambda \to 1 - A(n - 1)/A(2n - 2)$.

</details>

Note Lemma 2.2 forces $A(n - 1) \le A(2n - 2)$ (else the expansion would contradict $\Phi_{n - 1}(\lambda) < \Phi_{2n - 2}(\lambda)$ for small $\lambda$); the inequality is strict, and $A$ strictly increasing, in every case of Table 1 ($A(\nu) \uparrow z_{1 - \alpha/2} \varphi(z_{1 - \alpha/2}) = 0.1146$ at $\alpha = 0.05$).

## The Far Tail: $\lambda \to \infty$

**Proposition 5.1.** The deficit $D_\nu(\lambda) := 1 - \Phi_\nu(\lambda)$ satisfies, as $\lambda \to \infty$,

$$
\log D_\nu(\lambda)
= -\frac{\lambda^2}{2} \, \frac{\nu}{\nu + c_\nu^2} + O(\log \lambda).
$$

Consequently $\rho_\lambda \to \rho_{\mathrm{tail}}$ as $\lambda \to \infty$, where, writing $c_P = c_{n - 1}$ and $c_I = c_{2n - 2}$,

$$
\rho_{\mathrm{tail}}
= 1 - \frac{(n - 1) + c_I^2/2}{(n - 1) + c_P^2} \in (0, 1).
$$

<details><summary>Proof</summary>

Since $\Phi(-c_\nu w - \lambda) > 0$ is exponentially negligible relative to the main term, the power representation gives $D_\nu(\lambda) = \mathbb{E}\, \Phi(c_\nu W_\nu - \lambda) \, (1 + o(1))$. Write the expectation over $V = V_\nu$ with $W_\nu = \sqrt{V/\nu}$ and use $\Phi(-x) = \exp(-x^2/2 + O(\log x))$ for $x \to +\infty$: the integrand's logarithm is $-F(w)$, up to $O(\log \lambda)$, where

$$
\begin{aligned}
F(w)
&= \frac{(\lambda - c_\nu w)^2}{2} \\
&\quad + \frac{\nu}{2} \Bigl( w^2 - 1 - \log w^2 \Bigr),
\end{aligned}
$$

the second term being the $\chi^2_\nu$ rate function. By Laplace's method the integral is governed by the minimizer of $F$. Substituting $w = \lambda t / c_\nu$ gives

$$
F = \frac{\lambda^2}{2} \left[ (1 - t)^2 + \frac{\nu}{c_\nu^2} t^2 \right] + O(\log \lambda),
$$

minimized at $t^{\ast} = c_\nu^2/(c_\nu^2 + \nu)$ with minimum value $\nu/(c_\nu^2 + \nu)$, which is the stated rate.

Now compare deficits at the candidate threshold. With $\lambda_P = \lambda/\sqrt{1 - \rho}$,

$$
\begin{aligned}
&\log D_{n - 1}(\lambda_P) - \log D_{2n - 2}(\lambda) \\
&= -\frac{\lambda^2}{2} \left[
\frac{(n - 1)}{(1 - \rho) \bigl((n - 1) + c_P^2\bigr)}
- \frac{2n - 2}{(2n - 2) + c_I^2}
\right] + O(\log \lambda).
\end{aligned}
$$

The bracket is a strictly decreasing function of $\rho$ vanishing exactly at $\rho = \rho_{\mathrm{tail}}$ (using $\frac{2n - 2}{(2n - 2) + c_I^2} = \frac{n - 1}{(n - 1) + c_I^2/2}$). If $\rho > \rho_{\mathrm{tail}}$ the bracket is positive, so $D_{n - 1}(\lambda_P) < D_{2n - 2}(\lambda)$ for all large $\lambda$, i.e. $\rho_\lambda < \rho$ eventually; if $\rho < \rho_{\mathrm{tail}}$ the reverse holds eventually. Since $\rho$ was arbitrary, $\rho_\lambda \to \rho_{\mathrm{tail}}$.

</details>

**Corollary 5.2.** $\rho^{\ast}(n, \alpha) \ge \rho_{\mathrm{tail}} > \rho_{\mathrm{loc}}$ in all computed cases; in particular $\rho^{\ast}(n, \alpha) > 0$ for every finite $n$: _no_ positive correlation, however small, and indeed no correlation below the explicit bound $\rho_{\mathrm{tail}}$, yields uniform domination at fixed $n$.

## The Exact Threshold in Practice

Theorem 3.1 reduces uniform domination to $\rho \ge \sup_\lambda \rho_\lambda$; Propositions 4.1 and 5.1 evaluate the two ends of $\rho_\lambda$ in closed form. Computing $\rho_\lambda$ exactly (noncentral $t$ power, by bisection in $\rho$) on $\lambda \in (0, 24]$ for the values in Table 1, one finds in every case that $\rho_\lambda$ is _strictly increasing_ in $\lambda$, from $\rho_{\mathrm{loc}}$ up to $\rho_{\mathrm{tail}}$. The supremum is therefore the far-tail limit, $\rho^{\ast} = \rho_{\mathrm{tail}}$, approached but never attained at any finite alternative; at $\rho = \rho_{\mathrm{tail}}$ domination is nevertheless strict at every finite $\lambda$, since $\rho_\lambda < \rho_{\mathrm{tail}}$ there. We record this as the practical form of the necessary and sufficient condition:

$$
\boxed{\rho \ge \rho^{\ast}(n, \alpha) = 1 - \frac{(n - 1) + c_I^2/2}{(n - 1) + c_P^2}}
$$

$$
\rho^{\ast}(n, \alpha) \sim \frac{z_{1 - \alpha/2}^2}{2n}
\quad \text{as } n \to \infty.
$$

| $n$ | $c_{n - 1}$ | $\rho_{\mathrm{loc}}$ | $\rho_{\mathrm{MDE}}$ | $\rho^{\ast} = \rho_{\mathrm{tail}}$ |
|---:|---:|---:|---:|---:|
| 5 | 2.776 | 0.211 | 0.310 | 0.431 |
| 10 | 2.262 | 0.102 | 0.138 | 0.206 |
| 15 | 2.145 | 0.067 | 0.088 | 0.135 |
| 20 | 2.093 | 0.050 | 0.065 | 0.100 |
| 30 | 2.045 | 0.033 | 0.042 | 0.066 |
| 50 | 2.010 | 0.020 | 0.025 | 0.039 |

**Table 1.** Thresholds at $\alpha = 0.05$ (two-sided). $\rho_{\mathrm{loc}}$: local threshold (Proposition 4.1); $\rho_{\mathrm{MDE}} = 1 - (c_I/c_P)^2$: the common minimum-detectable-effect heuristic; $\rho^{\ast}$: the exact uniform-domination threshold (Proposition 5.1). The heuristic underestimates $\rho^{\ast}$ at every $n$, because domination is decided in the far tail.

**Remark 6.1 (The far tail is practically invisible).** For $\rho_{\mathrm{loc}} < \rho < \rho^{\ast}$, domination fails only at alternatives $\lambda > \lambda_0(\rho)$ so large that, by the deficit rate, both powers are within $\exp(-c\lambda^2)$ of $1$: the independent test's advantage there is real but unobservable. The local threshold $\rho_{\mathrm{loc}}$ is the practically relevant one; $\rho^{\ast}$ is the mathematically exact one.

## Asymptotics and Extensions

**Corollary 7.1.** $\rho^{\ast}(n, \alpha) \to 0$ as $n \to \infty$. Hence asymptotically the necessary and sufficient condition is exactly $\rho > 0$, and under local alternatives $\delta = h/\sqrt{n}$ the Pitman asymptotic relative efficiency of the paired to the independent design is $\mathrm{ARE} = 1/(1 - \rho)$.

<details><summary>Proof sketch</summary>

Fix $\rho > 0$. On $(0, \delta]$ the gap is positive for large $n$ by Proposition 4.1, since $A(\nu) \to z_{1 - \alpha/2} \varphi(z_{1 - \alpha/2})$ and hence $A(n - 1)/(1 - \rho) - A(2n - 2) \to z \varphi(z) \, \rho/(1 - \rho) > 0$. On a compact $[\delta, \Lambda]$, $W_\nu \to 1$ in probability and $c_\nu \to z_{1 - \alpha/2}$ give $\Phi_\nu(\lambda) \to \Phi(\lambda - z) + \Phi(-\lambda - z)$ uniformly, so the gap tends to the normal-shift gap at $\lambda/\sqrt{1 - \rho}$ versus $\lambda$, which is positive and attains its minimum. On $[\Lambda, \infty)$ the rates in the deficit formula satisfy $\nu/(\nu + c_\nu^2) \to 1$, so the bracket in Proposition 5.1 tends to $1/(1 - \rho) - 1 > 0$. Thus domination holds for all large $n$, i.e. $\rho^{\ast}(n, \alpha) \le \rho$ eventually.

The ARE is the ratio of sample sizes matching noncentralities: $\delta \sqrt{n_P}/\sqrt{2\sigma^2(1 - \rho)} = \delta \sqrt{n_I}/\sqrt{2\sigma^2}$ gives $n_I/n_P = 1/(1 - \rho)$.

</details>

**Corollary 7.2 (Unequal variances).** If the marginal variances are $\sigma_X^2 \ne \sigma_Y^2$, the noncentrality ratio is $\lambda_P/\lambda_I = \sqrt{(\sigma_X^2 + \sigma_Y^2)/\sigma_D^2} = 1/\sqrt{1 - \tilde\rho}$ with _effective correlation_

$$
\tilde\rho = \frac{2\rho \, \sigma_X \sigma_Y}{\sigma_X^2 + \sigma_Y^2} \le \rho
$$

(equality iff $\sigma_X = \sigma_Y$). The whole comparison, and in particular the asymptotic condition $\tilde\rho > 0 \iff \rho > 0$, depends on $(\sigma_X, \sigma_Y, \rho)$ only through $\tilde\rho$.

**Remark 7.3 (One-sided tests).** The same argument with $c_\nu = t_{1 - \alpha, \nu}$ gives the identical characterization for one-sided tests. Only the local end changes: the expansion is first order, $\Phi_\nu(\lambda) = \alpha + \lambda B(\nu) + O(\lambda^2)$ with $B(\nu) = \mathbb{E}\, \varphi(c_\nu W_\nu)$, so $\rho_{\mathrm{loc}} = 1 - \bigl(B(n - 1)/B(2n - 2)\bigr)^2$; the far-tail formula is unchanged in form.

## Lean Verification

The threshold argument is also formalized in Lean 4 with Mathlib. The complete formalization file is hosted as text here: [Threshold.lean](https://raw.githubusercontent.com/jakee417/jakee417.github.io/master/assets/files/paired-t/Threshold.lean).

Mathlib does not yet contain the noncentral $t$ theory used above, so the formalization takes the power function, the critical values, and the coefficient $A(\nu)$ axiomatically, together with the analytic facts proved in the lemmas and propositions: monotonicity in the noncentrality and in the degrees of freedom, positivity of the deficit, monotonicity and continuity of the paired power in $\rho$, and the local and far-tail limits of $\rho_\lambda$.

From those inputs, Lean proves the rest of the argument in full: existence and uniqueness of $\rho_\lambda$, the main theorem `uniform_domination_iff`, strict domination above $\rho^{\ast}$, necessity of a positive correlation, and the bounds $\rho_{\mathrm{tail}} \le \rho^{\ast}$ and $\rho_{\mathrm{loc}} \le \rho^{\ast}$. Checking the main results with `#print axioms` shows no `sorryAx`: they depend only on the axioms declared in the file and on Lean's standard axioms (`propext`, `Classical.choice`, `Quot.sound`).

## References

[1] P. C. Tang, _The power function of the analysis of variance tests with tables and illustrations of their use_, Statistical Research Memoirs **2** (1938), 126--149.

[2] E. L. Lehmann and J. P. Romano, _Testing Statistical Hypotheses_, 3rd ed., Springer, 2005.
