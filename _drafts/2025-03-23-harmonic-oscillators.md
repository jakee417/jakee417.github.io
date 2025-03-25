---
title: Harmonic Oscillators
author: jake
date: 2025-03-23 12:00:00 +0800
categories: [Physics]
tags: [physics, mathematics]
math: true
mermaid: false
markdown: kramdown
image:
  path: assets/img/custom/rlc.png
  alt: Mechanical and electrical oscillators
---

A weight on a spring has a mathematical similarity with an electrical circuit consisting of a capacitor and inductor (LC). They are both examples of a harmonic oscillator which exhibit a sinusoidal behavior through time.

## Hamiltonian Review
Briefly, the Hamiltonian is the total energy in a system:

$$
H = T + V
$$

Where $T$ is kinetic energy and $V$ is potential energy. The Lagrangian is the difference of these energies:

$$
\mathcal L = T - V
$$

More accurately, the Lagrangian is any function that accurately describes a physical law when inputting it into the [Euler Lagrange equations](https://en.wikipedia.org/wiki/Euler%E2%80%93Lagrange_equation):

$$
\frac{\partial \mathcal L}{\partial x} - \frac{d}{dt} \frac{\partial \mathcal L}{\partial (\frac{dx}{dt})} = 0
$$

$L = T - V$ is the classic manifestation of this rule and will be sufficient for our purposes.

I have written about Lagrangians & Hamiltonians in previous posts ([Lagrangians]({% link _posts/2024-02-04-least-action-least-squares.md %}), [Hamiltonians]({% link _posts/2024-02-13-hamiltonian-mechanics.md %}), [Lagrangians & physics fields]({% link _posts/2024-10-29-score-functions.md %})), refer to these for a more explanation.

## Mechanical Harmonic Oscillator
Given a spring applying a force $F = -Kx$ to a mass $m$, we can write the Hamiltonian and Lagrangian as:

$$
\begin{flalign*}
H = T + V = \frac{1}{2}m(\frac{dx}{dt})^2 + \frac{1}{2}Kx^2 \\
L = T - V = \frac{1}{2}m(\frac{dx}{dt})^2 - \frac{1}{2}Kx^2
\end{flalign*}
$$

Which gives the following Euler Lagrange Equation:

$$
\frac{\partial \mathcal L}{\partial x} - \frac{d}{dt} \frac{\partial \mathcal L}{\partial (\frac{dx}{dt})} = -Kx - m \frac{d^2x}{dt^2} = 0
$$

Which is just Newton's second law:

$$
-Kx = m \frac{d^2x}{dt^2} \implies F = ma
$$

If we were to solve this second order linear differential equation, we would get a wave:

$$
\begin{gather*}
x(t) = A \sin{(\omega t + \phi)} \\ 
\omega = \sqrt{\frac{K}{m}}
\end{gather*}
$$

Finally, we have conservation of energy by showing $\frac{dH}{dt} = 0$:

$$
\begin{flalign*}
\frac{dH}{dt} &= \frac{\partial H}{\partial t} + \frac{\partial H}{\partial x}\frac{\partial x}{\partial t} + \frac{\partial H}{\partial (\frac{dx}{dt})} \frac{d^2 x}{dt^2} \\
\frac{dH}{dt} &= 0 + Kx \frac{dx}{dt} + m \frac{dx}{dt} \frac{d^2 x}{dt^2} \\
\frac{dH}{dt} &= \frac{dx}{dt}(Kx  + m \frac{d^2 x}{dt^2}) = 0
\end{flalign*}
$$

Where the last equality comes directly from the Euler Lagrange Equation (or Newton's second law).

## Electrical Harmonic Oscillator
The circuit will consist of the elements:
- Capacitor $C$ with charge $Q$
- Inductor $L$

> This is an idealized circuit without any resistance ($R$). We can add $R$ back in to form an [RLC circuit](https://en.wikipedia.org/wiki/RLC_circuit) which has [different expressions for Lagrangian and Hamiltonian](https://www.researchgate.net/publication/347363053_The_Lagrangian_and_Hamiltonian_for_RLC_Circuit_Simple_Case).
{: .prompt-info }

These components will have the following relationships:

$$
\begin{flalign*}
I &= -\frac{dQ}{dt} \\
Q &= CV \\
V &= L \frac{dI}{dt} + RI
\end{flalign*}
$$
