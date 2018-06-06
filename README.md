# gulp-svelte

[![npm version](https://img.shields.io/npm/v/gulp-svelte.svg)](https://www.npmjs.com/package/gulp-svelte)
[![Build Status](https://travis-ci.org/shinnn/gulp-svelte.svg?branch=master)](https://travis-ci.org/shinnn/gulp-svelte)
[![Coverage Status](https://coveralls.io/repos/github/shinnn/gulp-svelte/badge.svg?branch=master)](https://coveralls.io/github/shinnn/gulp-svelte?branch=master)

[gulp](https://github.com/gulpjs/gulp) plugin to compile [Svelte](https://svelte.technology/) template to vanilla JavaScript

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
const gulp = require('gulp');
const gulpSvelte = require('gulp-svelte');

gulp.task('default', () => {
  return gulp.src('index.html') // index.html: '<h1>Hi {{author}}.</h1>'
    .pipe(gulpSvelte())
    .pipe(gulp.dest('dest')); // dest/index.js: 'function create_main_fragment ( state, component ) { ...'
});
```

## License

[ISC License](./LICENSE) © 2017 - 2018 Shinnosuke Watanabe
