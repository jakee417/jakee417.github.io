---
title: Forward and Reverse KL Divergence
author: jake
date: 2026-10-15 23:28:00 -0700
categories: [Math]
tags: [mathematics, ai-assisted]
math: true
mermaid: true
markdown: kramdown
---

In [Entropy, Prefix Codes, and KL Divergence]({% link _reviews/entropy-prefix-codes-and-kl-divergence.md %}), $D_{KL}(p\|q)$ is the expected excess cost of coding a $p$ sequence with a $q$ code, and it is asymmetric. The asymmetry is the subject here. Let $p$ be a target distribution over responses $y$ and $\pi_\theta$ a model. The first argument of $D_{KL}$ is the distribution the expectation is taken under, so swapping the arguments changes what an imperfect $\pi_\theta$ is forced to do. This post condenses the argument of Jon Vet's [Forward and Reverse KL Divergence](https://www.jonvet.com/blog/forward-and-reverse-kl-divergence), following Hao (2026).[^nats]

[^nats]: Logs are natural in the post-training literature. Nothing below depends on the base.

## Forward KL

With $p$ as the first argument, the [KL divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence) is:

$$
D_{KL}(p\|\pi_\theta) = \sum_y p(y) \log \frac{p(y)}{\pi_\theta(y)}
$$

Expanding gives the cross-entropy decomposition from the earlier post:

$$
\boxed{D_{KL}(p\|\pi_\theta) = -H(p) - \sum_y p(y) \log \pi_\theta(y)}
$$

<details><summary>Proof</summary>
$$
\begin{aligned}
D_{KL}(p\|\pi_\theta) &= \sum_y p(y) \log \frac{p(y)}{\pi_\theta(y)} \\
&= \sum_y p(y) \log p(y) - \sum_y p(y) \log \pi_\theta(y) \\
&= -H(p) - \sum_y p(y) \log \pi_\theta(y)
\end{aligned}
$$
The first sum is the negative entropy, which gives the boxed form.
</details>

The expectation is under $p$: each $y$ is weighted by how often the target produces it. The penalty is visible term by term. Fix $y$ with $p(y) > 0$ and let $\pi_\theta(y) \to 0$: the term $p(y) \log \frac{p(y)}{\pi_\theta(y)} \to \infty$. A model that assigns no probability to something the target produces is charged without bound, so $\pi_\theta$ must put mass everywhere $p$ does. It must cover every mode of $p$, at the cost of spreading mass over all of them when it cannot match $p$ exactly. This is **mode-covering**.

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
\boxed{D_{KL}(p\|\pi) < \infty \implies \mathrm{supp}\, p \subseteq \mathrm{supp}\, \pi}

$$

$$
\boxed{D_{KL}(\pi\|p) < \infty \implies \mathrm{supp}\, \pi \subseteq \mathrm{supp}\, p}
$$

Within the support of $p$, the average is weighted by what $\pi_\theta$ actually generates, so an imperfect $\pi_\theta$ does best by concentrating on the largest modes of $p$ and ignoring the rest. This is **mode-seeking**.

If $\pi_\theta$ can represent $p$ exactly, there is no disagreement: both divergences are $0$ at $\pi_\theta = p$ and nowhere else. The directions differ only in which errors an imperfect model is charged for.

## Token Precision and Recall

The same asymmetry is the precision/recall tradeoff, seen by scoring the model on sampled tokens. Sample tokens from the true distribution and ask how much probability the model gives them, or sample tokens from the model and ask how much probability the truth gives them. The expected log scores are:

$$
\boxed{\mathbb{E}_{y \sim p}[\log \pi_\theta(y)] = -H(p) - D_{KL}(p\|\pi_\theta)}

$$

$$
\boxed{\mathbb{E}_{y \sim \pi_\theta}[\log p(y)] = -H(\pi_\theta) - D_{KL}(\pi_\theta\|p)}
$$

In the first identity $H(p)$ does not depend on $\theta$, so maximizing the expected log probability of tokens drawn from the true distribution is exactly minimizing forward KL. That is the soft form of recall: the audit runs over tokens the truth produces, and a true token the model rates near zero drags the average down without bound. The second identity is the precision side: reverse KL is the same kind of audit run over tokens the model produces, where a produced token the truth rates near zero is the expensive one, together with the model's own entropy term.

Threshold those scores at zero, produced or not produced, and the soft form becomes a statement about supports. Read $y$ as a single token: let $A$ be the tokens the target can produce and $B$ the tokens the model can produce:

$$
A = \mathrm{supp}\, p, \qquad B = \mathrm{supp}\, \pi_\theta
$$

Weighting each set by its own distribution gives the two quantities:

$$
\mathrm{Recall} = p(B), \qquad \mathrm{Precision} = \pi_\theta(A)
$$

$p(B)$ is the share of the target's mass that the model can reach at all, and $\pi_\theta(A)$ is the share of the model's mass that lands on the target. Then:

$$
\boxed{\mathrm{Recall} = 1 \iff A \subseteq B}

$$

$$
\boxed{\mathrm{Precision} = 1 \iff B \subseteq A}
$$

<details><summary>Proof</summary>
$p(B) = 1$ exactly when $p$ assigns no mass outside $B$, i.e. when every token with $p(y) > 0$ has $\pi_\theta(y) > 0$, which is $A \subseteq B$. The precision statement is the same argument with the two distributions exchanged: $\pi_\theta(A) = 1$ exactly when the model assigns no mass outside $A$, which is $B \subseteq A$.
</details>

These are the same two inclusions as in the support box above, read in the other direction. Perfect recall is exactly the condition that no forward term is infinite, and perfect precision is exactly the condition that no reverse term is infinite. Forward KL is the recall direction: it is audited on target draws, so the expensive error is a miss. Reverse KL is the precision direction: it is audited on model draws, so the expensive error is a false production. A model that cannot match $p$ exactly is choosing which error to pay.

## Training Strategies

The two directions are, up to constants, the losses of the standard post-training methods. What changes between methods is which divergence is optimized, and who supplies the samples it is averaged over.

### SFT

The training data is a fixed dataset of tokens drawn from $p$, and the loss is their negative log likelihood under the model:

$$
\mathcal{L}_{SFT} = -\sum_y p(y) \log \pi_\theta(y)
$$

By the Forward KL expansion:

$$
\boxed{\mathcal{L}_{SFT} = H(p) + D_{KL}(p\|\pi_\theta)}
$$

$H(p)$ does not depend on $\theta$, so SFT is forward KL minimization. The pull is toward $p$ regardless of where the model starts: the recall direction, covering the target at the cost of the model's prior modes, which is the proposed mechanism for its forgetting.

### KL-Regularized RL

The objective maximizes expected reward subject to staying near a frozen reference policy $\pi_{ref}$:

$$
J(\theta) = \sum_y \pi_\theta(y)\, r(y) - \beta D_{KL}(\pi_\theta\|\pi_{ref})
$$

Define the reward-tilted distribution:

$$
p^*(y) = \frac{\pi_{ref}(y) \exp(r(y)/\beta)}{Z}

$$

$$
Z = \sum_{y'} \pi_{ref}(y') \exp(r(y')/\beta)
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

### On-Policy Distillation

On-policy distillation keeps the teacher of SFT but the sampling of RL: responses are drawn from the student $\pi_\theta$ and scored by a teacher $\pi_T$. With the reverse KL loss, at sequence level:

$$
\mathcal{L}_{OPD} = \sum_y \pi_\theta(y) \left[ \log \pi_\theta(y) - \log \pi_T(y) \right] = D_{KL}(\pi_\theta\|\pi_T)
$$

No equivalence is needed; the loss is reverse KL by definition. The difference from RL is the signal: a teacher log probability for each generated token, instead of a scalar reward and a reference policy.

### Off Policy

The data is drawn from some other distribution $\mu$ (a teacher's samples, an older checkpoint, a fixed dataset) while the model being trained is $\pi_\theta$. Matching the model to that data by likelihood gives:

$$
-\sum_y \mu(y) \log \pi_\theta(y) = H(\mu) + D_{KL}(\mu\|\pi_\theta)
$$

So off-policy training is a forward KL problem toward whoever generated the data, whatever the method is called: the expectation is supplied by $\mu$, so the audit runs over the data's tokens, not the model's own. Recovering an on-policy expectation from such data requires the importance ratio:

$$
\mathbb{E}_{y \sim \pi_\theta}[f(y)] = \mathbb{E}_{y \sim \mu}\left[ \frac{\pi_\theta(y)}{\mu(y)} f(y) \right]
$$

The weights grow as the model drifts away from $\mu$, which is why practical methods clip them, or refresh the data and stay near on-policy.

## Summary

The direction of a KL divergence is a statement about who supplies the average. Forward KL averages over the target, so the model must become the target everywhere the target has mass. Reverse KL averages over the model, so the model must only be target-like where it already goes. That gives covering versus seeking, and is one proposed mechanism for SFT forgetting more than RL. It is not the whole story: the experiments discussed by Vet and Hao find that on-policy data itself reduces forgetting even when the KL penalty is weakened or its direction changed, so the sampling distribution is a separate mechanism from the direction of the divergence.

## References

- W. Hao. [SFT, RL, and On-Policy Distillation Through a Distributional Lens](https://nrehiew.github.io/blog/sft_rl_opd/), 2026.
- R. Agarwal et al. On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes, 2024.
- H. Chen et al. Retaining by Doing: The Role of On-Policy Data in Mitigating Forgetting, 2026.
