---
title: Avoid unnecessary re-renders React.memo
date: '2018-11-21'
tags: ['React', 'JavaScript']
summary: 'Preventing unnecessary component re-renders in React and various ways to achieve it, including React memo function, PureComponent, and shouldComponentUpdate'
draft: false
---

We don't want to re-render a component if the data for that component has not change. In many cases a component re-render when the props change.

<iframe src="https://codesandbox.io/embed/n3x3rvxvy0" className="w-full" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
In this example we render a new Title for every click in the button.

With React memo function we can pass a stateless functional component and we can be sure that the component will not update if the props does not change.

<iframe src="https://codesandbox.io/embed/1omq1wvzr4" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

In a class we can use pureComponent

<iframe src="https://codesandbox.io/embed/40jlzo1810" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

And also is possible to use shouldComponentUpdate

warning: shallowCompare is a legacy add-on. Use memo or PureComponent

<iframe src="https://codesandbox.io/embed/k53m503975" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
