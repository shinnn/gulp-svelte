'use strict';

var inspect = require('util').inspect;

var compile = require('svelte').compile;
var isVinyl = require('vinyl').isVinyl;
var objectAssign = require('object-assign');
var PluginError = require('gulp-util/lib/PluginError');
var Transform = require('stream').Transform;
var tryit = require('tryit');
var vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

module.exports = function gulpSvelte(options) {
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (!isVinyl(file)) {
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
        result = compile(file.contents.toString(), objectAssign({
          // https://github.com/sveltejs/svelte/issues/43
          // filename: file.path
        }, options));
      }, function(err) {
        if (err) {
          if (file.path) {
            err.fileName = file.path;
          }

          cb(new PluginError('gulp-svelte', err));
          return;
        }

        // Should re-enable this IF statement when https://github.com/sveltejs/svelte/issues/43 is fixed
        // if (result.map.file === null) {
        result.map.file = '__no_filename__';
        // }

        file.contents = new Buffer(result.code);
        vinylSourcemapsApply(file.contents, result.map);

        cb(null, file);
      });
    }
  });
};
