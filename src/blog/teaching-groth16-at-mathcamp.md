---
title: "Teaching Groth16 at Mathcamp"
date: "2025-08-15"
description: "Reflections on teaching a zero-knowledge proof system to mathematically gifted high schoolers, and what I learned about explaining hard things simply."
tags: [math, teaching, zk-proofs, mathcamp]
---

This past summer I was a Junior Counselor at Canada/USA Mathcamp — a five-week residential program for mathematically exceptional high school students. One of the JC responsibilities is teaching a class. I taught a class on the Groth16 zero-knowledge proof system.

I want to write about what that experience taught me about teaching difficult mathematics.

## Who the Students Were

Mathcamp students are not typical high schoolers. They've typically exhausted their school's math offerings years earlier. Many have done competitions (USAMO, Putnam at 15, IMO). But more than competition preparation, what distinguishes them is *curiosity* — a willingness to sit with a hard idea until it clicks.

My class had students ranging from 14 to 17. Several already knew some abstract algebra and basic number theory. A few had seen elliptic curves. None had seen zero-knowledge proofs.

## The Challenge: Groth16 Is Not Simple

Groth16 is a pairing-based zk-SNARK. To understand it properly, you need:

- Arithmetic circuits and R1CS constraint systems
- Polynomial commitments (specifically, KZG commitments over bilinear groups)
- The "knowledge of exponent" assumption
- Pairing-based cryptography ($e: \mathbb{G}_1 \times \mathbb{G}_2 \to \mathbb{G}_T$)
- The trusted setup ceremony

I had five 45-minute sessions. This was ambitious.

## What I Tried (and What Failed)

My first instinct was to teach bottom-up: groups, pairings, KZG, then Groth16. Classic math pedagogy: build the foundations, then the structure.

**Day 1 bombed.** I spent the whole session on elliptic curve groups. The students were engaged but by the end they had no idea why we were doing this. "What's this for?" is a terrible question to hear at the end of a class.

I had to rethink.

## The Inversion: Show the Punchline First

I remembered something from my own math education: the most memorable explanations I'd received started with the *surprising thing*, then explained how you get there.

**Day 2**, I opened with the Groth16 verifier equation:

$$e(A, B) = e(\alpha, \beta) \cdot e\left(\sum_{i=0}^{l} a_i \cdot \left(\frac{\beta u_i(x) + \alpha v_i(x) + w_i(x)}{\gamma}\right), \gamma\right) \cdot e(C, \delta)$$

I said: "This is what the verifier checks. It takes about 5ms. The proof is 3 group elements — 192 bytes. And it proves that you correctly ran an arbitrary computation without revealing any private inputs. We're going to understand every symbol here."

Now they were hooked. *Now* the technical machinery had a purpose.

## Teaching Polynomial Magic

The hardest conceptual leap was polynomial commitment schemes. The key idea: if I can evaluate a polynomial $p(x)$ at a *secret* point $\tau$ (one I don't know), and give you the committed evaluation $p(\tau) \cdot G$, you can verify properties of $p$ without me ever revealing $p$ or $\tau$.

The trick I used: I told them about the **toxic waste** in the Zcash trusted setup.

The trusted setup for Groth16 generates public parameters containing $\{G, \tau G, \tau^2 G, \ldots, \tau^n G\}$ where $\tau$ is a secret. After the setup, $\tau$ must be deleted — hence "toxic waste." If anyone knows $\tau$, they can forge proofs for false statements.

This story made the abstraction concrete. Students immediately started asking: "What if the person doing the setup is malicious?" That question led naturally into multi-party computation ceremonies (like Zcash's "Powers of Tau"), which led to discussions of distributed trust.

The conceptual lever was *stakes*. When students understood that the secrecy of $\tau$ was the entire security foundation of the system, polynomial evaluation at a secret point became less like abstract algebra and more like a spy novel.

## The Moment It Clicked

On Day 4, I was explaining R1CS (Rank-1 Constraint Systems). An R1CS encodes a computation as a system of constraints:

$$\vec{a} \cdot \vec{z} \circ \vec{b} \cdot \vec{z} = \vec{c} \cdot \vec{z}$$

where $\vec{z}$ is the witness (the computation trace), and $\circ$ is elementwise product.

I was about to explain why this is the right encoding when one student raised her hand and said: "Is this basically just... multiplication? Every gate in the circuit is just a multiplication check?"

Yes. Exactly. Addition comes for free (it's linear), and multiplication is the hard part — it's what requires the polynomial magic. She had extracted the core insight before I said it.

That moment is why teaching is worthwhile.

## What I Learned

**On pedagogy**:
- Start with the surprising result. Let the machinery have a reason for existing before you introduce it.
- Concrete stakes make abstract security assumptions feel real.
- Let students surprise you. Plan for them to go further than you expected.

**On zero-knowledge proofs specifically**:
- The gap between "understanding the idea" and "understanding the construction" in ZK is enormous. Most expositions jump the gap without acknowledging it.
- Groth16 is elegant *because* it's so compressed. The verifier equation looks intimidating, but every term is doing exactly one job.

**On mathematics education generally**:
- Mathematically gifted students learn differently from average students, but not in the way I expected. They don't need less scaffolding — they need *different* scaffolding. They can handle abstraction earlier, but they still need motivation.

## The Class Taught Me More Than The Students

I went into this class thinking I knew Groth16 well. I'd implemented it, I'd read the paper three times. But having to explain *why* every step works, in real time, to students who would ask precisely the questions I'd hand-waved over in my own learning — that's when I found the gaps.

The best way to understand something is to teach it.

If you're interested in zero-knowledge proofs and want a rigorous treatment without getting lost in the weeds, I genuinely recommend Justin Thaler's *Proofs, Arguments, and Zero-Knowledge* — it's available free online and is the best textbook on the subject.
