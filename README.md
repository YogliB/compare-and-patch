# compare-and-patch

## compares two folders and makes them identical

[![npm package version](https://badgen.net/npm/v/compare-and-patch)](https://npm.im/compare-and-patch)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](code-of-conduct.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![snyk report](https://img.shields.io/snyk/vulnerabilities/npm/compare-and-patch)](https://snyk.io/vuln/npm:compare-and-patch)

### Installation

```bash
npm install -g compare-and-patch
```

### Usage

Long way:

```bash
compare-and-patch --origin ./origin --target ./path/to/target
```

Shorthand:

```bash
cap -o ./origin -t ./path/to/target
```

Don't want to install? Just do:

```bash
npx cap -o ./origin -t ./path/to/target
```

### See all options

Run:

```bash
cap
```

or go [here](help.md).

### JavaScript API

install:

```bash
npm install compare-and-patch
```

import & use:

```javascript
import { compareAndPatch } from "compare-and-patch";

compareAndPatch({
  origin: "./origin",
  target: "./path/to/target",
});
```

All options can be seen [here](https://github.com/YogliB/compare-and-patch/blob/main/src/models.ts#L1).

### TODO

1. Add tests.
1. Add stats.
1. Add ignore patterns.
