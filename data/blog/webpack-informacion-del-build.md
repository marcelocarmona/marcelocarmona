---
title: Webpack building progress information
lang: es
date: 2016-09-05
tags: ['Webpack', 'Javascript']
---

Cuando utilizamos webpack para generar nuestros bundles en muchos casos en nuestro entorno de desarrollo resulta conveniente mostrar información acerca del tamaño que ocupa cada modulo, los bundles en si, tiempo que lleva realizar el proceso, si es que estamos transpilando el código mediante babel por ejemplo o utilizando postcss para preprocesar nuestras hojas de estilo.

Las opciones que tenemos actualmente para poder mostrar esta información se realiza por medio de plugins para webpack.
Voy a dar tres alternativas simples para poder mostrar este tipo de información.

# webpack-dashboard

Este <a href="https://github.com/FormidableLabs/webpack-dashboard" target="_blank" rel="noopener">dashboard</a> fue creado por la gente de <a href="https://formidable.com/" target="_blank" rel="noopener">formidable.com</a> una muy buena opcion que muestra información sobre:

- **Log**: el log de errores del proceso de building
- **Status**: estado del proceso del building
- **Operation**: muestra la operación especifica que se realiza en el proceso de building
- **Progress**: progreso de building en vivo
- **Modules**: una lista de tus modulos, su tamañoo y porcentaje con respecto al tamaño del bundle
- **Assets**: lista de assets generados

Si normalmente usas webpack con `webpack-dev-server` o `webpack-dev-middleware` estarás acostumbrado a ver algo como esto:
<img src="/static/images/blog/webpack-dashboard-dev-server.png" alt="webpack dashboard common example" />

El `webpack-dashboard` creado por <a href="https://formidable.com/blog/2016/08/15/introducing-webpack-dashboard/" target="_blank" rel="noopener">Ken Wheeler</a> tiene el siguiente aspecto :)
<img src="/static/images/blog/webpack-dashboard-screen-shot.png" alt="webpack dashboard screen shot" />

Acá lo puedes ver en acción
<img src="/static/images/blog/webpack-dashboard-in-action.gif" alt="webpack dashboard in action" />

Instalarlo es bastante simple:

```bash
npm install webpack-dashboard --save-dev
```

Luego agregamos el <a href="https://webpack.github.io/docs/plugins.html" target="_blank" rel="noopener">plugin</a> a nuestra configuración de webpack

```javascript
// Import the plugin:
var DashboardPlugin = require('webpack-dashboard/plugin')

// If you aren't using express, add it to your webpack configs plugins section:
plugins: [new DashboardPlugin()]

// If you are using an express based dev server, add it with compiler.apply
compiler.apply(new DashboardPlugin())
```

Ahora tenemos que llamar a `webpack-dashboard` desde tu package.json.
Si tu dev server se parece a esto

```javascript
"scripts": {
    "dev": "node index.js"
}
```

Debemos cambiarlo por esto

```javascript
"scripts": {
    "dev": "webpack-dashboard -- node index.js"
}
```

Para ver mas información sobre la configuración se puede ver el proyecto en <a href="https://github.com/FormidableLabs/webpack-dashboard">github</a>

Como dije anteriormente me parece muy buena la propuesta de tener un dashboard para obtener información relevante de nuestros proyectos.
Acá dejo algunos tweets que se escribieron en el momento de su lanzamiento

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Up on the blog: <a href="https://twitter.com/ken_wheeler">@ken_wheeler</a> introduces Webpack Dashboard, a CLI dashboard for your Webpack-dev-server <a href="https://t.co/1jD1Q8lWRn">https://t.co/1jD1Q8lWRn</a></p>&mdash; Formidable (@FormidableLabs) <a href="https://twitter.com/FormidableLabs/status/765208945543610368">15 de agosto de 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br /><br />

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Excited to announce the first turbo alpha version of webpack-dashboard is now released! <a href="https://t.co/OnYvgwHmXC">https://t.co/OnYvgwHmXC</a> <a href="https://t.co/tATG2TMoNj">pic.twitter.com/tATG2TMoNj</a></p>&mdash; Ken Wheeler (@ken_wheeler) <a href="https://twitter.com/ken_wheeler/status/764896872771321856">14 de agosto de 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br /><br />

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Built me a webpack console dashboard, with progress, status, build logs and browser console. I&#39;m tired. <a href="https://t.co/uoOz81Nf3M">pic.twitter.com/uoOz81Nf3M</a></p>&mdash; Ken Wheeler (@ken_wheeler) <a href="https://twitter.com/ken_wheeler/status/764580469677711360">13 de agosto de 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br /><br />

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Webpack Dashboard: 3k stars in 2 days. Huge demand for better UX in dev tools. Take note! <a href="https://t.co/QLY6qrODZK">https://t.co/QLY6qrODZK</a> <a href="https://t.co/AgRWA9o8TM">pic.twitter.com/AgRWA9o8TM</a></p>&mdash; Dan Abramov (@dan_abramov) <a href="https://twitter.com/dan_abramov/status/765575479302774784">16 de agosto de 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

<br /><br />

# webpack progressBar plugin

Esta es otra opción que es bastante simple pero cuando se trabaja en un proyecto grande y el tiempo de building aumenta, aunque sea mostrar una barra de progreso mejora bastante la experiencia del developer.
<img src="/static/images/blog/webpack-progressbar-plugin.gif" alt="webpack progressbar plugin" />
<br />

Para instalarlo necesitamos ejecutar:

```bash
npm install progress-bar-webpack-plugin --save-dev
```

Luego agregarlo como plugin en nuestro archivo de configuración de webpack:

```javascript
var ProgressBarPlugin = require('progress-bar-webpack-plugin');

...

plugins: [
  new ProgressBarPlugin()
]
```

Pueden ver el proyecto en <a href="https://github.com/clessg/progress-bar-webpack-plugin" target="_blank" rel="noopener">github</a> para ver mas opciones de configuración.

# webpack progress plugin

Y por último si se quiere tener algo aun mas simple o mas custom, podemos usar el <a href="https://webpack.github.io/docs/list-of-plugins.html#progressplugin" target="_blank">progressplugin provisto por webpack </a>.

Que básicamente se inserta como un plugin mas en nuestro archivo de configuración de webpack

```javascript
new webpack.ProgressPlugin(function handler(percentage, msg) {
  /* ... */
})
```

Podemos utilizar este hook para mostrar información del progreso, donde el percentage es un valor entre 0 y 1 que va indicando la completitud del proceso.

Por ejemplo lo podemos utilizar de la siguiente manera:

```javascript
new webpack.ProgressPlugin((percentage, msg) => {
  process.stdout.clearLine()
  process.stdout.write(` \u00BB building bundles: ${(percentage * 100.0).toFixed(2)} % => ${msg}\r`)
})
```

En este caso quiero ir mostrando la información en una sola linea por eso uso `\r`.

Y este ejemplo se puede ver así:
<img src="/static/images/blog/building-bundles.png" alt="building bundles" />
