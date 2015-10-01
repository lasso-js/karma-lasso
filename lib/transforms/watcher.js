'use strict';
var through = require('through');
var minimatch = require('minimatch');
var fs = require('fs-extra');
var path = require('path');
// filename to store the output file
var fileName = process.argv[5];
// create a new file with an empty list of files to be watched
fs.outputJsonSync(fileName, []);

var defaultIgnore = [
    'node_modules/**'
];

module.exports = function(name) {
    // get the config
    var watcherConfig = fs.readJsonSync(process.argv[2]).watch || {};
    // get the included files
    var files = [].concat(watcherConfig.files || []);
    // get the ignored files
    var ignore = watcherConfig.defaultIgnore === false ? [] : defaultIgnore;
    ignore = ignore.concat(watcherConfig.ignore || []);
    function transform(file) {
        var relativePath = path.relative(process.cwd(), file);
        // if the file is to be ignored, do not instrument it
        if (ignore.some(minimatch.bind(null, relativePath))) {
            return through();
        }
        // if the file pattern is specified, test the files on it.
        if (files.length && !files.some(minimatch.bind(null, relativePath))) {
            return through();
        }
        // add the file to the watch list if not ignored
        var arr = fs.readJsonSync(fileName);
        arr.push(file);
        fs.outputJsonSync(fileName, arr);
        return through();
    }

    if (typeof name === 'string') {
        return transform(name);
    }
    return transform;
};
