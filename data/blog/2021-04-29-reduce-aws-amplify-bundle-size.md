---
title: Reduce AWS Amplify bundle size
author: Marcelo Carmona
layout: post
lang: en
ref: reduce-aws-amplify-bundle-size
permalink: reduce-aws-amplify-bundle-size
path: 2021-04-29-reduce-aws-amplify-bundle-size.md
tags:
  - React
  - JavaScript
  - Typescript
  - AWS
  - AWS Amplify
  - Nextjs
---

AWS (Amazon Web Service) Amplify is an easy-to-use framework for mobile and web applications that utilize AWS cloud services. However, I recently encountered a bundle size issue after building with Amplify, because it is really heavy in the build package. This little article is about how to optimize the import and reduce the first load size in our applications.

I'm using a <a href="https://nextjs.org/" target="_blank" rel="noopener">Nextjs</a> app for this example

<img src="/img/posts/amplify-bundle.png" alt="Amplify bundle">

<img src="/img/posts/nextjs-build.png" alt="Nextjs build">

As you can see the `First Load JS shared by all` is 209 kB

<img src="/img/posts/nextjs-build-result.png" alt="Nextjs build result">

This is how I imported the Amplify module before optimization.

```
import Amplify from "aws-amplify";
```

This is how I import only the required submodules.

```
import Amplify from "@aws-amplify/core";
```

It is always a good habit to analyze the bundle size after the build.
Then you will find unoptimized imports and libraries. Always try to import submodules only from the libraries needed within the project.
You can use tools like <a href="https://www.npmjs.com/package/source-map-explorer" target="_blank" rel="noopener">"source-map-explorer"</a> to analyze your build package.
