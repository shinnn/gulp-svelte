'use strict';

const path = require('path');
const {PassThrough} = require('stream');

const File = require('vinyl');
const test = require('tape');
const svelte = require('.');

const expected = 'function renderMainFragment ( root, component, target )';

test('gulp-svelte', t => {
  t.plan(8);

  svelte()
  .on('error', t.fail)
  .on('data', file => {
    t.deepEqual(file, new File(), 'should read null file as it is.');
  })
  .end(new File());

  svelte()
  .on('error', t.fail)
  .on('data', file => {
    t.strictEqual(
      file.contents.toString().substr(0, expected.length),
      expected,
      'should transform HTML with Svelte.'
    );
  })
  .end(new File({
    contents: Buffer.from('<p></p>')
  }));

  svelte()
  .on('error', t.fail)
  .on('data', file => {
    t.strictEqual(
      file.path,
      path.resolve('index.js'),
      'should replace the existing file extension with `.js`.'
    );
  })
  .end(new File({
    path: path.resolve('index.html'),
    contents: new Buffer(0)
  }));

  svelte()
  .on('error', err => {
    t.strictEqual(
      err.message,
      'Expected valid tag name',
      'should emit an error when it cannot parse the file.'
    );
    t.notOk(
      'fileName' in err,
      'should not include `fileName` property to the error when the object doesn\'t have filename.'
    );
  })
  .end(new File({contents: Buffer.from('</>')}));

  svelte()
  .on('error', err => {
    t.strictEqual(
      err.fileName,
      path.resolve('tmp.html'),
      'should include `fileName` property to the error when the object have filename.'
    );
  })
  .end(new File({
    path: path.resolve('tmp.html'),
    contents: Buffer.from('<a//>')
  }));

  svelte()
  .on('error', err => {
    t.strictEqual(
      err.message,
      'Streaming not supported',
      'should emit an error when it takes a stream-mode file.'
    );
  })
  .end(new File({contents: new PassThrough()}));

  svelte()
  .on('error', err => {
    t.strictEqual(
      err.message,
      '[ \'foo\' ] is not a Vinyl file. Expected a Vinyl file object of a Svelte template.',
      'should emit an error when it takes a non-Vinyl object.'
    );
  })
  .end(['foo']);
});
