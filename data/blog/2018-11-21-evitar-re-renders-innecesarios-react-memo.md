---
title: Evitar re-renders innecesarios con React.memo
author: Marcelo Carmona
layout: post
lang: es
ref: avoid-unnecessary-re-renders-react-memo
permalink: evitar-re-renders-innecesarios-react-memo
path: 2019-11-21-evitar-re-renders-innecesarios-react-memo.md
tags:
  - React
  - JavaScript
---

No queremos re renderear un component si la data de ese componente no cambio, en muchos casos un componente se re-renderiza cuando las props cambian.

<iframe src="https://codesandbox.io/embed/n3x3rvxvy0" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
En este ejemplo renderizamos un nuevo Title por cada click en el botón.

Con la función memo podemos pasar un stateless functional component y podemos estar seguros que el componente no se actualizará si las props no cambian.

<iframe src="https://codesandbox.io/embed/1omq1wvzr4" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Con class podemos usar pureComponent

<iframe src="https://codesandbox.io/embed/40jlzo1810" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Y tambien es posible usar shouldComponentUpdate

Cuidado: shallowCompare es un legacy add-on. Usar memo o PureComponent

<iframe src="https://codesandbox.io/embed/k53m503975" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
