---
title: "Phantom Dependencies: The Silent Supply Chain Risk"
date: "2024-03-10"
description: "How phantom dependencies in npm and PyPI expose thousands of packages to version downgrade attacks."
tags: [security, npm, python, research, supply-chain]
---

Software supply chains have become one of the most important attack surfaces in security. The 2020 SolarWinds attack, the 2021 Log4Shell, the 2022 PyTorch-nightly compromise — these weren't traditional exploits. They targeted the infrastructure developers trust to build software.

For CS 356 (Topics in Computer and Network Security) at Stanford, my partner and I investigated a more subtle class of supply chain vulnerability: **phantom dependencies**.

## What Is a Phantom Dependency?

When you `npm install express`, npm downloads `express` and all its *declared* dependencies. But packages often use code from packages they never formally declared — they rely on the fact that a parent package brings in a compatible version as a side effect. These undeclared usages are *phantom dependencies*.

```javascript
// package.json of "my-package"
{
  "dependencies": {
    "express": "^4.18.0"
    // express depends on "debug", but my-package never declares it
  }
}

// my-package/index.js
const debug = require('debug')  // phantom! "debug" is brought in by express
```

The problem: if `express` stops depending on `debug`, or updates to a version that requires a different major version, `my-package` silently breaks — or worse, gets a different `debug` than expected.

## The Version Downgrade Attack

Here's the attack we modeled. Suppose:

1. `my-package@2.0.0` has a *declared* dependency on `lodash@^4.0.0`
2. `my-package@1.0.0` had a *phantom* dependency on `lodash@3.x` (brought in by some other dep)
3. An attacker publishes `my-package@1.0.1` (a *patch update*) that re-introduces the old phantom path

If a victim pins `my-package@^1.0.0` in their lockfile or uses a loose version constraint, `npm install` may resolve to `1.0.1`, bringing in the older, potentially vulnerable `lodash@3.x` alongside `lodash@4.x`. Now the victim's application silently uses a vulnerable library version, even though their manifest says nothing about it.

This is a **version downgrade attack through phantom dependency exploitation**.

## The Study: Scale and Scope

We analyzed over 12,000 packages across npm and PyPI, focusing on the top 1,000 most-downloaded packages in each ecosystem.

Our methodology:

1. **Dependency extraction**: For each package version, extract the full transitive dependency tree
2. **Phantom detection**: Identify `require()`/`import` statements for packages not in the declared dependencies
3. **Version history analysis**: Track when declared dependencies changed across versions
4. **Attack surface scoring**: Compute exposure to the downgrade attack

**Key finding**: Over **23% of the top 1,000 npm packages** had at least one phantom dependency that could be exploited via version downgrade. PyPI was slightly better (~18%) due to stricter packaging conventions in the Python ecosystem, but still substantial.

## Why This Is Hard to Fix

Package managers prioritize reproducibility and performance — they don't typically validate that `require()` calls match declared dependencies. Tools like `depcheck` catch *unused* declared deps, not *undeclared* used deps in a deep semantic way.

The root cause is ecosystem culture: JavaScript in particular has a tradition of implicit transitive dependencies. The `node_modules` flat structure made phantom deps especially easy to rely on — any package anywhere in the tree is accessible.

## What Can Be Done

For **package authors**:
- Use `peerDependencies` properly to signal implicit requirements
- Run `npm ls <package>` to check if something you're using is actually declared
- Audit your code with tools like `madge` or `depcruise`

For **package managers**:
- Warn when code imports packages not in `dependencies` or `devDependencies`
- Stricter resolution modes (npm's `--strict-peer-deps` helps partially)

For **security-conscious projects**:
- Use lockfiles religiously (`package-lock.json`, `poetry.lock`)
- Pin exact versions in production environments
- Set up dependency review CI (GitHub's Dependency Review Action, Dependabot)

## Broader Lessons

The more interesting meta-lesson is about attack surface reasoning. Supply chain attacks are powerful because developers have high *implicit trust* in their dependency trees. We don't audit every line of every package we install. We can't. So attackers target the gaps between what we've reviewed and what actually runs.

Phantom dependencies are one such gap. They exist because software is compositional — packages depend on packages that depend on packages — and nobody has full visibility into that composition. The version downgrade angle exploits the fact that version constraints encode security assumptions, and phantom deps bypass those assumptions entirely.

The full write-up and code are on [GitHub](https://github.com/antoniocye/cs356).
