```python
import torch
from matplotlib import pyplot as plt
```

## Diffusion Language Models

### Motivation

Goal is to learn:

$$
\mathbb E_{x\sim p_{data}}[-\log p_\theta(x)] \approx \frac{1}{n} \sum_{i=1}^n -\log{p_\theta(x_i)}
$$

Which we can force a neural network to do by modeling

$$
p_\theta(x) = \frac{e^{f_{\theta}(x)}}{Z}, Z = \sum_{x \in \mathcal X} e^{f_\theta(x)}
$$

But $Z$ is exponential (i.e. $50257^{1024}$ for a 1024 sequence from gpt2)

#### Autoregressive

Attempts the factorization 

$$
p_{data}(x^1 x^2 \dots x^d) = p_{data}(x^1) p_{data}(x^2 \mid x^1) \dots p_{data}(x^d \mid x^1 \dots x^{d - 1})
$$

Only needing to learn $p_\theta(x^i \mid x^1 \dots x^{i-1}) \approx p_{data}(x^i \mid x^1 \dots x^{i-1})$

which can generate new sequence data from ancestral sampling.

#### What does diffusion do?
Instead of modeling the probability directly, model the ratio:

$$
\frac{p_\theta (y)}{p_\theta(x)} = \frac{e^{f_{\theta}(y)} / Z}{e^{f_{\theta}(x)} / Z} = \frac{e^{f_{\theta}(y)}}{e^{f_{\theta}(x)}}
$$

and somehow use these ratios to generate new sequences.

### Diffusion Process

#### Forward diffusion process (linear ode)

$$
\begin{align*}
\frac{dp_t}{dt} = Q_t p_t \quad p_0 \approx p_{data}
\end{align*}
$$

$Q$ is a transition matrix having columns sums of 0 (i.e. $\sum_j Q_{ij} = 0$) for example:

$$
\begin{align*}
Q_{uniform} = 
\begin{bmatrix} 
1 - N & 1 & \dots & 1 \\
1 & 1 - N & \dots & 1 \\
\vdots & \vdots & \ddots & \vdots \\
1 & 1 & \dots & 1 - N
\end{bmatrix}
\end{align*}
$$


```python
N = 3
Q = torch.ones(N, N) - torch.eye(N) * N
Q
```




    tensor([[-2.,  1.,  1.],
            [ 1., -2.,  1.],
            [ 1.,  1., -2.]])




```python
Q.sum(0)
```




    tensor([0., 0., 0.])




```python
p = torch.tensor([0.5, 0.3, 0.2])
```


```python
dpdt = Q @ p
dpdt
```




    tensor([-0.5000,  0.1000,  0.4000])




```python
dpdt.sum()
```




    tensor(-2.9802e-08)



#### Reversal Diffusion Process

$$
\begin{align*}
\frac{dp_{T - t}}{dt} = \bar Q_{T - t}p_{T - t} \\
\bar Q(y, x) = \frac{p_t(y)}{p_t(x)} Q_t(x, y) \\
\bar Q(x, x) = \sum_{x \neq y} \bar Q(y, x)
\end{align*}
$$

Last equation is like detailed balance.


```python
scores = p.view(1, -1) / p.view(-1, 1)
scores
```




    tensor([[1.0000, 0.6000, 0.4000],
            [1.6667, 1.0000, 0.6667],
            [2.5000, 1.5000, 1.0000]])




```python
Q_bar = (scores * Q).T
Q_bar = Q_bar - torch.diag(torch.diag(Q_bar))
Q_bar -= torch.diag(torch.sum(Q_bar, dim=0))
Q_bar
```




    tensor([[-1.0000,  1.6667,  2.5000],
            [ 0.6000, -2.3333,  1.5000],
            [ 0.4000,  0.6667, -4.0000]])



#### Concrete Score

$$
s(x)_y = \frac{p_t(y)}{p_t(x)}
$$

Related to score function for discrete probabilities $\nabla_x \log{p} = \frac{\nabla_x{p}}{p} \approx \frac{p(y) - p(x)}{p(x)} = \frac{p(y)}{p(x)} - 1 = s(x)_y - 1$

### Score Entropy

$$
\begin{align*}
\mathcal L_{SE} = \mathbb E_{x \sim p}[\sum_{y \neq x} w_{xy} \big(s_\theta(x)_y - \frac{p(y)}{p(x)} \log{s_\theta(x)_y} + K (\frac{p(y)}{p(x)}) \big)]
\end{align*}
$$

- $K(a) = a(\log{a} - 1)$ ensures $\mathcal L_{SE} >= 0$
- Built on bregman divergence $D_F(s(x)_y, \frac{p(y)}{p(x)})$, $F = -\log$
- gurantees non-negative, symmetric, and convex
- generalizes standard cross entropy from simplex value to positive values




```python
noise = torch.rand_like(scores).unsqueeze(0)
noise_schedule = torch.arange(0, 10).view(-1, 1, 1) * 20
noise = noise * noise_schedule
scores_hat = scores + noise
mask = torch.ones_like(scores) - torch.eye(scores.shape[-1])
L_se = scores_hat - scores * torch.log(scores_hat) 
K = scores * (torch.log(scores) - 1)
L_se += K
L_se *= mask
L_se = L_se.sum(dim=-1).mean(dim=-1)
torch.stack((noise_schedule.flatten(), L_se)).T.round(decimals=1)
```




    tensor([[  0.0000,   0.0000],
            [ 20.0000,  12.9000],
            [ 40.0000,  28.9000],
            [ 60.0000,  45.6000],
            [ 80.0000,  62.5000],
            [100.0000,  79.5000],
            [120.0000,  96.6000],
            [140.0000, 113.8000],
            [160.0000, 131.0000],
            [180.0000, 148.2000]])




```python
s = torch.logspace(-9, 1 / 1.5, steps=100)
true_ratio = 0.4
se_loss = s - true_ratio * torch.log(s)
plt.plot(s.numpy(), se_loss.numpy())
plt.axvline(x=true_ratio, color='r', linestyle='--', label='True Ratio')
plt.axhline(y=se_loss.min().item(), color='g', linestyle='--', label='Min Loss')
plt.legend()
plt.xlabel("s")
plt.ylabel("Score Entropy Loss")
plt.title("Score Entropy Loss")
plt.show()
```


    
![png](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAioAAAHHCAYAAACRAnNyAAAAOnRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjEwLjgsIGh0dHBzOi8vbWF0cGxvdGxpYi5vcmcvwVt1zgAAAAlwSFlzAAAPYQAAD2EBqD+naQAAUwxJREFUeJzt3Qd8VFX2wPGTXiFAChBS6F06KKAC0gRUQMGuoKvrKlZWXdH/KtiwlxXFDrqKoijqKoqIFJUOgvSilBACCS0hvf4/54aZJJBABpKZN5Pf9/N58ObNy3DzJsw7uffcc72KioqKBAAAwIK8Xd0AAACAihCoAAAAyyJQAQAAlkWgAgAALItABQAAWBaBCgAAsCwCFQAAYFkEKgAAwLIIVAAAgGURqAAAAMsiUAGcZP369TJq1CiJj4+XwMBAadSokQwcOFBee+01t3sPxo4dK15eXuVu+r2diTfeeEOmT58u7ky//zvvvNPVzQA8iq+rGwDUBEuWLJF+/fpJXFyc3HrrrdKgQQNJSEiQZcuWyauvvip33XWXuJuAgAB59913Tzru4+NzxoFKRESECYIAwIZABXCCp556SsLCwmTlypVSp06dMs8lJyc79T3IzMyU4ODgs34dX19fuf7668UVMjIyJCQkxCX/NgDnYugHcII///xT2rVrd1KQoqKiok469tFHH0mPHj1MQFG3bl258MIL5ccffzypB0JfU3s2oqOjZdy4cXL06NEy5/Tt21fat28vq1evNq+hr/fwww+b53JycuSxxx6T5s2bm9eIjY2VBx980ByvKjqUo8Mhv/32m4wfP14iIyNNgDFy5EhJSUmxn9e4cWPZuHGjLFq0yD6EpG0v/Rr63B133GGuV0xMzBlfh169eklQUJA0adJE3nzzTfs56enppm333HPPSd/H3r17TU/R5MmTqyTI+uc//2mut7a5VatW8sILL8iJC9nPmzdPzj//fPMzExoaas6zvXc2Omyo37vt56Rbt24yY8aMs24jYCX0qABOoHkpS5culQ0bNpgb5qlMmjRJJk6caG6ojz/+uPj7+8vy5cvl559/lkGDBplz9Hk9b8CAAXL77bfL1q1bZerUqabHRoMCPz8/++sdOnRIhgwZIldffbXpAalfv74UFhbKZZddJr/++qv8/e9/lzZt2pgcmpdfflm2bdsmX331VaW+r4MH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su0DAODBXBqoLFmyxKw/MGzYMHvW8SeffCIrVqxwZbOsTcf5SldkBADAg7l06EczkOfPn29fRlqnTWm5YK2sV1GJYU3AKb0BAADP5dIeFV20SYON1q1bm3UGNGdFF03ScsDl0SlbkyZNcno7AQBADexR0VK/H3/8scyYMcMUttFcFZ2fXVFxmwkTJpipTLYtISFBahydnqyVFXU71YqhAAB4AJf2qGiVO+1Vufrqq83jc845R3bv3m16TkqX6LXR8sKnW/OgRqholVAAADyMS3tUdKVIXaipNB0COrG0LwAAqJlc2qOipXw1JyUuLs5MT9YFlLTU78033+zKZgEAUKW0zHynTp3klVde4cq6U4+KLrakS03fcccdZl0DXdhIF1PSom8AAFiVrkasKxP/4x//OOm5cePGmef0HBtdvO9s721jx4416+3UNC4NVHS1SI0uNS8lKyvLrBb55JNPmuWmAQCwstjYWPn000/N/av0+jY6QURHCk5cKFDveXAca/0AAHAGdAViDVa0t8RG9zVI6dy580lDP/fee6/9sRY4ffrpp02qgwYw+jVvv/32Wb0PixYtkh49ephJJw0bNjSTVfLz8+3Pz5o1y0xa0SVrwsPDZcCAAZJxfPbowoULzdeGhIRInTp1pHfv3qYTwQoIVNyNJh/36VO8nZCIDACeIiM3o8ItOz+70udm5WVV6twzpYHGtGnT7I/ff/99sxRMZbz44ovSrVs3k5+pKRC33367bN269YzakZiYKEOHDpXu3bub4qm6PM17771nRilUUlKSXHPNNaa9mzdvNoHJ5ZdfbtbW02BGh5T69Okjf/zxhyxdulT+/ve/m+ErqenJtDgDQUEa+nLpAHi00MmhFT43tMVQ+e7akqVEol6Iksy88ss29InvIwvHlnxmNn61sRzMPHjSeUWPndliuNdff72p8WXrffjtt9/McJAGAqejgYUGKOpf//qXvPzyy7JgwQJp1aqVw+144403TO/OlClTTIChhVT37dtnXvfRRx81gYoGJBqcxMfHm6/R3hV1+PBhU5vskksuMYsDK80btQoCFQAAzlBkZKRZr2769Ommd0L3IyIiKvW1HTp0sO9rcNGgQQNJTk4+o3Zs3rxZevbsWaYXRIdv0tPTZe/evdKxY0fp37+/CU4GDx4sgwYNMpNZ6tata/JnNFFXjw8cONAM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)
    


#### Score entropy properties

- Consistency, $\mathcal L_{SE} = 0$ at $\theta^*$
- has log barrier that keeps $s_\theta \geq 0$
- can be made tractable by removing $\frac{p(y)}{p(x)}$ term

#### Implicit Score Entropy
**Remove $\frac{p(y)}{p(x)}$ but keep proportional to $L_{SE}$**:

$$
\mathcal L_{ISE} = \mathbb E_{x \sim p} [\sum_{y \neq x} w_{xy} s_\theta(x)_y - w_{yx} \log{s_\theta(y)_x}]
$$

Still not tractable due to $s_\theta(y)_x$ and $s_\theta(x)_y$ in the same sum


```python
L_ise = scores_hat - torch.log(scores_hat.transpose(-1, -2))
L_ise = L_ise * mask
L_ise = L_ise.sum(-1).mean(-1)
torch.stack([noise_schedule.flatten(), L_ise]).T.round(decimals=1)
```




    tensor([[  0.0000,   2.4000],
            [ 20.0000,  15.5000],
            [ 40.0000,  31.8000],
            [ 60.0000,  48.5000],
            [ 80.0000,  65.5000],
            [100.0000,  82.6000],
            [120.0000,  99.8000],
            [140.0000, 117.1000],
            [160.0000, 134.3000],
            [180.0000, 151.7000]])




```python
L_se - L_ise
```




    tensor([-2.4444, -2.5890, -2.8114, -2.9603, -3.0719, -3.1611, -3.2354, -3.2991,
            -3.3548, -3.4043])



#### Denoising Score Entropy
**Remove $s_\theta(y)_x$ term.** 

Suppose $p = \sum_{x_0} p(x \mid x_0)p_0(x_0)$ is a perturbation of $p_0$ (some base density):

$$
\mathcal L_{DSE} = \mathbb E_{\stackrel{x_0 \sim p_0}{x \sim p(\cdot \mid x_0)}} [\sum_{y \neq x} w_{xy} \big(s_\theta(x)_y - \frac{p(y \mid x_0)}{p(x \mid x_0)} \log{s_\theta(x)_y}\big)]
$$

- only involves $s_\theta(x)_y$
- $L_{DSE} \sim L_{SE}$ up to a constant
- $p_t$ are intermediate pertubations of $p_0$

### Diffusion Weighted Denoising Score Entropy
**Create an ELBO for $p^\theta_0 (x_0)$.** 

We can construct an ELBO for the data distribution $p_0$ using a weighted version of $\mathcal L_{DSE}$ with weights $w_{xy} = Q_t(x_t, y)$,

$$
\begin{align*}
\mathcal L_{DWDSE} &= \int_{0}^T \mathbb E_{x_t \sim p_{t\mid 0}(\cdot \mid x_0)} [
  \sum_{y \neq x} Q_t(x_t, y) \bigg( s_{\theta} (x_t, t)_y - \\ 
  & \frac{p_{t\mid 0}(y \mid x_0)}{p_{t\mid 0} (x_t \mid x_0)} \log{s_{\theta} (x_t, t)_y} + K \big(\frac{p_{t\mid 0}(y \mid x_0)}{p_{t\mid 0} (x_t \mid x_0)}  \big) \bigg) dt
] \\
& = \int_{0}^T \mathbb E_{x_t \sim p_{t\mid 0}(\cdot \mid x_0)} \bigg(\mathcal L_{DSE} + K \big(\frac{p_{t\mid 0}(y \mid x_0)}{p_{t\mid 0} (x_t \mid x_0)}  \big) \bigg) dt
\end{align*}
$$

which forms the ELBO:

$$
-\log{p^\theta_0 (x_0)} \leq \mathcal L_{DWDSE}(x_0) + D_{KL}(p_{T\mid 0}(\cdot \mid x_0) \mid\mid p_{base})
$$

#### Practical Implementation
Since $\mathcal X = \{1, \dots, n \}$ forming sequences $x = x^1 \dots x^d$, $Q_t$ would be exponential in size. Instead, change one token at a time (hamming distance 1),

$$
Q^{tok}_t (x^i, \hat x^i) = Q_t(x^1 \dots x^i \dots x^d, x^1 \dots \hat x^i \dots x^d) \\
(s_\theta(x^1 \dots x^i \dots x^d))_{i, \hat x^i} \approx \frac{p_t(x^1 \dots \hat x^i \dots x^d)}{p_t(x^1 \dots x^i \dots x^d)}
$$

leading towards the factorization


$$
p^{seq}_{t\mid 0}(\hat x, x) = \prod_{i=1}^d p^{tok}_{t\mid 0}(\hat x^i \mid x^i)
$$

Using $Q_t^{tok} = \sigma(t) Q^{tok}$ and cumulative noise $\bar \sigma(t) = \int_{0}^{t} \sigma(s)ds$, we have:

$$
p^{tok}_{t\mid 0}(\cdot \mid x) = \text{x-th column of } \exp(\bar \sigma(t) Q^{tok})
$$

$\bar \sigma(t)$ can be the log linear noise schedule $\bar \sigma(t) = -\log{1 - (1 - \epsilon T)}$ or geometric $\bar \sigma(t) = \sigma_{min}^{t - 1}\sigma_{max}^t$


```python
noise = lambda t, sigma: torch.pow(sigma, t)
noise(torch.arange(0, 1, 0.1), 1e-2)
```




    tensor([1.0000, 0.6310, 0.3981, 0.2512, 0.1585, 0.1000, 0.0631, 0.0398, 0.0251,
            0.0158])



#### Training Algorithm
Sample $x_0 \sim p_0$, $t \sim \mathcal U([0, T])$

Construct $x_t$ from $x_0$, $x_t^i \sim p_{t \mid 0}(\cdot \mid x_0^i) = \exp{(\bar \sigma (t) Q)_{x_0^i}}$

Compute and backpropogate:

$$
\hat{\mathcal{L}}_{DWDSE} = \sigma(t) \sum_{i=1}^d \sum_{y=1}^n (1 - \delta_{x_t^i}(y)) \big( s_\theta (x_t, t)_{i, y} - \frac{p_{t \mid 0}(y \mid x_0^i)}{p_{t \mid 0}(x_t^i \mid x_0^i)} \log{s_\theta (x_t, t)_{i, y}} \big)
$$

#### Sampling

##### Tau Leaping

$$
x_{t - \Delta t}^i \sim \delta_{x_t^i}(x_{t - \Delta t}^i) + \Delta t Q_t^{tok} (x_t^i, x_{t - \Delta t}^i) s_\theta(x_t, t)_{i, x_{t - \Delta t}^i}
$$

##### Tweedie $\tau$-leaping

$$
p_{t - \Delta t \mid  t}(x_{t - \Delta t} \mid  x_t)^{\text{tweedie}} = (\exp{(-\sigma_t^{\Delta t} Q s_\theta (x_t, t)_i)})_{x_{t - \Delta t}^i} \exp{(\sigma_t^{\Delta t} Q)(x_t^i, x_{t - \Delta t}^i)}
$$

#### Prompting & Infilling

$p_t(x^\Omega \mid x^{\bar \Omega} = y)$ can be recovered exactly:

$$
\begin{align*}
\frac{p_t(x^\Omega =z' \mid x^{\bar \Omega} = y)}{p_t(x^\Omega = z \mid x^{\bar \Omega} = y)} &= \frac{p_t(x^\Omega =z' \cap x^{\bar \Omega} = y) / p_t(x^{\bar \Omega} = y)}{p_t(x^\Omega =z \cap x^{\bar \Omega} = y) / p_t(x^{\bar \Omega} = y)} \\
&= \frac{p_t(x^\Omega =z' \cap x^{\bar \Omega} = y)}{p_t(x^\Omega =z \cap x^{\bar \Omega} = y)}
\end{align*}
$$
