---
title: Angular 1.5 métodos del ciclo de vida
lang: es
date: '2016-08-08'
translationKey: angular-lifecycle-hooks
tags: ['Angularjs', 'JavaScript']
---

En Angular 1.5, los componentes tienen un ciclo de vida bien definido. Por medio de los lifecycle hooks, podemos enganchar funciones que ayudan a modificar su comportamiento. Vamos a ver qué rol tiene cada uno de estos hooks y por qué deberías usarlos. Es importante entenderlos si estás pensando en una aplicación basada en componentes.
Los ejemplos los voy a escribir en ES6, así que si todavía no empezaste a usar AngularJS con ES6, te recomiendo este repo que puede servir como boilerplate: <a href="https://github.com/angularclass/NG6-starter" target="_blank" rel="noopener"> https://github.com/angularclass/NG6-starter</a>

# $onInit

Es una propiedad predefinida por Angular que se expone en el controlador del componente, a la cual le podemos asignar una función.

```javascript
class ComponentController {
  $onInit() {
    this.var1 = 'var1'
    this.var2 = 'var2'
  }
}
```

Se utiliza para código de inicialización del controller.
Esta función se llama solo una vez, después de que se establecen todos los bindings del componente y antes de que se establezcan en sus hijos.
Angular 2 tiene el método `ngOnInit`, el cual nos servirá para la transición de Angular 1.x.

## require

Anteriormente, con las directivas, usábamos "require" para heredar métodos de otras directivas, y su sintaxis nos permitía usar un string o un array (puedes buscarlo en la documentación de la API: <a href="https://docs.angularjs.org/api/ng/service/$compile" target="_blank" rel="noopener">https://docs.angularjs.org/api/ng/service/$compile</a>).
Con el uso de componentes vamos a poder utilizar "require" usando un string.

```javascript
import template from './myComponent.template.html'
import controller from './myComponent.controller'

const myComponent = {
  require: '^^anotherComponent',
  template,
  controller,
  bindings: {
    input: '<',
    onAction: '&',
  },
}

export default myComponent
```

Al hacer uso de `require`, es posible acceder al controlador desde un componente hijo, por ejemplo:

```html
<myList>
  <myItem title="Item 1"> contents 1 </myItem>
  <myItem title="Item 2"> contents 2 </myItem>
  <myItem title="Item 3"> contents 3 </myItem>
</myList>
```

En este caso, `MyItem` es un buen ejemplo de uso:

```javascript
import template from './myList.template.html'
import controller from './myList.controller'

const myList = {
  transclude: true,
  template,
  controller,
}

export default myList
```

```javascript
import template from './myItem.template.html'
import controller from './myItem.controller'

const myItem = {
  bindings: {
    title: '<',
  },
  require: '^^myList',
  transclude: true,
  template,
  controller,
}

export default myItem
```

```javascript
class myItemController {
  $onInit() {
    // vamos a poder tener acceso al controller de myList
    this.myList.foo()
  }
}

export default myItemController
```

# $postLink

Llamado después de que el elemento de este controlador y sus hijos hayan sido enlazados.
De forma similar a la función post-link, este hook se puede usar para configurar handlers de eventos del DOM y manipular el DOM.

```javascript
class myComponente {

  $postLink() {
    ...
  }
}

export default myComponente;
```

# $onChanges

Este hook es el más importante porque nos permite usar una arquitectura de one-way data flow con Angular 1.5.x.
Lo que hay que tener en cuenta es que este método se va a ejecutar cada vez que se modifique un input del componente. Es decir, el input está definido en `bindings: {...}`.
Ya sea por `'<'` (one-way data binding) o '@' (for evaluated DOM attribute values).
También se ejecuta al inicializar el componente y recibe un objeto `changes` como parámetro.

```javascript
class myComponente {
  $onChanges(changes) {
    if (changes.name) {
      this.user = changes.user.currentValue
    }
  }
}

export default myComponente
```

Ahora vamos a clonar la data que nos llega para que el valor que reciba el componente sea "inmutable", lo que significa que no podemos modificar la variable desde el interior de este componente.

```javascript
class myComponente {
  $onChanges(changes) {
    if (changes.name) {
      this.user = angular.copy(changes.user.currentValue)
    }
  }
}

export default myComponente
```

# $onDestroy

Básicamente sirve para hacer algo cuando el scope del componente es destruido. Antes usábamos algo como esto:

```javascript
$scope.$on('$destroy', function () {
  // destroy event
})
```

Ahora podemos escribirlo así:

```javascript
class myComponente {
  $onDestroy() {
    // el scope del componente es destruido
  }
}

export default myComponente
```
