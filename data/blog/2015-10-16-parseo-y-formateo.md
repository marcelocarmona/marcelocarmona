---
title: Parseo y formateo en Angularjs
date: '2015-10-16'
tags: ['Angularjs', 'Javascript']
draft: false
---

# $parsers

Es un array de funciones a ejecutar. Estas se ejecutan en forma ordenada como un pipeline cada vez que el control lee un valor del DOM. En donde las funciones de este pipeline son llamadas en el orden del array y el resultado de una función es la entrada de la siguiente función y el último valor de retorno es enviado a la colección de $validatos.

Si el parser devuelve undefined significa que ocurrió un error y no se ejecutaran los `$validatos` y el ngModel se seteara como undefined a menos que ngModelOptions.allowInvalid este seteado como true el error del parse es guardado en ngModel.$error.parse

# $formatters

Es un array de funciones que se ejecutan en pipeline cuando el ngModel cambiar, las funciones son llamas en orden inverso, y cada una pasa su valor de retorno a la siguiente. El último valor retornado se utiliza como valor en el DOM

En la siguiente imagen se puede observar que los parsers se utilizan para transformar los datos del view al model y los formatters del model al view

<img src="/static/images/blog/ng-model-flow.png" />
