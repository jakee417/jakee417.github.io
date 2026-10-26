import Mathlib.Analysis.Real.Sqrt
import Mathlib.Topology.Order.IntermediateValue
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.Push

/-!
# Paired vs. independent *t*-test: the uniform-domination threshold

Lean formalization of the characterization proved in `proof.pdf`
(companion note, "When is the paired *t*-test uniformly more powerful
than the independent two-sample *t*-test?").

## Scope

The noncentral *t* power function is introduced **axiomatically**.  The
axioms are exactly the analytic facts established in the paper:

* `power_strictMono_lambda` — strict monotonicity in the noncentrality
  (paper, Lemma 1, proved there by differentiating the integral
  representation);
* `power_lt_one`, `pairedPower_eventually_exceeds` — the deficit is
  positive and vanishes as the noncentrality grows (paper, Lemma 1);
* `pairedPower_strictMono`, `pairedPower_continuousOn` — regularity of
  `ρ ↦ Φ_{n-1}(λ/√(1-ρ))` (paper, Lemma 1 plus dominated convergence);
* `power_df_strictMono` — strict monotonicity in the degrees of freedom
  (paper, Lemma 2; Tang 1938);
* `rhoLambda_tendsto_tail`, `rhoLambda_tendsto_loc` — the two ends of the
  threshold function (paper, Propositions on the far tail, by Laplace's
  method, and on the local expansion).

From these inputs, everything else — the existence and uniqueness of the
per-alternative threshold `rhoLambda`, the main theorem
`uniform_domination_iff` (necessary and sufficient condition
`ρ ≥ ρ*`), strict domination above `ρ*`, the necessity of `ρ > 0`, and
the bounds `ρ_tail ≤ ρ*`, `ρ_loc ≤ ρ*` — is proved in full.
-/

open Real Filter Topology Set

noncomputable section

/-! ## The axiomatized power function -/

/-- The two-sided level-`α` noncentral *t* power function:
`power α ν lam = P(|T_ν(lam)| > c_ν)`, axiomatized. -/
axiom power (α : ℝ) (ν : ℕ) (lam : ℝ) : ℝ

/-- The two-sided critical values `c_ν` (only their positivity and values
enter the closed-form thresholds). -/
axiom crit (ν : ℕ) : ℝ

axiom crit_pos (ν : ℕ) : 0 < crit ν

/-- Second-order expansion coefficient `A(ν)` of the paper. -/
axiom Acoef (ν : ℕ) : ℝ

axiom Acoef_pos (ν : ℕ) : 0 < Acoef ν

/-- Paper, Lemma 1: power is strictly increasing in the noncentrality
on `[0, ∞)`. -/
axiom power_strictMono_lambda (α : ℝ) (ν : ℕ) :
    StrictMonoOn (power α ν) (Ici 0)

/-- Paper, Lemma 1: the deficit is everywhere positive. -/
axiom power_lt_one {α : ℝ} (hα : α ∈ Ioo 0 1) (ν : ℕ) (lam : ℝ) :
    power α ν lam < 1

/-- Paper, Lemma 2 (Tang 1938): at fixed noncentrality `≠ 0`, power is
strictly increasing in the degrees of freedom. -/
axiom power_df_strictMono {α : ℝ} (hα : α ∈ Ioo 0 1) {ν₁ ν₂ : ℕ}
    (hν : ν₁ < ν₂) {lam : ℝ} (hlam : lam ≠ 0) :
    power α ν₁ lam < power α ν₂ lam

/-! ## The paired power as a function of `ρ` -/

/-- Paired-test power at correlation `ρ` and noncentrality `lam`
(the independent test's noncentrality scale). -/
def pairedPower (α : ℝ) (n : ℕ) (ρ lam : ℝ) : ℝ :=
  power α (n - 1) (lam / Real.sqrt (1 - ρ))

/-- Paper, Lemma 1: paired power is strictly increasing in `ρ` on
`ρ < 1` (for `lam > 0`). -/
axiom pairedPower_strictMono {α : ℝ} (n : ℕ) {lam : ℝ} (hlam : 0 < lam) :
    StrictMonoOn (fun ρ => pairedPower α n ρ lam) (Iio 1)

/-- Continuity of the paired power in `ρ` on `[0, r]`, `r < 1`
(paper, Lemma 1 plus dominated convergence). -/
axiom pairedPower_continuousOn {α : ℝ} (n : ℕ) (lam : ℝ) {r : ℝ}
    (hr : r < 1) :
    ContinuousOn (fun ρ => pairedPower α n ρ lam) (Icc 0 r)

/-- Paper, Lemma 1 (deficit vanishes): as `ρ → 1⁻` the paired power
exceeds any prescribed level `< 1` (for `lam > 0`). -/
axiom pairedPower_eventually_exceeds {α : ℝ} (n : ℕ) {lam : ℝ}
    (hlam : 0 < lam) {t : ℝ} (ht : t < 1) :
    ∃ r ∈ Ioo (0 : ℝ) 1, t < pairedPower α n r lam

/-! ## Existence and uniqueness of the per-alternative threshold -/

/-- For every `lam > 0` there is a unique correlation in `(0, 1)` at
which the two tests have equal power. -/
theorem root_exists {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ} (hn : 2 ≤ n)
    {lam : ℝ} (hlam : 0 < lam) :
    ∃ ρ ∈ Ioo (0 : ℝ) 1, pairedPower α n ρ lam = power α (2 * n - 2) lam := by
  set f : ℝ → ℝ := fun ρ => pairedPower α n ρ lam with hf
  set target : ℝ := power α (2 * n - 2) lam with htarget
  have htarget1 : target < 1 := power_lt_one hα _ _
  have hf0 : f 0 = power α (n - 1) lam := by
    simp [hf, pairedPower]
  have h0 : f 0 < target := by
    rw [hf0, htarget]
    exact power_df_strictMono hα (by omega) (ne_of_gt hlam)
  obtain ⟨r, hr01, hrgt⟩ := pairedPower_eventually_exceeds n hlam htarget1
  have hmem : target ∈ Icc (f 0) (f r) := ⟨le_of_lt h0, le_of_lt hrgt⟩
  have hcont : ContinuousOn f (Icc 0 r) := by
    rw [hf]
    exact pairedPower_continuousOn (α := α) n lam hr01.2
  obtain ⟨ρ, hρIcc, hρeq⟩ :=
    intermediate_value_Icc (le_of_lt hr01.1) hcont hmem
  have hρ0 : ρ ≠ 0 := by
    rintro rfl
    exact (ne_of_lt h0) hρeq
  refine ⟨ρ, ⟨lt_of_le_of_ne hρIcc.1 (Ne.symm hρ0), lt_of_le_of_lt hρIcc.2 hr01.2⟩, hρeq⟩

/-- The threshold function `ρ_λ` of the paper: the unique correlation
at which the paired and independent tests have equal power against the
alternative with noncentrality `lam` (junk value `0` off the domain). -/
def rhoLambda (α : ℝ) (n : ℕ) (lam : ℝ) : ℝ :=
  if h : α ∈ Ioo (0 : ℝ) 1 ∧ 2 ≤ n ∧ 0 < lam then
    Classical.choose (root_exists h.1 h.2.1 h.2.2)
  else 0

theorem rhoLambda_spec {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ} (hn : 2 ≤ n)
    {lam : ℝ} (hlam : 0 < lam) :
    rhoLambda α n lam ∈ Ioo (0 : ℝ) 1 ∧
      pairedPower α n (rhoLambda α n lam) lam = power α (2 * n - 2) lam := by
  rw [rhoLambda, dif_pos ⟨hα, hn, hlam⟩]
  exact Classical.choose_spec (root_exists hα hn hlam)

theorem rhoLambda_eq_of_root {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) {lam ρ : ℝ} (hlam : 0 < lam) (hρ : ρ ∈ Iio 1)
    (hroot : pairedPower α n ρ lam = power α (2 * n - 2) lam) :
    ρ = rhoLambda α n lam := by
  obtain ⟨hmem, heq⟩ := rhoLambda_spec hα hn hlam
  have hmem' : rhoLambda α n lam ∈ Iio 1 := mem_Iio.mpr hmem.2
  exact (pairedPower_strictMono n hlam).injOn hρ hmem' (by rw [hroot, heq])

/-! ## The two closed-form ends of the threshold function -/

/-- Far-tail threshold (paper, Proposition on the tail):
`ρ_tail = 1 - ((n-1) + c_I²/2) / ((n-1) + c_P²)`. -/
def rhoTail (n : ℕ) : ℝ :=
  1 - ((n - 1 : ℝ) + crit (2 * n - 2) ^ 2 / 2) / ((n - 1 : ℝ) + crit (n - 1) ^ 2)

/-- Local threshold (paper, Proposition on the local expansion):
`ρ_loc = 1 - A(n-1)/A(2n-2)`. -/
def rhoLoc (n : ℕ) : ℝ :=
  1 - Acoef (n - 1) / Acoef (2 * n - 2)

/-- Paper, Proposition (far tail, Laplace): `ρ_λ → ρ_tail` as
`λ → ∞`. -/
axiom rhoLambda_tendsto_tail {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) :
    Tendsto (rhoLambda α n) atTop (𝓝 (rhoTail n))

/-- Paper, Proposition (local expansion): `ρ_λ → ρ_loc` as
`λ → 0⁺`. -/
axiom rhoLambda_tendsto_loc {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) :
    Tendsto (rhoLambda α n) (𝓝[>] 0) (𝓝 (rhoLoc n))

/-! ## The uniform threshold `ρ*` -/

/-- `ρ* = sup_{λ > 0} ρ_λ`. -/
def rhoStar (α : ℝ) (n : ℕ) : ℝ :=
  sSup (rhoLambda α n '' Ioi 0)

theorem bddAbove_range_rhoLambda {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) : BddAbove (rhoLambda α n '' Ioi 0) := by
  refine ⟨1, ?_⟩
  rintro _ ⟨lam, hlam, rfl⟩
  exact le_of_lt (rhoLambda_spec hα hn hlam).1.2

theorem rhoLambda_le_rhoStar {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) {lam : ℝ} (hlam : 0 < lam) :
    rhoLambda α n lam ≤ rhoStar α n :=
  le_csSup (bddAbove_range_rhoLambda hα hn) ⟨lam, hlam, rfl⟩

theorem rhoStar_le {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ} (hn : 2 ≤ n)
    {b : ℝ} (hb : ∀ lam > 0, rhoLambda α n lam ≤ b) :
    rhoStar α n ≤ b := by
  apply csSup_le
  · exact ⟨rhoLambda α n 1, 1, mem_Ioi.mpr one_pos, rfl⟩
  · rintro _ ⟨lam, hlam, rfl⟩
    exact hb lam hlam

/-! ## Main theorem -/

/-- **Necessary and sufficient condition** (paper, Theorem 1): the
paired test is uniformly more powerful than the independent test if
and only if `ρ ≥ ρ*`. -/
theorem uniform_domination_iff {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) {ρ : ℝ} (hρ : ρ < 1) :
    (∀ lam > 0, power α (2 * n - 2) lam ≤ pairedPower α n ρ lam) ↔
      rhoStar α n ≤ ρ := by
  constructor
  · intro hdom
    by_contra hcon
    push_neg at hcon
    have hnot : ¬ ∀ lam > 0, rhoLambda α n lam ≤ ρ := by
      intro hall
      exact (not_le_of_gt hcon) (rhoStar_le hα hn hall)
    push_neg at hnot
    obtain ⟨lam, hlam, hlt⟩ := hnot
    have hmemρ : ρ ∈ Iio (1 : ℝ) := hρ
    have hmemLam : rhoLambda α n lam ∈ Iio (1 : ℝ) :=
      mem_Iio.mpr (rhoLambda_spec hα hn hlam).1.2
    have hlt' : pairedPower α n ρ lam < pairedPower α n (rhoLambda α n lam) lam :=
      pairedPower_strictMono n hlam hmemρ hmemLam hlt
    rw [(rhoLambda_spec hα hn hlam).2] at hlt'
    exact absurd (hdom lam hlam) (not_le_of_gt hlt')
  · intro hstar lam hlam
    have hle : rhoLambda α n lam ≤ ρ :=
      le_trans (rhoLambda_le_rhoStar hα hn hlam) hstar
    have hmemρ : ρ ∈ Iio (1 : ℝ) := hρ
    have hmemLam : rhoLambda α n lam ∈ Iio (1 : ℝ) :=
      mem_Iio.mpr (rhoLambda_spec hα hn hlam).1.2
    have hmono : pairedPower α n (rhoLambda α n lam) lam ≤
        pairedPower α n ρ lam :=
      (pairedPower_strictMono n hlam).monotoneOn hmemLam hmemρ hle
    rwa [(rhoLambda_spec hα hn hlam).2] at hmono

/-- Above the threshold the domination is strict at every alternative
(paper, Theorem 1). -/
theorem strict_domination_of_rhoStar_lt {α : ℝ} (hα : α ∈ Ioo 0 1)
    {n : ℕ} (hn : 2 ≤ n) {ρ : ℝ} (hρ : ρ < 1)
    (hstar : rhoStar α n < ρ) {lam : ℝ} (hlam : 0 < lam) :
    power α (2 * n - 2) lam < pairedPower α n ρ lam := by
  have hlt : rhoLambda α n lam < ρ :=
    lt_of_le_of_lt (rhoLambda_le_rhoStar hα hn hlam) hstar
  have hmemρ : ρ ∈ Iio (1 : ℝ) := hρ
  have hmemLam : rhoLambda α n lam ∈ Iio (1 : ℝ) :=
    mem_Iio.mpr (rhoLambda_spec hα hn hlam).1.2
  have h : pairedPower α n (rhoLambda α n lam) lam <
      pairedPower α n ρ lam :=
    pairedPower_strictMono n hlam hmemLam hmemρ hlt
  rwa [(rhoLambda_spec hα hn hlam).2] at h

/-- **Necessity of positive correlation** (paper, Corollary): for
`ρ ≤ 0` the paired test is strictly dominated at every alternative. -/
theorem paired_lt_of_nonpos {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) {ρ : ℝ} (hρ : ρ ≤ 0) {lam : ℝ} (hlam : 0 < lam) :
    pairedPower α n ρ lam < power α (2 * n - 2) lam := by
  have hs1 : (1 : ℝ) ≤ Real.sqrt (1 - ρ) := by
    rw [Real.one_le_sqrt]
    linarith
  have hspos : 0 < Real.sqrt (1 - ρ) := lt_of_lt_of_le one_pos hs1
  have hdiv : lam / Real.sqrt (1 - ρ) ≤ lam := by
    rw [div_le_iff₀ hspos]
    exact le_mul_of_one_le_right hlam.le hs1
  have hmem1 : lam / Real.sqrt (1 - ρ) ∈ Ici (0 : ℝ) :=
    div_nonneg hlam.le (Real.sqrt_nonneg _)
  have hmem2 : lam ∈ Ici (0 : ℝ) := hlam.le
  have hmono : power α (n - 1) (lam / Real.sqrt (1 - ρ)) ≤
      power α (n - 1) lam :=
    (power_strictMono_lambda α (n - 1)).monotoneOn hmem1 hmem2 hdiv
  have hTang : power α (n - 1) lam < power α (2 * n - 2) lam :=
    power_df_strictMono hα (by omega) (ne_of_gt hlam)
  exact lt_of_le_of_lt hmono hTang

/-! ## The closed-form bounds on `ρ*` -/

/-- `ρ_tail ≤ ρ*`: the far-tail threshold is a rigorous lower bound
for the exact threshold (paper, Corollary). -/
theorem rhoTail_le_rhoStar {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) : rhoTail n ≤ rhoStar α n := by
  by_contra hcon
  push_neg at hcon
  have hev := (rhoLambda_tendsto_tail hα hn).eventually (Ioi_mem_nhds hcon)
  have hev2 := hev.and (eventually_gt_atTop (0 : ℝ))
  obtain ⟨lam, hgt, hlam⟩ := hev2.exists
  exact absurd (rhoLambda_le_rhoStar hα hn hlam) (not_le_of_gt hgt)

/-- `ρ_loc ≤ ρ*`: the local threshold is also a lower bound. -/
theorem rhoLoc_le_rhoStar {α : ℝ} (hα : α ∈ Ioo 0 1) {n : ℕ}
    (hn : 2 ≤ n) : rhoLoc n ≤ rhoStar α n := by
  by_contra hcon
  push_neg at hcon
  have hev := (rhoLambda_tendsto_loc hα hn).eventually (Ioi_mem_nhds hcon)
  have hev2 := hev.and self_mem_nhdsWithin
  obtain ⟨lam, hgt, hlam⟩ := hev2.exists
  exact absurd (rhoLambda_le_rhoStar hα hn hlam) (not_le_of_gt hgt)

end
