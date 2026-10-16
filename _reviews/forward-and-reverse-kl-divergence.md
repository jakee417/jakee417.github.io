---
title: Forward and Reverse KL Divergence
author: jake
date: 2026-10-15 23:28:00 -0700
categories: [Math]
tags: [mathematics]
math: true
mermaid: true
markdown: kramdown
---

In [Entropy, Prefix Codes, and KL Divergence]({% link _reviews/entropy-prefix-codes-and-kl-divergence.md %}), $D_{KL}(p\|q)$ is the expected excess cost of coding a $p$ sequence with a $q$ code, and it is asymmetric. The asymmetry is the subject here. Let $p$ be a target distribution over responses $y$ and $\pi_\theta$ a model. The first argument of $D_{KL}$ is the distribution the expectation is taken under, so swapping the arguments changes what an imperfect $\pi_\theta$ is forced to do. This post condenses the argument of Jon Vet's [Forward and Reverse KL Divergence](https://www.jonvet.com/blog/forward-and-reverse-kl-divergence), following Hao (2026).[^nats]

[^nats]: Logs are natural in the post-training literature. Nothing below depends on the base.

## Forward KL

Supervised fine-tuning minimizes the negative log likelihood of the target data:

$$
\mathcal{L}_{SFT} = -\sum_y p(y) \log \pi_\theta(y)
$$

Expanding the [KL divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence) in this direction gives the cross-entropy decomposition from the earlier post:

$$
\boxed{\mathcal{L}_{SFT} = H(p) + D_{KL}(p\|\pi_\theta)}
$$

<details><summary>Proof</summary>
$$
\begin{aligned}
D_{KL}(p\|\pi_\theta) &= \sum_y p(y) \log \frac{p(y)}{\pi_\theta(y)} \\
&= \sum_y p(y) \log p(y) - \sum_y p(y) \log \pi_\theta(y) \\
&= -H(p) + \mathcal{L}_{SFT}
\end{aligned}
$$
The first sum is the negative entropy and the second is the SFT loss, so rearranging gives the boxed identity.
</details>

$H(p)$ does not depend on $\theta$, so minimizing the SFT loss is minimizing the **forward KL** $D_{KL}(p\|\pi_\theta)$.

The penalty is visible term by term. Fix $y$ with $p(y) > 0$ and let $\pi_\theta(y) \to 0$: the term $p(y) \log \frac{p(y)}{\pi_\theta(y)} \to \infty$. A model that assigns no probability to something the target produces is charged without bound, so $\pi_\theta$ must put mass everywhere $p$ does. It must cover every mode of $p$, at the cost of spreading mass over all of them when it cannot match $p$ exactly. This is **mode-covering**.

## Reverse KL

Swap the arguments:

$$
\boxed{D_{KL}(\pi_\theta\|p) = -H(\pi_\theta) - \sum_y \pi_\theta(y) \log p(y)}
$$

<details><summary>Proof</summary>
$$
\begin{aligned}
D_{KL}(\pi_\theta\|p) &= \sum_y \pi_\theta(y) \log \frac{\pi_\theta(y)}{p(y)} \\
&= \sum_y \pi_\theta(y) \log \pi_\theta(y) - \sum_y \pi_\theta(y) \log p(y) \\
&= -H(\pi_\theta) - \sum_y \pi_\theta(y) \log p(y)
\end{aligned}
$$
The first sum is the negative entropy of the model, which gives the boxed form.
</details>

Both terms now depend on $\theta$; neither is a constant to discard. The expectation is under $\pi_\theta$ itself. If $\pi_\theta(y) \approx 0$, the term for $y$ is $\approx 0$ whatever $p(y)$ is, so dropping a mode of $p$ costs nothing directly. If $\pi_\theta(y) > 0$ where $p(y) = 0$, the term is infinite. The support constraint is exactly reversed:

$$
\boxed{D_{KL}(p\|\pi) < \infty \implies \mathrm{supp}\, p \subseteq \mathrm{supp}\, \pi, \qquad D_{KL}(\pi\|p) < \infty \implies \mathrm{supp}\, \pi \subseteq \mathrm{supp}\, p}
$$

Within the support of $p$, the average is weighted by what $\pi_\theta$ actually generates, so an imperfect $\pi_\theta$ does best by concentrating on the largest modes of $p$ and ignoring the rest. This is **mode-seeking**.

If $\pi_\theta$ can represent $p$ exactly, there is no disagreement: both divergences are $0$ at $\pi_\theta = p$ and nowhere else. The directions differ only in which errors an imperfect model is charged for.

## KL-Regularized RL

The KL-regularized RL objective maximizes expected reward subject to staying near a frozen reference policy $\pi_{ref}$:

$$
J(\theta) = \sum_y \pi_\theta(y)\, r(y) - \beta D_{KL}(\pi_\theta\|\pi_{ref})
$$

Define the reward-tilted distribution:

$$
p^*(y) = \frac{\pi_{ref}(y) \exp(r(y)/\beta)}{Z}, \qquad Z = \sum_{y'} \pi_{ref}(y') \exp(r(y')/\beta)
$$

$\pi_{ref}$ is not itself the target; together with $r$ it defines the tilted target. Then:

$$
\boxed{J(\theta) = -\beta D_{KL}(\pi_\theta\|p^*) + \beta \log Z}
$$

<details><summary>Proof</summary>
$$
\begin{aligned}
D_{KL}(\pi_\theta\|p^*) &= \sum_y \pi_\theta(y) \log \frac{\pi_\theta(y)}{p^*(y)} \\
&= \sum_y \pi_\theta(y) \left[ \log \frac{\pi_\theta(y)}{\pi_{ref}(y)} - \frac{r(y)}{\beta} + \log Z \right] \\
&= D_{KL}(\pi_\theta\|\pi_{ref}) - \frac{1}{\beta} \sum_y \pi_\theta(y)\, r(y) + \log Z
\end{aligned}
$$
Multiplying by $-\beta$ and adding $\beta \log Z$ gives $J(\theta)$.
</details>

$\beta \log Z$ does not depend on $\theta$, so maximizing reward with a KL penalty is minimizing the **reverse KL** to that tilted target. The model is charged only on responses it generates, and charged for generating responses the target rates low.

## On-Policy Distillation

On-policy distillation keeps the teacher of SFT but the sampling of RL: responses are drawn from the student $\pi_\theta$ and scored by a teacher $\pi_T$. With the reverse KL loss, at sequence level:

$$
\mathcal{L}_{OPD} = \sum_y \pi_\theta(y) \left[ \log \pi_\theta(y) - \log \pi_T(y) \right] = D_{KL}(\pi_\theta\|\pi_T)
$$

No equivalence is needed; the loss is reverse KL by definition. The difference from RL is the signal: a teacher log probability for each generated token, instead of a scalar reward and a reference policy.

The direction of a KL divergence is a statement about who supplies the average. Forward KL averages over the target, so the model must become the target everywhere the target has mass. Reverse KL averages over the model, so the model must only be target-like where it already goes. That gives covering versus seeking, and is one proposed mechanism for SFT forgetting more than RL. It is not the whole story: the experiments discussed by Vet and Hao find that on-policy data itself reduces forgetting even when the KL penalty is weakened or its direction changed, so the sampling distribution is a separate mechanism from the direction of the divergence.

## References

- W. Hao. [SFT, RL, and On-Policy Distillation Through a Distributional Lens](https://nrehiew.github.io/blog/sft_rl_opd/), 2026.
- R. Agarwal et al. On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes, 2024.
- H. Chen et al. Retaining by Doing: The Role of On-Policy Data in Mitigating Forgetting, 2026.
