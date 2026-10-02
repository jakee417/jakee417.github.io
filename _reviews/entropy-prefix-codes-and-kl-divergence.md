---
title: Entropy, Prefix Codes, and KL Divergence
author: jake
date: 2026-10-01 21:00:00 -0700
categories: [Math]
tags: [mathematics]
math: true
mermaid: false
markdown: kramdown
---

Given a distribution $p$ over a finite alphabet, a [prefix code](https://en.wikipedia.org/wiki/Prefix_code) assigns each symbol a binary code word such that no code word is a prefix of another code word. The expected code word length of any such code is bounded below by the [entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)) of $p$. If the code is instead constructed from a different distribution $q$, the expected length increases by exactly the [KL divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence) $D_{KL}(p\|q)$. I have used these quantities before ([Least Action vs. Least Squares]({% link _posts/2024-02-04-least-action-least-squares.md %})), but never written down where the coding interpretation comes from.

## Prefix Codes

Each code word corresponds to a leaf in a binary tree, where the code word is the path from the root to the leaf (left = $0$, right = $1$) and the code word length is the depth of the leaf. A leaf at depth $l$ therefore occupies a fraction $2^{-l}$ of the full tree. Since code words cannot overlap, their fractions cannot exceed the whole tree, which gives **[Kraft's inequality](https://en.wikipedia.org/wiki/Kraft%27s_inequality)**:

$$
\sum_i 2^{-l_i} \leq 1
$$

We encode a sequence $x_1 x_2 \cdots x_n$ drawn i.i.d. from $p$ symbol by symbol. Given the $p$ sequence, symbol $i$ occurs on average a fraction $p_i$ of the time, so the expected code word length is:

$$
\mathbb{E}[l] = \sum_i p_i l_i
$$

## Entropy

Intuitively, a symbol with probability $p_i$ should be assigned length $-\log_2 p_i$[^base], since a leaf at this depth occupies a fraction $2^{-l_i} = p_i$ of the tree, exactly matching its frequency in the sequence. Substituting these lengths gives the **entropy**:

$$
H(p) = -\sum_i p_i \log_2 p_i
$$

**[Shannon's source coding theorem](https://en.wikipedia.org/wiki/Shannon%27s_source_coding_theorem)** says $H(p)$ is a lower bound on $\mathbb{E}[l]$ over all uniquely decodable codes, and the bound is tight to within one bit.

Consider the dyadic distribution $p = (\frac{1}{2}, \frac{1}{4}, \frac{1}{8}, \frac{1}{8})$ over symbols $\{a,b,c,d\}$. Then:

$$
H(p) = \frac{1}{2}(1) + \frac{1}{4}(2) + \frac{1}{8}(3) + \frac{1}{8}(3) = 1.75 \text{ bits}
$$

And the [Huffman code](https://en.wikipedia.org/wiki/Huffman_coding) $a = 0$, $b = 10$, $c = 110$, $d = 111$ has lengths $(1,2,3,3)$, achieving $\mathbb{E}[l] = 1.75$ exactly.

## KL Divergence

Now suppose the code is constructed from $q$ instead, so symbol $i$ is placed at depth $-\log_2 q_i$, but the sequence is still drawn from $p$. The expected length becomes:

$$
\mathbb{E}[l] = \sum_i p_i \big(-\log_2 q_i\big) = H(p, q)
$$

Which is the **cross-entropy**. Expanding:

$$
\begin{align}
H(p, q) &= -\sum_i p_i \log_2 q_i \\
&= -\sum_i p_i \log_2 p_i + \sum_i p_i \log_2 \frac{p_i}{q_i} \\
&= H(p) + D_{KL}(p\|q)
\implies \boxed{H(p, q) = H(p) + D_{KL}(p\|q)}
\end{align}
$$

where $D_{KL}(p\|q) = \sum_i p_i \log_2 \frac{p_i}{q_i}$ is the **KL divergence**. In tree terms: $D_{KL}$ is the expected excess depth from encoding a $p$ sequence with a $q$ tree, averaged over the leaves as $p$ visits them. Since the $p$ tree is optimal for a $p$ sequence, the excess is non-negative (Gibbs' inequality), and it is asymmetric: $D_{KL}(p\|q) \neq D_{KL}(q\|p)$, since swapping $p$ and $q$ swaps which tree is built and which sequence is encoded.

Using the earlier $p$ with a uniform $q = (\frac{1}{4}, \frac{1}{4}, \frac{1}{4}, \frac{1}{4})$: the $q$ tree is balanced with all depths $= 2$, so $\mathbb{E}[l] = 2$ bits. Then:

$$
D_{KL}(p\|q) = \frac{1}{2}\log_2 2 + \frac{1}{4}\log_2 1 + \frac{1}{8}\log_2\frac{1}{2} + \frac{1}{8}\log_2\frac{1}{2} = 0.5 + 0 - 0.125 - 0.125 = 0.25
$$

Which matches: $H(p,q) = 1.75 + 0.25 = 2$.

[^base]: The base of the logarithm is the size of the code alphabet. Base $2$ gives bits; natural log gives nats.
