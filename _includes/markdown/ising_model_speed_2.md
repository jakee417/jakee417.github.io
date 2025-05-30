## Mojo ~ 1.27ms
[Mojo](https://docs.modular.com/mojo/) is a relatively newcomer to the scientific computing scene, but is quickly gaining popularity.

> Mojo codeblocks display as Python since markdown does not yet support Mojo highlighting.
{: .prompt-info }

First, we will need to import a variety of items from the standard library.


```python
from tensor import Tensor, TensorSpec, TensorShape
from utils.index import Index
from random import rand, random_float64
from math import exp
from benchmark import Report
import benchmark

alias data_type = DType.float32
```

Now, we can rewrite our functions in Mojo. First, we start with the `random_spin_field`:


```python
fn random_spin_field(N: Int, M: Int) -> Tensor[data_type]:
    var t = rand[data_type](N, M)
    for i in range(N):
        for j in range(M):
            if t[i, j] < 0.5:
                t[Index(i, j)] = -1
            else:
                t[Index(i, j)] = 1
    return t
```

Next, the internal `_ising_update` which takes the summation over the neighbors:


```python
@always_inline
fn _ising_update(inout field: Tensor[data_type], n: Int, m: Int, beta: Float32 = 0.4) -> None:
    var total = SIMD[data_type, 1]()
    var shape = field.shape()
    var N = shape[0]
    var M = shape[1]
    for i in range(n - 1, n + 2):
        for j in range(m - 1, m + 2):
            if i == n and j == m:
                continue
            total += field[i % N, j % M]
    var dE = 2 * field[n, m] * total
    if dE <= 0:
        field[Index(n, m)] *= -1
    elif exp(-dE * beta) > random_float64().cast[field.dtype]():
        field[Index(n, m)] *= -1
```

Lastly, we can define the `ising_step`:


```python
fn ising_step(inout field: Tensor[data_type]) -> None:
    var shape = field.shape()
    var N = shape[0]
    var M = shape[1]
    for n_offset in range(2):
        for m_offset in range(2):
            for n in range(n_offset, N, 2):
                for m in range(m_offset, M, 2):
                    _ising_update(field, n, m)
```

We can define a small benchmark function.


```python
@always_inline
fn bench() -> Report:
    var N = 200
    var M = 200
    var field = random_spin_field(N, M)

    @always_inline
    @parameter
    fn ising_step_fn():
        ising_step(field)

    return benchmark.run[ising_step_fn](max_runtime_secs=5)
```


```python
var report = bench()
# Print a report in Milliseconds
report.print("ms")
```

    ---------------------
    Benchmark Report (ms)
    ---------------------
    Mean: 1.2608148342977381
    Total: 2396.8090000000002
    Iters: 1901
    Warmup Mean: 1.492
    Warmup Total: 2.984
    Warmup Iters: 2
    Fastest Mean: 1.2608148342977381
    Slowest Mean: 1.2608148342977381
    


We see that Mojo runs a little bit slower than Numba without optimization.


```python
%%python
# A little magic to automatically write my blog :)
import subprocess

subprocess.run(["jupyter", "nbconvert", "--to", "markdown", "ising_model_speed_2.ipynb"])
subprocess.run("sed -i'' -e 's/```python/```python/g' ising_model_speed_2.md", shell=True)
```
