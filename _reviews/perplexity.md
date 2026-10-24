---
title: Perplexity
author: jake
date: 2026-10-21 23:07:00 -0700
categories: [Math]
tags: [mathematics, ai-assisted]
math: true
mermaid: true
markdown: kramdown
---

In [Entropy, Prefix Codes, and KL Divergence]({% link _posts/2026-10-01-entropy-prefix-codes-and-kl-divergence.md %}), cross-entropy is the expected code length when data drawn from $p$ is encoded using a code built for $q$. [Perplexity](https://en.wikipedia.org/wiki/Perplexity) is the same score with the logarithm undone. Instead of reporting uncertainty in bits or nats per symbol, it reports an effective number of equally likely choices per symbol.

## Definition

Let $x_{1:N}$ be a sequence, and let $q$ assign a conditional probability to each observed symbol given the symbols before it. The average log loss, using logarithms in base $b$, is:

$$
\bar{L}_b(x_{1:N}; q) = -\frac{1}{N} \sum_{t=1}^{N} \log_b q(x_t \mid x_{<t})
$$

Perplexity exponentiates this average:[^base]

$$
\boxed{\operatorname{PPL}_b(x_{1:N}; q) = b^{\bar{L}_b(x_{1:N}; q)}}
$$

Equivalently, perplexity is the inverse geometric mean probability assigned to the observed sequence:

$$
\operatorname{PPL}_b(x_{1:N}; q) = \left( \prod_{t=1}^{N} q(x_t \mid x_{<t}) \right)^{-1/N}
$$

<details><summary>Proof</summary>
$$
\begin{aligned}
\operatorname{PPL}_b(x_{1:N}; q)
&= b^{-\frac{1}{N} \sum_{t=1}^{N} \log_b q(x_t \mid x_{<t})} \\
&= \left( b^{\sum_{t=1}^{N} \log_b q(x_t \mid x_{<t})} \right)^{-1/N} \\
&= \left( \prod_{t=1}^{N} q(x_t \mid x_{<t}) \right)^{-1/N}
\end{aligned}
$$
The last step uses $b^{\sum_t \log_b a_t} = \prod_t a_t$.
</details>

When the symbols are drawn independently from $p$ and scored by a fixed distribution $q$, the expected log loss is the cross-entropy $H_b(p, q)$. The corresponding population perplexity is:

$$
\boxed{\operatorname{PPL}_b(p, q) = b^{H_b(p, q)}}
$$

<details><summary>Proof</summary>
$$
\begin{aligned}
\mathbb{E}_{X \sim p}\left[ -\log_b q(X) \right]
&= -\sum_x p(x) \log_b q(x) \\
&= H_b(p, q)
\end{aligned}
$$
Exponentiating the expected log loss gives the population perplexity.
</details>

[^base]: The base of the exponent must match the base of the logarithm. Natural logarithms give $e^{H(p, q)}$; base $2$ logarithms give $2^{H(p, q)}$.

## Effective Number of Choices

Suppose a model is uniform over $K$ possible symbols. Every observed symbol receives probability $\frac{1}{K}$, so its log loss is $\log_b K$ and its perplexity is:

$$
\operatorname{PPL}_b = b^{\log_b K} = K
$$

This is the interpretation of perplexity in general. A perplexity of $K$ does not mean that the model literally chooses uniformly among $K$ symbols. It means that its average log loss is the same as a uniform distribution over $K$ symbols.

Use the distribution from the earlier post, $p = (\frac{1}{2}, \frac{1}{4}, \frac{1}{8}, \frac{1}{8})$. If the model is also $p$, then the cross-entropy is the entropy:

$$
H_2(p, p) = H_2(p) = 1.75 \text{ bits}
$$

$$
\operatorname{PPL}_2(p, p) = 2^{1.75} \approx 3.36
$$

The source has four symbols, but its effective number of choices is only about $3.36$, because the symbols are not equally likely. If instead $q$ is uniform over the four symbols, the earlier post found $H_2(p, q) = 2$ bits, so:

$$
\operatorname{PPL}_2(p, q) = 2^2 = 4
$$

The cross-entropy decomposition makes the penalty multiplicative:

$$
H_b(p, q) = H_b(p) + D_{KL, b}(p\|q)
$$

$$
\boxed{\operatorname{PPL}_b(p, q) = \operatorname{PPL}_b(p, p) \, b^{D_{KL, b}(p\|q)}}
$$

<details><summary>Proof</summary>
$$
\begin{aligned}
\operatorname{PPL}_b(p, q)
&= b^{H_b(p, q)} \\
&= b^{H_b(p) + D_{KL, b}(p\|q)} \\
&= b^{H_b(p)} \, b^{D_{KL, b}(p\|q)} \\
&= \operatorname{PPL}_b(p, p) \, b^{D_{KL, b}(p\|q)}
\end{aligned}
$$
The last step uses $H_b(p, p) = H_b(p)$.
</details>

Here, the extra $0.25$ bits from using the wrong distribution multiply perplexity by $2^{0.25} \approx 1.19$, taking $3.36$ to $4$. Perplexity can also exceed the size of the alphabet when $q$ is worse than uniform: it is an effective count, not an actual count.

## Language Models

For a language model, the conditioning changes at every position. A prefix determines a distribution over the next token, so a sequence follows one branch through a sequence of conditional distributions. The model probability of the whole sequence is the product of the probabilities assigned to the tokens that actually occurred.

The reciprocal of perplexity is the geometric mean of those assigned probabilities:

$$
\left( \prod_{t=1}^{N} q(x_t \mid x_{<t}) \right)^{1/N} = \frac{1}{\operatorname{PPL}(x_{1:N}; q)}
$$

So a perplexity of $20$ means that the model assigned a geometric mean probability of $\frac{1}{20}$ to the token that actually came next. It does not mean that the model's most likely token was correct $5\%$ of the time. Accuracy only records whether the observed token had the largest probability; perplexity uses the full probability assigned to it.

If $q$ assigns probability $0$ to a token that occurs, then the probability of the whole sequence is $0$, the log loss is infinite, and the perplexity is infinite. This is the sequence version of the support condition behind KL divergence.

Perplexity comparisons require the same test data and the same tokenization. Changing the tokenizer changes the events being predicted and also changes $N$, so perplexities computed over different token sequences are not directly comparable.

Perplexity contains no more information than average log loss. It changes the units. Log loss measures uncertainty in bits or nats per token; perplexity measures the same uncertainty as an effective branching factor.
