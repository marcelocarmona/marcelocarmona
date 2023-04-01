---
title: Evitar re-renders innecesarios con React.memo
lang: es
date: '2019-11-21'
tags: ['React', 'JavaScript']
---

No queremos re renderear un component si la data de ese componente no cambio, en muchos casos un componente se re-renderiza cuando las props cambian.

<CodeSandbox codeSandboxId="n3x3rvxvy0" />
En este ejemplo renderizamos un nuevo Title por cada click en el botón.

Con la función memo podemos pasar un stateless functional component y podemos estar seguros que el componente no se actualizará si las props no cambian.

<CodeSandbox codeSandboxId="1omq1wvzr4" />

Con class podemos usar pureComponent

<CodeSandbox codeSandboxId="40jlzo1810" />

Y tambien es posible usar shouldComponentUpdate

Cuidado: shallowCompare es un legacy add-on. Usar memo o PureComponent

<CodeSandbox codeSandboxId="k53m503975" />
