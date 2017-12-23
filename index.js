'use strict';

var inspect = require('util').inspect;

var compile = require('svelte').compile;
var objectAssign = require('object-assign');
var PluginError = require('gulp-util/lib/PluginError');
var replaceExt = require('replace-ext');
var Transform = require('stream').Transform;
var tryit = require('tryit');
var vinylSourcemapsApply = require('vinyl-sourcemaps-apply');
var path = require('path');

function getName(input) {
  return path
    .basename(input)
    .replace(path.extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1');
}

module.exports = function gulpSvelte(options) {
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (typeof file.isNull !== 'function') {
        cb(new PluginError('gulp-svelte', new TypeError(
          inspect(file) +
          ' is not a Vinyl file. Expected a Vinyl file object of a Svelte template.'
        )));
        return;
      }

      if (file.isNull()) {
        cb(null, file);
        return;
      }

      if (file.isStream()) {
        cb(new PluginError('gulp-svelte', 'Streaming not supported'));
        return;
      }

      var result;

      tryit(function() {
        result = compile(file.contents.toString(), objectAssign(
          {filename: file.path, name: file.path && getName(file.path)},
          options
        ));
      }, function(err) {
        if (err) {
          if (file.path) {
            err.fileName = file.path;
          }

          cb(new PluginError('gulp-svelte', err));
          return;
        }

        if (file.path) {
          file.path = replaceExt(file.path, '.js');
          result.map.file = file.path;
        } else {
          result.map.file = '__no_filename__';
        }

        file.contents = new Buffer(result.code);
        vinylSourcemapsApply(file.contents, result.map);

        cb(null, file);
      });
    }
  });
};
