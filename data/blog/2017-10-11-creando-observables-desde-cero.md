---
title: Creando observables desde cero
author: Marcelo Carmona
layout: post
lang: es
ref: creating-observable-from-scratch
permalink: creando-observables-desde-cero
path: 2017-10-12- creando-observables-desde-cero.md
tags:
  - Rxjs
  - JavaScript
  - video
---

Una buena forma de entender Rxjs es implementado algo similar y mas simple desde 0.
Voy a mostrar como componer funciones al estilo como lo hace la librería Rxjs.

<div class="video-container">
  <iframe title="{{ page.title }}" width="560" height="315" src="https://www.youtube.com/embed/XiIkG9lAr5Q" frameborder="0" allowfullscreen></iframe>
</div>

Vamos a ver diferentes tipos de callbacks con los cuales nos podemos encontrar

```javascript
const elem = document.querySelector('#someElem')

function consoleClick(event) {
  console.log(`clicked ${event.x}`)
}

elem.addEventListener('click', consoleClick)
```

En este caso utilizamos un event listener para ejecutar un callback en el dom

```javascript
const arr = [1, 2, 3, 4, 5]

arr.forEach(function callback(x) {
  console.log(x)
})
```

En este segundo ejemplo tenemos un callback que se ejecuta por cada iteración de nuestro array.
NOTA: en este caso el callback es sincrónico, es importante tener presente que cuando decimos callbacks no tenemos que pensar que todos los callbacks son asincrónicos

```javascript
const promise = fetch('https://jsonplaceholder.typicode.com/posts/1').then((res) => res.json())

function successCb(post) {
  console.log(`post1: ${post.title}`)
}

function failureCb(err) {
  console.error(err)
}

promise.then(successCb, failureCb)
```

En este ejemplo vemos como ejecutar callback en el caso de que una promesa se resolvió correctamente o en el caso que se produzca un error.
Para tener en cuenta este caso es un poco diferente al anterior ya que no tengo posibilidad de equivocarme al hacer un click.

```javascript
fs = require('fs')

const readable = fs.createReadStream('intro03.js', { highWaterMark: 100 })

function nextDataCb(chunk) {
  console.log(`Received ${chunk.length} bytes of data.`)
}

function errorCb(err) {
  console.log(`Something was wrong :( ${err}`)
}

function doneCb() {
  console.log('There will be no more data.')
}

readable.on('data', nextDataCb)
readable.on('error', errorCb)
readable.on('end', doneCb)
```

En este ejemplo en node podemos ver un caso en donde tenemos 3 callback, uno que va leyendo la data a medida que se necesita "data" otro cuando termina "end" y otro cuando se produce un error.

Teniendo esto en cuenta la idea es pensar en una forma genérica de como manejar todas los callbacks en javascript, podríamos pensarlo de esta misma manera con tres callbacks next, error, y complete

```javascript
function nextCallback(data) {
  console.log(data) // Hacer algo
}

function giveMeSomeData(nextCb, errorCb, completeCb) {
  // Usamos solamente el nextCb para este caso
  document.addEventListener('click', nextCb)
}

giveMeSomeData(nextCallback, errorCallback, completeCallback)
```

Recordando el primer ejemplo del eventListener podríamos pensarlo así.

```javascript
function nextCallback(data) {
  console.log(data)
}

function completeCallback() {
  console.log('done')
}

function giveMeSomeData(nextCb, errorCb, completeCb) {
  ;[1, 2, 3].forEach(nextCallback)
  completeCb()
}

giveMeSomeData(nextCallback, errorCallback, completeCallback)
```

Recordando el segundo ejemplo del array podríamos pensar en algo así.

```javascript
function nextCallback(data) {
  console.log(data)
}

function errorCallback(err) {
  console.error(err)
}

function completeCallback() {
  console.log('done')
}

function giveMeSomeData(nextCb, errorCb, completeCb) {
  fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then((res) => {
      // Llamamos a next y completamos
      nextCb(res)
      completeCb()
    })
    .catch(errorCb) // Ejecutamos el callback de error
}

giveMeSomeData(nextCallback, errorCallback, completeCallback)
```

Spoiler: es la misma idea que `fromPromise` de Rxjs http://reactivex.io/rxjs/file/es6/observable/PromiseObservable.js.html#lineNumber58

```javascript
const observable = {
  subscribe: function subscribe(ob) {
    ;[1, 2, 3].forEach(ob.next)
    ob.complete()
  },
}

const observer = {
  next: function nextCallback(data) {
    console.log(data)
  },
  error: function errorCallback(err) {
    console.error(err)
  },
  complete: function completeCallback() {
    console.log('done')
  },
}

observable.subscribe(observer)
```

Teniendo en cuenta el ejemplo del array refactorizando creamos un objeto `observer` y `observable`.
GiveMeSomeData lo renombramos a `subscribe`

```javascript
function map(transformCb) {
  const inputObservable = this
  const outputObservable = createObservable(function subcribe(outputObservable) {
    inputObservable.subscribe({
      next: function nextCallback(data) {
        const transformData = transformCb(data)
        outputObservable.next(transformData)
      },
      error: function errorCallback(err) {
        console.error(err)
      },
      complete: function completeCallback() {
        console.log('done')
      },
    })
  })
  return outputObservable
}

function filter(condicionalCb) {
  const inputObservable = this
  const outputObservable = createObservable(function subcribe(outputObservable) {
    inputObservable.subscribe({
      next: function nextCallback(data) {
        if (condicionalCb(data)) {
          outputObservable.next(data)
        }
      },
      error: function errorCallback(err) {
        console.error(err)
      },
      complete: function completeCallback() {
        console.log('done')
      },
    })
  })
  return outputObservable
}

function createObservable(subcribe) {
  return {
    subscribe: subcribe,
    map: map,
    filter: filter,
  }
}

const arrayObservable = createObservable((ob) => {
  ;[1, 2, 3].forEach(ob.next)
  ob.complete()
})

const observer = {
  next: function nextCallback(data) {
    console.log(data)
  },
  error: function errorCallback(err) {
    console.error(err)
  },
  complete: function completeCallback() {
    console.log('done')
  },
}

arrayObservable
  .map((x) => x * 10)
  .filter((x) => x !== 20)
  .subscribe(observer)
```

Y luego podríamos crear los operadores map y filter
El código completo también lo deje en un gist

https://gist.github.com/marcelocarmona/5aa60c8baff780a29673b7987b71a743

Y por último para comparar podemos ver un ejemplo ya utilizando un arrayObservable con Rxjs

```javascript
const Rx = require('rxjs')

const arrayObservable = Rx.Observable.from([1, 2, 3])

arrayObservable
  .map((x) => x * 10)
  .filter((x) => x !== 20)
  .subscribe({
    next: (x) => console.log(x),
    error: (err) => console.error(err),
    complete: () => console.log('done'),
  })
```
