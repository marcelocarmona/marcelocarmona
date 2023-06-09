---
title: Angular 1.5 metodos del ciclo de vida
lang: es
date: '2016-08-08'
tags: ['Angularjs', 'JavaScript']
---

En angular 1.5 los componentes tienen un ciclo de vida bien definido y por medio de los cycle hooks nos permiten enganchar funciones que ayudan a modificar su comportamiento, vamos a ver los roles que tienen cada uno de estos hooks y por que deberías usarlos, es muy importante entenderlos ya que estamos pensando en una aplicación basada en componentes.
Los ejemplos los voy a estar escribiendo en ES6, así que si todavía no empezaste a usar Angularjs con ES6 te recomiendo un buen repo que pude servir como boilerplate <a href="https://github.com/angularclass/NG6-starter" target="_blank" rel="noopener"> https://github.com/angularclass/NG6-starter</a>

# $onInit

Es una propiedad predefinida por angular que se expone en el controlador del componente a la cual le podemos asignar una función

```javascript
class ComponentController {
  $onInit() {
    this.var1 = 'var1'
    this.var2 = 'var2'
  }
}
```

Es utilizado para código de inicialización del controller.
Esta función es llamada solo una vez, una vez que se establecieron todos los bindings del componente y antes que se establezcan en sus hijos.
Angular 2 tiene el método ngOnInit el cual nos servirá para la transición de Angular 1.x.

## require

Anteriormente con las directivas usábamos el "require" para heredar métodos de otras directivas y su sintaxis nos permitía usar un String o Array (puedes buscarlo en la documentación de la api <a href="https://docs.angularjs.org/api/ng/service/$compile" target="_blank" rel="noopener">https://docs.angularjs.org/api/ng/service/$compile</a>).
Con el uso de componentes vamos a poder utilizar "require" utilizand un string.

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

Al hacer uso de require es posible acceder al controlador desde un componente hijo, por ejemplo:

```html
<myList>
  <myItem title="Item 1"> contents 1 </myItem>
  <myItem title="Item 2"> contents 2 </myItem>
  <myItem title="Item 3"> contents 3 </myItem>
</myList>
```

En este caso MyItem es un buen ejemplo de uso ya que

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

Llamado después de que el elemento de este controlador y sus hijos hayan sido linkeados.
De forma similar a la función post-link, este hook se puede usar para configurar handlers de eventos del DOM y hacer la manipulación del DOM.

```javascript
class myComponente {

  $postLink() {
    ...
  }
}

export default myComponente;
```

# $onChanges

Este hook es el mas importante gracias a el nos permite usar una arquitectura one-way dataflow con angular 1.5.x.
Lo que hay que tener en cuenta que este método va a ser ejecutado cada vez que modifica un input del componente. Osea el input esta definido en bindings: `{...}`.
Ya sea por `'<'` (one-way databinding) o '@' (for evaluated DOM attribute values).
Es ejecutado también al inicializar el componente y como parámetro recibe un objeto changes.

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

Ahora vamos a clonar la data que nos viene para que el valor que reciba el componente sea "inmutable" y lo que significa que no podemos modificar la variable desde el interior de este componente.

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

Básicamente es para hacer algo cuando el scope del componente es destruido, antes lo usábamos algo como

```javascript
$scope.$on('$destroy', function () {
  // destroy event
})
```

Ahora podemos escribirlo asi

```javascript
class myComponente {
  $onDestroy() {
    // el scope del componente es destruido
  }
}

export default myComponente
```
