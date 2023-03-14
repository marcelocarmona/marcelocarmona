---
title: Entendiendo React.Suspense
author: Marcelo Carmona
layout: post
lang: es
ref: understanding-react-suspense
permalink: entendiendo-react-suspense
path: 2018-12-04-entendiendo-react-suspense.md
tags:
  - React
  - JavaScript
---

Esta es una nueva característica que nos permite "detener" un render hasta que hayamos terminado una tarea (por ejemplo, cargar datos desde una api)

<iframe src="https://codesandbox.io/embed/6wnrnmyq43" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

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
