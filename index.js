'use strict';

const compile = require('svelte').compile;
const inspectWithKind = require('inspect-with-kind');
const PluginError = require('plugin-error');
const replaceExt = require('replace-ext');
const SafeBuffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;
const vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

module.exports = function gulpSvelte(options) {
	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			if (!file || typeof file !== 'object' || typeof file.isNull !== 'function') {
				cb(new PluginError(
					'gulp-svelte',
					new TypeError(`Expected a Vinyl file object of a Svelte template, but got a non-Vinyl value ${
						inspectWithKind(file)
					}.`)
				));
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

			file.contents = SafeBuffer.from(result.code);
			vinylSourcemapsApply(file.contents, result.map);

			cb(null, file);
		}
	});
};
