[![Build Status](https://travis-ci.org/lasso-js/karma-lasso.svg)](https://travis-ci.org/lasso-js/karma-lasso)
[![Code Climate](https://codeclimate.com/github/lasso-js/karma-lasso/badges/gpa.svg)](https://codeclimate.com/github/lasso-js/karma-lasso)

[![Dependency Status](https://david-dm.org/lasso-js/karma-lasso.svg)](https://david-dm.org/lasso-js/karma-lasso)
[![devDependency Status](https://david-dm.org/lasso-js/karma-lasso/dev-status.svg)](https://david-dm.org/lasso-js/karma-lasso#info=devDependencies)
[![peerDependency Status](https://david-dm.org/lasso-js/karma-lasso/peer-status.svg)](https://david-dm.org/lasso-js/karma-lasso#info=peerDependencies)

# karma-lasso

> Karma Plugin for [Lasso.js](https://github.com/lasso-js/lasso).


## Installation

The easiest way is to keep `karma-lasso` as a devDependency in your `package.json`.

```json

{
    "devDependencies": {
        "karma": "~0.10",
        "karma-lasso": "^0.0"
    }
}

```

or you can simply do it by:

```bash

npm install karma-lasso --save-dev

```


## Configuration

**Make sure you include `lasso` is the first element in the frameworks array so that optimization happens before other
frameworks add their sources in the source list.**

The basic configuration for karma-lasso is detailed below:

### For Simple karma testing

``` javascript

// karma.conf.js
module.exports = function (config) {
    config.set({
        browsers: [
            'PhantomJS'
        ],
        reporters: [
            'mocha'
        ],
        // 1. specify the config to be passed to lasso in the lasso key
        lasso: {
            plugins: [
                'i18n-ebay/lasso/plugin',
                'lasso-less',
                'lasso-dust',
            ],
            minify: false,
            bundlingEnabled: false,
            resolveCssUrls: true,
            cacheProfile: 'development',
            // 2. tempdir is the directory where all the generated files will be stored.
            tempdir: './.test'
        },
        // 3. lasso should be added as a framework so that it can do bundling before tests
        frameworks: [
            'lasso',
            'mocha',
            'chai'
        ],
        // 4. Only specify the main test file that requires the source files. karma-lasso
        // will expand it and add all required files
        files: [
            './test/client/**/*.js'
        ],
        // 5. Add karma-lasso as a plugin
        plugins: [
            // .. other plugins
            'karma-lasso'
        ]
    });
};

```


### For karma testing and coverage reports


``` javascript

// karma.conf.js
module.exports = function (config) {
    config.set({
        browsers: [
            'PhantomJS'
        ],
        // 1. for generating coverage reports, add lasso as a reporter in config
        reporters: [
            'mocha',
            'lasso'
        ],
        // 2. specify the config to be passed to lasso in the lasso key
        lasso: {
            plugins: [
                'i18n-ebay/lasso/plugin',
                'lasso-less',
                'lasso-dust',
            ],
            minify: false,
            bundlingEnabled: false,
            resolveCssUrls: true,
            cacheProfile: 'development',     
            // 3. tempdir is the directory where all the generated files will be stored.
            tempdir: './.coverage',
            // 4. to enable coverage, the coverage key should be added in the lasso config
            coverage: {
                // 5. A string glob pattern or an array of patterns matching the files for which,
                // coverage report is to be generated 
                files: 'src/**/*.js',
                // 6. Specify the reporters to be used for coverage output. All Istanbul
                // reporters are supported. Reporters can be an object if there is only one.
                // Otherwise, you can pass an array. Each reporter will have a type and a dir 
                // key. The report will be generated in the directory specified in the dir key
                // (one folder for each browser) 
                reporters: [
                    {
                        type: 'json',
                        dir: './.coverage/json/'
                    },
                    {
                        type: 'html',
                        dir: './.coverage/html-client/'
                    }
                ]
            }
        }
    });

```



## Available Options

To configure this plugin, the `lasso` key in karma-config must be set.

This key will accept all the configurations that can be passed to the raptorjs lasso, except for these keys:

1. `tempdir` specifies the location of the directory where temporarily created files should be stored.

2. `coverage` has the coverage configuration for the lasso. `coverage` can have the below keys

  - `defaultIgnore` - By default, all non javascript files and all files in `node_module`, `test` and `tests` folder are ignored. If `defaultIgnore` is set to false, these files will not be ignored by default. 
  
  - `ignore` - A glob pattern or an array of glob patterns specifying which files to ignore. This list will be checked along with the default ignore list if `defaultIgnore` is true or not set. If you only want the ignore list specified here to be used, set the defaultIgnore option to false.

  - `files` - A glob pattern or an array of glob patterns specifying which files to include for coverage. If a file is not ignored, it is tested with this pattern(s). If this option is not set, anything that is not ignored will be reported in coverage.
  
  - `reporters` - Used to specify the reporters to be used for coverage output. All Istanbul reporters are supported. Reporters can be an object if there is only one. Otherwise, you can pass an array. Each reporter will have a type and a dir key. The report will be generated in the directory specified in the dir key (one folder for each browser) 

3. `watch` has the watch configuration for lasso.

  - `defaultIgnore` - By default, all files in `node_module` folder are ignored. If `defaultIgnore` is set to false, these files will not be ignored by default. 
  
  - `ignore` - A glob pattern or an array of glob patterns specifying which files to ignore. This list will be checked along with the default ignore list if `defaultIgnore` is true or not set. If you only want the ignore list specified here to be used, set the defaultIgnore option to false.

  - `files` - A glob pattern or an array of glob patterns specifying which files to include for watch. If a file is not ignored, it is tested with this pattern(s). If this option is not set, anything that is not ignored will be watched.

4. `ignore` - A glob pattern or an array of glob patterns specifying which files to not optimize.

5. `files` - A glob pattern or an array of glob patterns specifying which files to include for optimization.

