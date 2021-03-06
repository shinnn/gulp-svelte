# gulp-svelte

[![npm version](https://img.shields.io/npm/v/gulp-svelte.svg)](https://www.npmjs.com/package/gulp-svelte)
[![Build Status](https://travis-ci.com/shinnn/gulp-svelte.svg?branch=master)](https://travis-ci.com/shinnn/gulp-svelte)
[![Coverage Status](https://coveralls.io/repos/github/shinnn/gulp-svelte/badge.svg?branch=master)](https://coveralls.io/github/shinnn/gulp-svelte?branch=master)

A [gulp](https://github.com/gulpjs/gulp) plugin to compile [Svelte](https://svelte.technology/) templates to JavaScript

## Installation

[Use](https://docs.npmjs.com/cli/install/) [npm](https://docs.npmjs.com/about-npm/).

```
npm install --save-dev gulp-svelte
```

## API

```javascript
const gulpSvelte = require('gulp-svelte');
```

### gulpSvelte([*options*])

*options*: `Object` ([options for Svelte compiler API](https://github.com/sveltejs/svelte#compiler-options) and [`preprocess` option](#optionspreprocess))  
Return: [`stream.Transform`](https://nodejs.org/api/stream.html#stream_class_stream_transform)

```javascript
const {dest, src, task} = require('gulp');
const gulpSvelte = require('gulp-svelte');

task('default', () => {
  return src('index.html') // index.html: '<h1>Hi {{author}}.</h1>'
  .pipe(gulpSvelte())
  .pipe(dest('dest')); // dest/index.js: 'function create_main_fragment ( state, component ) { ...'
});
```

Note:

* `format` option doesn't support legacy JavaScript formats `amd`, `iife` and `umd`.
* `onerror` option is not supported.
* If `css` option receives `false`, it also emits an extracted CSS as a separate [`Vinyl`](https://github.com/gulpjs/vinyl) object with a `.css` file extension.

```javascript
const {dest, src, task} = require('gulp');
const gulpSvelte = require('gulp-svelte');

task('default', () => {
  return src('source.html') // source.html: '<style>p{color:red}</style><p>Hello</p>'
  .pipe(gulpSvelte({css: false}))
  .pipe(dest('dest'));
    // dest/source.js: '... p = createElement("p"); p.className = "svelte-16e8uch"; ...'
    // dest/source.css: 'p.svelte-16e8uch{color:red}'
});
```

#### options.preprocess

Type: `Object`

Modify contents with [`svelte.preprocess()`](https://github.com/sveltejs/svelte#preprocessor-options) passing this option to it before compiling the template.

```javascript
const {dest, src, task} = require('gulp');
const gulpSvelte = require('gulp-svelte');

task('default', () => {
  return src('index.html') // index.html: '<b>original</b>'
  .pipe(gulpSvelte({
    preprocess: {
      markup({content}) {
        return {code: content.replace('original', 'modified')}
      }
    }
  }))
  .pipe(dest('dest')); // dest/index.js: '... b = createElement("b");\n\t\t\tb.textContent = "modified"; ...'
});
```

## License

[ISC License](./LICENSE) © 2017 - 2018 Shinnosuke Watanabe
