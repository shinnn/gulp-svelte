# gulp-svelte

[![npm version](https://img.shields.io/npm/v/gulp-svelte.svg)](https://www.npmjs.com/package/gulp-svelte)
[![Build Status](https://travis-ci.org/shinnn/gulp-svelte.svg?branch=master)](https://travis-ci.org/shinnn/gulp-svelte)
[![Coverage Status](https://coveralls.io/repos/github/shinnn/gulp-svelte/badge.svg?branch=master)](https://coveralls.io/github/shinnn/gulp-svelte?branch=master)

[gulp](https://github.com/gulpjs/gulp) plugin to compile [Svelte](https://svelte.technology/) template to JavaScript

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install --save-dev gulp-svelte
```

## API

```javascript
const gulpSvelte = require('gulp-svelte');
```

### gulpSvelte([*options*])

*options*: `Object` ([options for Svelte compiler API](https://github.com/sveltejs/svelte#options))  
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

If `css` option receives `false`, it also emits an extracted CSS as a separate [`Vinyl`](https://github.com/gulpjs/vinyl) object with a `.css` file extension.

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

## License

[ISC License](./LICENSE) © 2017 - 2018 Shinnosuke Watanabe
