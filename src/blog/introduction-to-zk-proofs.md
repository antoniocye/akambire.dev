---
title: "A Gentle Introduction to Zero-Knowledge Proofs"
date: "2024-01-15"
description: "What are ZK proofs, why do they matter, and how Schnorr's protocol works under the hood."
tags: [cryptography, math, zk-proofs]
---

Zero-knowledge proofs are one of the most elegant constructions in modern cryptography. They let you prove you know something without revealing what that something is. At first glance this sounds paradoxical — but it's not, and understanding why is deeply satisfying.

## The Classic Example: Where's Waldo?

Imagine I claim to have found Waldo in a *Where's Waldo?* book. You don't believe me, but I don't want to show you exactly where he is (maybe I want to sell the information). Can I convince you I know without revealing the location?

Yes. I take the book, cut out a small window around Waldo, and show you *just* Waldo through the hole — not the surrounding context that would tell you where he is. You see Waldo, you're convinced I know, and I've revealed nothing about his coordinates.

This is a zero-knowledge proof: **completeness** (if I know, I can convince you), **soundness** (if I don't know, I can't convincingly lie), and **zero-knowledge** (you learn nothing beyond the fact that I know).

## Formal Definition

A zero-knowledge proof is an interactive protocol between a **prover** $P$ and a **verifier** $V$ for a language $L$. For a statement $x \in L$ with witness $w$:

- **Completeness**: If $P$ knows $w$, then $V$ accepts with overwhelming probability.
- **Soundness**: If $x \notin L$, no cheating prover can convince $V$ to accept, except with negligible probability.
- **Zero-knowledge**: The verifier's view can be *simulated* without knowing $w$. Formally, there exists a PPT simulator $S$ such that for all $(x, w)$:

$$\text{View}_V[P(x,w) \leftrightarrow V(x)] \approx_c S(x)$$

That last condition is the key one. "Zero-knowledge" means the interaction reveals no computational information beyond the validity of the statement.

## Schnorr's Protocol

Let me show a concrete example: proving knowledge of a discrete logarithm.

**Setup**: We're in a cyclic group $\mathbb{G}$ of prime order $q$ with generator $g$. The prover knows $x$ such that $y = g^x$. They want to prove this without revealing $x$.

**Protocol**:

1. **Commit**: Prover picks random $r \leftarrow \mathbb{Z}_q$, computes $R = g^r$, sends $R$.
2. **Challenge**: Verifier sends random challenge $c \leftarrow \mathbb{Z}_q$.
3. **Response**: Prover computes $s = r + cx \pmod{q}$, sends $s$.
4. **Verify**: Verifier checks $g^s = R \cdot y^c$.

**Why does verification pass?**

$$g^s = g^{r+cx} = g^r \cdot g^{cx} = R \cdot (g^x)^c = R \cdot y^c \checkmark$$

**Zero-knowledge**: Given any challenge $c$, we can simulate a transcript by picking $s$ randomly, computing $R = g^s \cdot y^{-c}$, and outputting $(R, c, s)$. This is indistinguishable from a real transcript — the prover's randomness $r$ makes real responses uniformly distributed over $\mathbb{Z}_q$.

## From Interactive to Non-Interactive

Schnorr's protocol requires interaction (the verifier sends a fresh challenge). But in many applications (like digital signatures), we want non-interactive proofs.

The **Fiat-Shamir transform** achieves this using a hash function $H$ modeled as a random oracle. Instead of getting a challenge from the verifier, the prover computes:

$$c = H(y \| R)$$

The resulting signature $(R, s)$ is a non-interactive zero-knowledge proof (NIZK). This is essentially how **Schnorr signatures** work — and they're provably secure in the random oracle model.

## Why This Matters

ZK proofs went from a theoretical curiosity to a practical tool at remarkable speed:

- **zk-SNARKs** (Succinct Non-interactive ARguments of Knowledge) allow proving the correct execution of arbitrary computations with tiny proofs (~200 bytes) that verify in milliseconds.
- **Zcash** uses Groth16, a pairing-based zk-SNARK, to enable private transactions.
- **zkEVM** projects (StarkNet, zkSync, Polygon zkEVM) use ZK proofs to compress Ethereum transaction batches, enabling scaling.
- **Zupass** and similar systems use ZK proofs for privacy-preserving identity: prove you're over 18 without revealing your birthday.

This summer I taught a class on Groth16 at Mathcamp to high school students. Seeing people grasp why a polynomial commitment scheme gives you a succinct proof — that moment of "oh, *that's* how it works" — is one of the best feelings in math education.

## Further Reading

If you want to go deeper:

- *Proofs, Arguments, and Zero-Knowledge* by Justin Thaler — free online, comprehensive
- Dan Boneh's CS355 notes (Stanford) — rigorous treatment
- The original Schnorr (1989) and Fiat-Shamir (1986) papers
- Groth16 paper: "On the Size of Pairing-Based Non-Interactive Arguments" (2016)
