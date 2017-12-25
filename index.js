'use strict';

const inspect = require('util').inspect;

const compile = require('svelte').compile;
const PluginError = require('plugin-error');
const replaceExt = require('replace-ext');
const Transform = require('stream').Transform;
const vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

module.exports = function gulpSvelte(options) {
	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			if (typeof file.isNull !== 'function') {
				cb(new PluginError('gulp-svelte', new TypeError(`${inspect(file)
				} is not a Vinyl file. Expected a Vinyl file object of a Svelte template.`)));
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

			let result;

			try {
				result = compile(file.contents.toString(), Object.assign({filename: file.path}, options));
			} catch (err) {
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
		}
	});
};
