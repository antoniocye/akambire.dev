---
title: Competing with Sampling
date: 2026-05-23
summary: Notes on ARC's Competing with Sampling agenda, rare-event auditing, and a small empirical experiment.
---

# Competing with Sampling

I have been recently trying to learn more about interpretability. While looking at the [MATS tracks for Autumn 2026](https://www.matsprogram.org/program/autumn-2026), I came across the Alignment Research Center's post "Competing with Sampling," which lays out their recent research orientation around outperforming random sampling when estimating properties of neural network outputs.

The core idea is elegant. Imagine you are auditing a neural network and want to estimate how often it produces catastrophic outputs, as judged by some catastrophe detector. A straightforward way to do this is to sample many inputs, run the model on them, apply the detector, and use the observed frequency as an estimate of the true catastrophe rate. The issue is that if catastrophic outputs are very rare, then this requires an enormous number of samples before you can be confident that your estimate is close to the true rate.

ARC's hope is that, by understanding the structure of the model, the detector, and the input distribution, we can estimate this rate much more efficiently than black-box random sampling. More specifically, they imagine spending compute upfront to construct an explanation $\pi$ for a family of model-detector systems. Later, an estimator can use $\pi$ to estimate rare-event rates for particular queries using far fewer samples than naive Monte Carlo. If this works, the explanation is useful because it captures structure that lets the estimator infer the answer, rather than simply observe it through repeated trials.

I found the ideas they presented exciting for several reasons:

- To my understanding, their claims seem reasonable. They do not try to oversell one specific method for interpretability. Instead, they define a clear and promising general research direction.
- The agenda has a plausible path to practicality. If the idea works and matures, then the audit scenario described above could become a useful way to estimate rare but important model failures. Furthermore, as they mentioned at the beginning of the post, we could imagine training the model to minimize the expected error rate, giving a cool path to alignment.
- I think this framework could be turned into a benchmark for mechanistic interpretability claims. Given a model, an explanation $\pi$, and an estimator $G$, we could ask whether $G$ can use $\pi$ to estimate some held-out property of the model more efficiently than black-box Monte Carlo sampling.

I was trying to make this idea more concrete, so with the help of GPT 5.5, I spun up a [small empirical experiment around rare-event auditing](https://github.com/antoniocye/msp/blob/main/sparse-concept-rare-event-auditing-paper.md). The experiment asks whether reusable structure extracted from a model can help estimate rare failure rates more efficiently than Monte Carlo sampling. In the setup, the model is a CIFAR-10 classifier, the audit contexts are rare Boolean predicates such as high-confidence false positives, class confusions, and concept-conditioned errors, and the target is the exact finite-test-set rate of each event. A method first builds a reusable explanation object $\pi_m$, then an estimator $G_m$ uses $\pi_m$ and a small label budget to estimate the rate for a particular audit context.

The methods for constructing $\pi_m$ that I decided to go for were the "interpretability methods" I was somewhat exposed to, including SDL (sparse dictionary learning), SAE (sparse autoencoder), and SPD (stochastic parameter decomposition).

Obviously, this is not meant to be a full test of ARC's agenda. But I got a narrow positive result which made me somewhat optimistic of their work. Specifically, it seems like the estimators that used these explanations did reduce RMSE at equal per-query label budgets, and after accounting for the build cost, some methods broke even after enough audit queries.

Also, the experiment made the benchmark idea feel more concrete to me: mechanistic claims could be evaluated by whether an explanation $\pi$ lets an estimator $G$ answer held-out audit queries more efficiently than black-box sampling, so the question becomes finding ways of checking whether the advantage really comes from the proposed explanation, which sounds like a feasible problem.

In general, I have been very excited about these ideas and will definitely dig into them more.
