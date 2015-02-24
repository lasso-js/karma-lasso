'use strict';
var glob = require('glob');
var path = require('path');
var fs = require('fs-extra');
var sh = require('execSync');
var util = require('util');
var chokidar = require('chokidar');
// framework
var framework = function (emitter, config, logger) {
    var log = logger.create('framework:optimizer');
    // configure the filewriter to write the generated files inside the user specified temp
    // directory
    config.optimizer.fileWriter = {
        outputDir: config.optimizer.tempdir + '/static',
        'url-prefix': '/static',
        fingerprintsEnabled: false
    };
    // use the optimizer-require plugin if there already exists one
    var requirePlugin = {
        plugin: 'optimizer-require',
        config: {
            transforms: []
        }
    };
    var pluginIndex = 0;
    var spliceCount = 0;
    config.optimizer.plugins.forEach(function (plugin, index) {
        if(plugin === 'optimizer-require' || plugin.plugin === 'optimizer-require') {
            requirePlugin = plugin;
            pluginIndex = index;
            spliceCount = 1;
        }
    });
    // include the autowatch transform if watch is true
    if (config.autoWatch !== false) {
        requirePlugin.config.transforms.push('karma-optimizer/lib/transforms/watcher');
    }
    // include the instrumentation transform if the coverage is to be done
    if (config.optimizer.coverage) {
        requirePlugin.config.transforms.push('karma-optimizer/lib/transforms/coverage');
    }
    // add or update the optimizer-require configuration
    config.optimizer.plugins.splice(pluginIndex, spliceCount, requirePlugin);
    // normalize the files param to an array 
    if (!util.isArray(config.files)) {
        config.files = [
            config.files
        ];
    }
    var filesArray = [];
    // `config.files` will have a list of glob patterns. we convert it into a list of files 
    config.files.map(function (oneConfig) {
        return oneConfig.pattern;
    }).map(function (pattern) {
        log.debug('Processing ', pattern);
        return path.relative(
            process.cwd(),
            pattern
        ).replace(/\\/g, '/');
    }).map(function (pattern) {
        log.debug('Glob Pattern: ', pattern);
        var files = glob.sync(pattern);
        filesArray.push.apply(filesArray, files);
    });
    // add all dependencies into require run so that optimizer can work on it.
    var dependencies = filesArray.map(function (oneFile) {
        return 'require-run: ./' + oneFile;
    });
    log.debug('files array: ' + filesArray);
    var configPath = path.join(config.optimizer.tempdir, 'optimizer-config.json');
    log.debug('writing config at path: ' + configPath);
    var tempDir = config.optimizer.tempdir;
    var coverage = config.optimizer.coverage;
    delete config.optimizer.tempdir;
    delete config.optimizer.coverage;
    fs.outputJsonSync(
        configPath,
        config.optimizer
    );
    config.optimizer.tempdir = tempDir;
    config.optimizer.coverage = coverage;
    // create an optimizer.json file with all dependencies to use for raptorjs optimization
    var optimizerPath = path.join(config.optimizer.tempdir, 'optimizer.json');
    var outputPath = path.join(config.optimizer.tempdir, 'output.json');
    var watchPath = path.join(config.optimizer.tempdir, 'watch.json');
    log.debug('writing optimizer at path: ' + optimizerPath);
    fs.outputJsonSync(
        optimizerPath,
        {
            name: 'index',
            dependencies: dependencies
        }
    );
    // run the optimizer command
    var command = [
        'node',
        path.relative(
            process.cwd(),
            path.resolve(__dirname, 'helpers/optimizer-command.js')
        ),
        configPath,
        optimizerPath,
        outputPath,
        watchPath
    ].join(' ');
    log.debug('running command: ' + command);
    // FIXME: check for command errors
    sh.run(command);
    // clear the config.files array and push the newly created files into the array
    log.debug(config.files);
    config.files.forEach(function (oneFile) {
        oneFile.included = false;
        oneFile.served = false;
        oneFile.watched = false;
    });
    config.files.push.apply(config.files, fs.readJsonSync(outputPath).map(function (path) {
        return {
            pattern: path,
            served: true,
            included: true,
            watched: true
        };
    }));
    // setup auto watch if required
    if (config.autoWatch !== false) {
        var watchedFiles = fs.readJsonSync(watchPath);
        var watcher = chokidar.watch(watchedFiles.shift());
        watcher.add(watchedFiles);
        watcher.on('change', function(path) {
            console.log('File', path, 'has changed');
            log.debug('running command: ' + command);
            // FIXME: check for command errors
            sh.run(command);
        });
    }
};
framework.$inject = ['emitter', 'config', 'logger'];
module.exports = framework;
