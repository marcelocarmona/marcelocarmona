---
title: Parseo y formateo en AngularJS
lang: es
date: '2015-10-16'
translationKey: angular-parsers-formatters
tags: ['Angularjs', 'JavaScript']
---

# $parsers

Es un array de funciones a ejecutar. Estas se ejecutan de forma ordenada, como un pipeline, cada vez que el control lee un valor del DOM. Las funciones de este pipeline son llamadas en el orden del array, el resultado de una función es la entrada de la siguiente función, y el último valor de retorno es enviado a la colección de `$validators`.

Si el parser devuelve `undefined`, significa que ocurrió un error. No se ejecutarán los `$validators` y el `ngModel` se establecerá como `undefined`, a menos que `ngModelOptions.allowInvalid` esté configurado como `true`. El error de parseo se guarda en `ngModel.$error.parse`.

# $formatters

Es un array de funciones que se ejecutan en pipeline cuando el `ngModel` cambia. Las funciones son llamadas en orden inverso, y cada una pasa su valor de retorno a la siguiente. El último valor retornado se utiliza como valor en el DOM.

En la siguiente imagen, se puede observar que los parsers se utilizan para transformar los datos de la vista al modelo, y los formatters, del modelo a la vista.

<img src="/static/images/blog/ng-model-flow.png" />
