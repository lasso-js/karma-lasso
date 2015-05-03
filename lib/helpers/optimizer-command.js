'use strict';
var optimizer = require('optimizer');
var fs = require('fs-extra');
var path = require('path');
var optimizerConfig = fs.readJsonSync(process.argv[2]);
var outputDir = optimizerConfig.fileWriter.outputDir;
// clear out the cache. If we don't do this, coverage and watch breaks
fs.removeSync('./.cache');
console.log('\t Saving optimization output to: ' + outputDir);
// get rid of the non standard configs
[
  'tempdir',
  'coverage',
  'watch',
  'files',
  'ignore'
].forEach(
  function (key) {
    delete optimizerConfig[key];
  }
);

optimizer.configure(optimizerConfig);
optimizer.optimizePage(
  fs.readJsonSync(process.argv[3]),
  function (err, optimizedPage) {
    if (err) {
      console.error(err);
      return process.exit(1);
    }
    var initFile = path.resolve(
      outputDir,
      'file-' + parseInt(Math.random() * 9999999) + '.js'
    );
    // we create a new file for inline javascripts so that it can be included as a separate
    // script tag
    fs.writeFileSync(initFile, optimizedPage.getBodyHtml().replace(/<.*?>/g, '').trim());
    var files = optimizedPage.getJavaScriptFiles();
    files.push(initFile);
    fs.outputJsonSync(process.argv[4], files);
  }
);
