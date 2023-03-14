---
title: Understanding React.Suspense
author: Marcelo Carmona
layout: post
lang: en
ref: understanding-react-suspense
permalink: understanding-react-suspense
path: 2018-12-04-understanding-react-suspense.md
tags:
  - React
  - JavaScript
---

This is a new feature that allow us to "stop" a render until we have finished a task (e.g. loading data from an api)

<iframe src="https://codesandbox.io/embed/6wnrnmyq43" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

We are going to fetch a task when the component Task is mounted, and save the result in a very simple cache.
The interesting part to understand is when we throw a promise it is catch by Suspense and show a loading until it is resolved.

```javascript
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './styles.css'

function fetchFirstTask() {
  return fetch('https://jsonplaceholder.typicode.com/todos/1').then((response) => response.json())
}

let cache = null

function Task() {
  if (!cache) {
    throw fetchFirstTask().then((task) => (cache = task))
  }
  return (
    <div>
      {cache.completed ? '✅' : '⛔️'} {cache.title}
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <h1>My task</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Task />
      </Suspense>
    </div>
  )
}
```

Sometimes we have a fast conexion and the resource is loaded very quickly, in this case maybe it is no necessary to show a loading, so we can use `maxDuration` to avoid this weird blink.

```javascript
<Suspense maxDuration={400} fallback={<div>Loading...</div>}>
  <Task />
</Suspense>
```
