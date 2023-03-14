---
title: How to comment in React JSX
author: Marcelo Carmona
layout: post
lang: en
ref: comments-react-jsx
permalink: comments-react-jsx
path: 2016-10-06-how-to-comment-in-react-jsx.md
tags:
  - React
  - Javascript
---

The way that we can make comments in React is a little weird, and when we search information is difficult to find it.
It is not possible to use HTML comments inside of JSX

```html
render() { return (
<div>
  <!-- this does not work -->
</div>
) }
```

It is necessary to use comments in Javascript but for that we will need to use the curly brackets in the following way:

```javascript
{
  /* A JSX comment */
}
```

And multiline

```javascript
{
  /* 
    A multiline JSX
    JSX
    comment
*/
}
```
