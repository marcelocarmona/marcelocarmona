---
title: Understanding React.Suspense
date: '2018-12-04'
tags: ['React', 'JavaScript']
summary: 'React Suspense is a powerful new feature that allows developers to pause rendering until a task (such as loading data from an API) is completed'
draft: false
---

This is a new feature that allow us to "stop" a render until we have finished a task (e.g. loading data from an api)

<CodeSandbox codeSandboxId="6wnrnmyq43" />

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
