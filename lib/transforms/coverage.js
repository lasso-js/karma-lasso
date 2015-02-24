'use strict';
var istanbul = require('istanbul');
var through = require('through');
var minimatch = require('minimatch');

var defaultIgnore = [
    '**/node_modules/**',
    '**/test/**',
    '**/tests/**',
    '**/*.json'
];
module.exports = function (options, extraOptions) {
    options = options || {};
    function transform(file) {
        // ignore the default ignored files only if defaultIgnore is not set to false
        var ignore = options.defaultIgnore === false ? [] : defaultIgnore;
        ignore = ignore.concat(options.ignore || []);
        // if the file is to be ignored, do not instrument it
        if (ignore.some(minimatch.bind(null, file))) {
            return through();
        }
        // instrument the non ignored files
        var instrumenter = new (options.instrumenter || istanbul).Instrumenter(options.instrumenterConfig || {});
        var data = '';
        return through(function (buf) {
            data += buf;
        }, function () {
            var self = this;
            instrumenter.instrument(data, file, function (err, code) {
                if (!err) {
                    self.queue(code);
                } else {
                    self.emit('error', err);
                }
                self.queue(null);
            });
        });
    }

    if (typeof options === 'string') {
        var file = options;
        options = extraOptions || {};
        return transform(file);
    }
    return transform;
};
