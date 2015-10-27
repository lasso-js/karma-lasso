'use strict';
if (process.argv[6]) {
    process.argv[6].split(',').forEach(function(path) {
        if(path) {
            require('app-module-path').addPath(path);
        }
    });
}
var lasso = require('lasso');
var fs = require('fs-extra');
var path = require('path');
var lassoConfig = fs.readJsonSync(process.argv[2]);
var outputDir = lassoConfig.fileWriter.outputDir;
// clear out the cache. If we don't do this, coverage and watch breaks
fs.removeSync('./.cache');
console.log('\t Saving optimization output to: ' + outputDir);
// get rid of the non standard configs
[
    'tempdir',
    'coverage',
    'watch',
    'files',
    'ignore',
    'moduleSearchPath'
].forEach(
    function(key) {
        delete lassoConfig[key];
    }
);

lasso.configure(lassoConfig);
lasso.lassoPage(
    fs.readJsonSync(process.argv[3]),
    function(err, optimizedPage) {
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
        // adding css files as well as tests might need them
        var cssFiles = optimizedPage.getCSSFiles();
        files = files.concat(cssFiles);

        fs.outputJsonSync(process.argv[4], files);
    }
);
