'use strict';
var through = require('through');
var minimatch = require('minimatch');
var fs = require('fs-extra');
var defaultIgnore = [
    '**/node_modules/**'
];
// filename to store the putput file
var fileName = process.argv[5];
// create a new file with an empty list of files to be watched
fs.outputJsonSync(fileName, []);

module.exports = function (options, extraOptions) {
    options = options || {};
    function transform(file) {
        // use the default list of ignores only ig the default ignore value is not false
        var ignore = options.defaultIgnore === false ? [] : defaultIgnore;
        ignore = ignore.concat(options.ignore || []);
        // if ignored, do not register the file for watch
        if (ignore.some(minimatch.bind(null, file))) {
            return through();
        }
        // add the file to the watch list if not ignored
        var arr = fs.readJsonSync(fileName);
        arr.push(file);
        fs.outputJsonSync(fileName, arr);
        return through();
    }

    if (typeof options === 'string') {
        var file = options;
        options = extraOptions || {};
        return transform(file);
    }
    return transform;
};
