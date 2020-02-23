'use strict';

const {inspect} = require('util');
const {Transform} = require('stream');

const {compile, preprocess} = require('svelte/compiler');
const inspectWithKind = require('inspect-with-kind');
const isPlainObject = require('is-plain-object');
const {isVinyl} = require('vinyl');
const PluginError = require('plugin-error');
const vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

const preprocessors = new Set(['markup', 'script', 'style']);

module.exports = function gulpSvelte(...args) {
	const argLen = args.length;

	if (argLen > 1) {
		throw new PluginError('gulp-svelte', new RangeError(`Expected 0 or 1 argument (<Object>), but got ${argLen} arguments.`));
	}

	const [options = {}] = args;
	const preprocessOption = options.preprocess;

	if (argLen === 1) {
		if (!isPlainObject(options)) {
			throw new PluginError(
				'gulp-svelte',
				new TypeError(`Expected an options object to set Svelte compiler options https://github.com/sveltejs/svelte#compiler-options, but got ${
					inspectWithKind(options)
				}.`)
			);
		}

		const errors = [];
		const {format, generate, onerror} = options;

		if (format === 'amd' || format === 'iife' || format === 'umd') {
			errors.push(`Expected \`format\` option to be one of \`es\`, \`cjs\` and \`eval\`, but '${
				format
			}' was provided. gulp-svelte doesn't support legacy JavaScript formats \`amd\`, \`iife\` and \`umd\`.`);
		}

		if (generate === false) {
			errors.push('Expected `generate` option to be either `dom` or `ssr` (string), but false (boolean) was provided. gulp-svelte doesn\'t support {generate: false} as it\'s designed to emit code, not an AST.');
		}

		if (onerror !== undefined) {
			errors.push(`gulp-svelte doesn't support \`onerror\` option, but ${
				inspect(onerror)
			} was provided. Handle errors in the gulp way instead. https://github.com/gulpjs/gulp/blob/master/docs/why-use-pump/README.md#handling-the-errors`);
		}

		if (preprocessOption !== undefined) {
			if (!isPlainObject(preprocessOption)) {
				errors.push(`Expected \`preprocess\` option to be an <Object> to set Svelte preprocessor functions https://svelte.technology/guide#svelte-preprocess, but got ${
					inspectWithKind(preprocessOption)
				}.`);
			} else {
				for (const [key, value] of Object.entries(preprocessOption)) {
					if (preprocessors.has(key)) {
						if (typeof value !== 'function') {
							errors.push(`Expected every property of \`preprocess\` option to be a <Function>, but had \`${key}\` property was a non-function value ${
								inspectWithKind(value)
							}.`);
						}

						continue;
					}

					errors.push(`Expected \`preprocess\` option not to have any properties except for the supported ones \`markup\`, \`script\` and \`style\`, but had ${
						inspect(key)
					} property.`);
				}
			}
		}

		const errorLen = errors.length;

		if (errorLen === 1) {
			throw new PluginError('gulp-svelte', errors[0]);
		}

		if (errorLen !== 0) {
			throw new PluginError('gulp-svelte', `Found ${errorLen} errors in gulp-svelte options:
${errors.map((line, i) => `${i + 1}. ${line}`).join('\n')}`);
		}
	}

	return new Transform({
		objectMode: true,
		async transform(file, enc, cb) {
			if (!isVinyl(file)) {
				cb(new PluginError(
					'gulp-svelte',
					`Expected a Vinyl file object of a Svelte template, but got a non-Vinyl value ${
						inspectWithKind(file)
					}.`
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
				result = compile(preprocessOption ? (await preprocess(file.contents.toString(), preprocessOption)).toString() : file.contents.toString(), {
					filename: file.path,
					...options
				});
			} catch (err) {
				if (file.path) {
					err.fileName = file.path;
				}

				cb(new PluginError('gulp-svelte', err));
				return;
			}

			if (typeof result.css.code === 'string') {
				const cssFile = file.clone();

				if (file.path) {
					cssFile.extname = '.css';
					result.css.map.file = cssFile.path;
					cssFile.history = [cssFile.path];
				} else {
					result.css.map.file = '__no_filename__';
					result.css.map.sources = ['__no_filename__'];
				}

				cssFile.contents = Buffer.from(result.css.code);
				vinylSourcemapsApply(cssFile.contents, result.css.map);

				this.push(cssFile);
			}

			if (file.path) {
				file.extname = '.js';
				result.js.map.file = file.path;
			} else {
				result.js.map.file = '__no_filename__';
			}

			file.contents = Buffer.from(result.js.code);
			vinylSourcemapsApply(file.contents, result.js.map);

			cb(null, file);
		}
	});
};
