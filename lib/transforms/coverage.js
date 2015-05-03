'use strict';
var istanbul = require('istanbul');
var through = require('through');
var minimatch = require('minimatch');
var fs = require('fs-extra');
var path = require('path');

var defaultIgnore = [
  'node_modules/**',
  'test/**',
  'tests/**',
  '!**/*.js'
];
module.exports = function (name) {
  // get the config
  var coverageConfig = fs.readJsonSync(process.argv[2]).coverage || {};
  // get the included files
  var files = [].concat(coverageConfig.files || []);
  // get the ignored files
  var ignore = coverageConfig.defaultIgnore === false ? [] : defaultIgnore;
  ignore = ignore.concat(coverageConfig.ignore || []);
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

    // instrument the non ignored files
    var instrumenter = new istanbul.Instrumenter(coverageConfig.instrumenterConfig || {});
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

  if (typeof name === 'string') {
    return transform(name);
  }
  return transform;
};
