---
title: Evitar re-renders innecesarios con React.memo
lang: es
date: '2019-11-21'
translationKey: react-memo
tags: ['React', 'JavaScript']
---

No queremos re-renderizar un componente si la data de ese componente no cambió. En muchos casos, un componente se re-renderiza cuando las props cambian.

<CodeSandbox codeSandboxId="n3x3rvxvy0" />
En este ejemplo, renderizamos un nuevo Title por cada clic en el botón.

Con la función `memo`, podemos pasar un stateless functional component y estar seguros de que el componente no se actualizará si las props no cambian.

<CodeSandbox codeSandboxId="1omq1wvzr4" />

En una class, podemos usar `PureComponent`.

<CodeSandbox codeSandboxId="40jlzo1810" />

Y también es posible usar `shouldComponentUpdate`.

Cuidado: `shallowCompare` es un legacy add-on. Usa `memo` o `PureComponent`.

<CodeSandbox codeSandboxId="k53m503975" />
