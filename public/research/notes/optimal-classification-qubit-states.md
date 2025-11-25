# Quantum Learning: Optimal Classification of Qubit States

*Notes based on the template from Evolution Strategies at Scale*

## Overview

This paper develops a **quantum analogue of classical classification**, focusing on the problem of classifying **two arbitrary unknown qubit states**. By using a number of labelled copies (training set), the goal is to design a **measurement strategy** that learns from the training data and then classifies future unknown systems with minimal error. The authors establish the **asymptotically optimal classification strategy**, prove that it outperforms plug-in strategies based on state estimation, and compute the **exact minimax excess risk**, which converges at a rate of \( n^{-1} \).

---

## Key Points

### Main Concepts

* Introduces **quantum classification** as the analogue of classical pattern recognition: instead of feature vectors, the "data" are quantum states (density matrices).
* Focuses on **two unknown qubit states**, \( \rho \) and \( \sigma \), with priors \( \pi_0, \pi_1 \).
* Performance is measured by **excess risk**: the difference between the expected error and the error of the optimal Helstrom measurement (when states are known).
* Proves that **directly learning the Helstrom measurement** is asymptotically optimal, outperforming indirect plug-in methods.

---

## Methodology

* **Local Asymptotic Normality (LAN)**: The central technical tool.
* LAN approximates the collective state of \( n \) i.i.d. qubits by a Gaussian model involving both **classical** and **quantum harmonic oscillator** components.
* Allows reformulation of classification as a **Gaussian parameter estimation** problem.
* **Local minimax risk**: Instead of global worst-case, focus on small \( n^{-1/2+\varepsilon} \) neighbourhoods of parameters for refined asymptotic analysis.
* **Training set**: \( n \) copies of each state with labels; a small subset is used for rough localisation, the rest for optimal collective measurement.
* **Measurement strategies**:
  1. **Plug-in**: Estimate \( \rho \) and \( \sigma \) first, then apply Helstrom on the estimates.
  2. **Direct**: Estimate the Helstrom projection \( P^* \) directly from the training data.

The latter achieves strictly lower asymptotic excess risk.

---

## Results

### Main Theoretical Results

* **Theorem 5.1**: Provides the exact expression of the **local minimax excess risk** for the optimal classifier (Eq. 27), which depends on the Bloch vectors of \( \rho_0, \sigma_0 \), priors, and their geometric relation.
* **Theorem 5.2**: Computes the asymptotic risk of the **plug-in classifier** and shows that it is strictly higher unless the Bloch vectors are parallel.

### Rates

* Excess risk decays as \( n^{-1} \) — analogous to classical smooth regression models, not discrete margin-bounded cases.
* This is slower than exponential convergence (as in certain classical binary discrete models) but is **optimal** for the continuous quantum setting.

### Measurement Strategy

* Optimal strategy involves:
  1. Rough localisation.
  2. LAN transfer to Gaussian model.
  3. **Coherent joint measurement** of non-commuting variables \( ( Q^{(l)}, Q^{(k)} ) \) via heterodyne-like schemes.
  4. Combining quantum and classical components for optimal estimation of the relevant 2D parameter.

---

## Implications

* Demonstrates a **fundamental quantum advantage**: Directly learning the optimal measurement yields better asymptotic performance than classical plug-in analogues.
* Provides a **general methodology** for reducing complex quantum learning problems to **Gaussian estimation**, potentially extendable to:
  * Multi-class classification
  * Quantum hypothesis testing with unknown states
  * Quantum channel discrimination
* Highlights **incompatibility between estimation and classification** tasks in quantum settings — different optimal measurements for each.

---

## Questions & Thoughts

* How scalable is this method beyond two states? Can the LAN technique handle \( k \)-class classification efficiently?
* Could adaptive measurements achieve the same minimax constant without full collective measurements?
* How might this strategy translate into NISQ-era experiments where collective measurements are limited?

---

## References

* Helstrom, C. W. (1976). *Quantum Detection and Estimation Theory*.
* Guță & Kahn (2006); Guță & Jencova (2007) — LAN for quantum states.
* Vapnik (1998) — Statistical Learning Theory.
* Sasaki & Carlini (2002); Bergou & Hillery (2005) — early quantum classifiers.

---

## Reading Progress

* [x] Abstract
* [x] Introduction
* [x] Methodology
* [x] Results
* [x] Discussion
* [x] Conclusion

---

## Detailed Notes

### Classical vs Quantum Learning

* Classical classification: Learn \( h_n(x) \) to minimise excess risk \( R(h_n) = P_e(h_n) - P_e(h^*) \).
* Quantum: Replace distributions with density matrices, classifiers with POVMs, Bayes classifier with Helstrom measurement. Excess risk similarly defined via trace distance between optimal and learned POVMs.

### LAN for Qubits

* Bloch vector decomposition: \( \rho_{\vec r} = \frac{1}{2}(1+\vec r \cdot \vec\sigma) \).
* For \( n \) copies, rescale local parameters by \( 1/\sqrt{n} \) around a fixed state.
* LAN mapping: \( n \) qubits → Gaussian shift model with 3 classical/quantum coordinates \( (u1,u2,u3) \).
* Quantum variables \( (u1,u2) \) map to oscillator quadratures Q,P; classical u3 to Gaussian random variable.

### Quadratic Loss Formulation

* Excess risk reduced to quadratic loss in **two-dimensional orthogonal subspace** to optimal projection vector.
* Optimal measurement corresponds to minimum mean-square estimation of this subvector in the Gaussian model.

### Plug-in vs Direct

* Plug-in: Estimation + projection. Adds heterodyne noise separately for each state.
* Direct: Estimates relevant sub-parameter jointly, exploiting correlations — lower risk.
* Risk gap depends on relative Bloch vector orientation.

---

**Status:** Read - Foundational for learning quantum machine learning, understanding how to translate conventional ml to quantum ml
**Read Date:** Februrary 2025