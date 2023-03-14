---
title: Creating observables from scratch
author: Marcelo Carmona
layout: post
lang: en
ref: creating-observable-from-scratch
permalink: creating-observable-from-scratch
path: 2017-10-12-creating-observable-from-scratch.md
tags:
  - Rxjs
  - JavaScript
  - video
---

One way to understand Rxjs is implementing something similar and simplest from scratch.
I'm going to show how we can compose functions in a similar way that Rxjs does.

<div class="video-container">
  <iframe title="{{ page.title }}" width="560" height="315" src="https://www.youtube.com/embed/XiIkG9lAr5Q" frameborder="0" allowfullscreen></iframe>
</div>

We are going to see different types of callbacks

```javascript
const elem = document.querySelector('#someElem')

function consoleClick(event) {
  console.log(`clicked ${event.x}`)
}

elem.addEventListener('click', consoleClick)
```

In this case, we use an event listener to execute a callback in the DOM

```javascript
const arr = [1, 2, 3, 4, 5]

arr.forEach(function callback(x) {
  console.log(x)
})
```

In this second example, we have a callback that is executed for each iteration of our array.
NOTE: in this case the callback is synchronous, it is important to keep in mind that when we say callbacks we do not have to think that all callbacks are asynchronous.

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

In this example, we see how to execute callback in the event that a promise was resolved correctly or in the event of an error. To take into account this case is a little different from the previous one since I have no chance of making a mistake when I clicked.

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

In this example, in Node, we can see a case where we have 3 callback, one that is reading the data as it needs "data" another when it ends "end" and another when an error occurs.

Bearing this in mind, the idea is to think about a generic way of how to handle all the callbacks in javascript, we could think in the same way with three callbacks next, error, and complete

```javascript
function nextCallback(data) {
  console.log(data) // To do something
}

function giveMeSomeData(nextCb, errorCb, completeCb) {
  // We use just the nextCb for this case
  document.addEventListener('click', nextCb)
}

giveMeSomeData(nextCallback, errorCallback, completeCallback)
```

Remembering the first example of the eventListener we might think so.

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

Remembering the second example of the array we could think of something like that.

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
      // We call next and complete
      nextCb(res)
      completeCb()
    })
    .catch(errorCb) // Error callback
}

giveMeSomeData(nextCallback, errorCallback, completeCallback)
```

Spoiler: is the same idea as `fromPromise` of Rxjs http://reactivex.io/rxjs/file/es6/observable/PromiseObservable.js.html#lineNumber58

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

Taking into account the example of the refactoring array we create an object `observer` and `observable`.
GiveMeSomeData we rename it to `subscribe`

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

And then we can create the map and filter operators.
The complete code also I leave it in a gist

https://gist.github.com/marcelocarmona/5aa60c8baff780a29673b7987b71a743

And finally to compare we can see an example already using an observable array with Rxjs.

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
