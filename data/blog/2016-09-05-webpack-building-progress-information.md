---
title: Webpack información del building
author: Marcelo Carmona
layout: post
lang: en
permalink: webpack-building-progress-information
path: 2016-09-05-webpack-building-progress-information.md
tags:
  - Webpack
  - Javascript
---

When we use webpack to generate our bundles in many cases in our development environment it is convenient to show information about the size of each module, the bundles themselves, the time it takes to carry out the process, if we are transpiling the code through babel for example or using postcss to preprocess our style sheets.

The options that we currently have to be able to show this information are made through webpack plugins. I will give three simple alternatives to be able to show this type of information.

# webpack-dashboard

This <a href="https://github.com/FormidableLabs/webpack-dashboard" target="_blank" rel="noopener">dashboard</a> was created by <a href="https://formidable.com/" target="_blank" rel="noopener">formidable.com</a> a good option that show information about:

- **Log**: the error log of the building process
- **Status**: status of the building process
- **Operation**: shows the specific operation that is performed in the building process
- **Progress**: live building progress
- **Module**: a list of your modules, their size and percentage with respect to the size of the bundle
- **Assets**: list of generated assets

If you normally use webpack with `webpack-dev-server` or `webpack-dev-middleware` you will be used to seeing something like this:
<img src="/img/posts/webpack-dashboard-dev-server.png" alt="webpack dashboard common example">

`webpack-dashboard` was created by <a href="https://formidable.com/blog/2016/08/15/introducing-webpack-dashboard/" target="_blank" rel="noopener">Ken Wheeler</a> It looks like this :)
<img src="/img/posts/webpack-dashboard-screen-shot.png" alt="webpack dashboard screen shot">

Here you can see it in action
<img src="/img/posts/webpack-dashboard-in-action.gif" alt="webpack dashboard in action">

Installing it is quite simple:

```bash
npm install webpack-dashboard --save-dev
```

Then we add the <a href="https://webpack.github.io/docs/plugins.html" target="_blank" rel="noopener">plugin</a> to our webpack configuration

```javascript
// Import the plugin:
var DashboardPlugin = require('webpack-dashboard/plugin')

// If you aren't using express, add it to your webpack configs plugins section:
plugins: [new DashboardPlugin()]

// If you are using an express based dev server, add it with compiler.apply
compiler.apply(new DashboardPlugin())
```

Now we have to call `webpack-dashboard` from your package.json.
If your dev server looks like this.

```javascript
"scripts": {
    "dev": "node index.js"
}
```

We must change it for this.

```javascript
"scripts": {
    "dev": "webpack-dashboard -- node index.js"
}
```

To see more information about the configuration you can see the project in <a href="https://github.com/FormidableLabs/webpack-dashboard">github</a>

As I said before, I think the proposal to have a dashboard to obtain relevant information about our projects seems very good.
Here I leave some tweets that were written at the time of its release.

<center>

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Up on the blog: <a href="https://twitter.com/ken_wheeler">@ken_wheeler</a> introduces Webpack Dashboard, a CLI dashboard for your Webpack-dev-server <a href="https://t.co/1jD1Q8lWRn">https://t.co/1jD1Q8lWRn</a></p>&mdash; Formidable (@FormidableLabs) <a href="https://twitter.com/FormidableLabs/status/765208945543610368">August 15, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br><br>

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Excited to announce the first turbo alpha version of webpack-dashboard is now released! <a href="https://t.co/OnYvgwHmXC">https://t.co/OnYvgwHmXC</a> <a href="https://t.co/tATG2TMoNj">pic.twitter.com/tATG2TMoNj</a></p>&mdash; Ken Wheeler (@ken_wheeler) <a href="https://twitter.com/ken_wheeler/status/764896872771321856">August 14, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br><br>

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Built me a webpack console dashboard, with progress, status, build logs and browser console. I&#39;m tired. <a href="https://t.co/uoOz81Nf3M">pic.twitter.com/uoOz81Nf3M</a></p>&mdash; Ken Wheeler (@ken_wheeler) <a href="https://twitter.com/ken_wheeler/status/764580469677711360">August 13, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br><br>

<blockquote class="twitter-tweet" data-lang="es"><p lang="en" dir="ltr">Webpack Dashboard: 3k stars in 2 days. Huge demand for better UX in dev tools. Take note! <a href="https://t.co/QLY6qrODZK">https://t.co/QLY6qrODZK</a> <a href="https://t.co/AgRWA9o8TM">pic.twitter.com/AgRWA9o8TM</a></p>&mdash; Dan Abramov (@dan_abramov) <a href="https://twitter.com/dan_abramov/status/765575479302774784">August 16, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</center>
<br><br>

# webpack progressBar plugin

This is another option that is quite simple but when you work on a large project and the building time increases, even if it is to show a progress bar, it improves the developer experience a lot.

<center><img src="/img/posts/webpack-progressbar-plugin.gif" alt="webpack progressbar plugin"></center>
<br>

To install it we need to execute:

```bash
npm install progress-bar-webpack-plugin --save-dev
```

Then add it as a plugin in our webpack configuration file:

```javascript
var ProgressBarPlugin = require('progress-bar-webpack-plugin');

...

plugins: [
  new ProgressBarPlugin()
]
```

You can see the project in <a href="https://github.com/clessg/progress-bar-webpack-plugin" target="_blank">github</a> to see more configuration options.

# webpack progress plugin

And finally, if you want to have something even simpler or more custom, we can use the <a href="https://webpack.github.io/docs/list-of-plugins.html#progressplugin" target="_blank" rel="noopener">progressplugin provisto por webpack </a>.

That is basically inserted as a plugin in our webpack configuration file.

```javascript
new webpack.ProgressPlugin(function handler(percentage, msg) {
  /* ... */
})
```

We can use this hook to show progress information, where the percentage is a value between 0 and 1 that indicates the completeness of the process.

For example, we can use it in the following way:

```javascript
new webpack.ProgressPlugin((percentage, msg) => {
  process.stdout.clearLine()
  process.stdout.write(` \u00BB building bundles: ${(percentage * 100.0).toFixed(2)} % => ${msg}\r`)
})
```

In this case I want to show the information in a single line so I use `\r`.

And this example can look like this:

<center><img src="/img/posts/building-bundles.png" alt="building bundles"></center>
