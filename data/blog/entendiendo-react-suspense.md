---
title: Entendiendo React.Suspense
author: Marcelo Carmona
lang: es
date: '2018-12-04'
tags: ['React', 'JavaScript']
---

Esta es una nueva característica que nos permite "detener" un render hasta que hayamos terminado una tarea (por ejemplo, cargar datos desde una api)

<CodeSandbox codeSandboxId="6wnrnmyq43" />

Vamos a buscar una tarea cuando el componente está montado, y guardaremos el resultado en una caché muy simple. La parte interesante que hay que entender es cuando lanzamos una promesa, esta es atrapada por Suspense y muestra un loading... hasta que esta promesa se resuelve.

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

A veces tenemos una conexión rápida y el recurso se carga muy rápidamente, en este caso tal vez no sea necesario mostrar loading..., por lo que podemos usar `maxDuration` para evitar este parpadeo extraño

```javascript
<Suspense maxDuration={400} fallback={<div>Loading...</div>}>
  <Task />
</Suspense>
```
