'use strict';
var util = require('util');
var istanbul = require('istanbul');
var path = require('path');
// makes the coverage path relative. This is required because the `browserift-istanbul` transforms
// takes the absolute file path which doesnt look good on coverage reports
var makeRelative = function (coverage) {
  var normalizedCoverage = {};
  Object.keys(coverage).forEach(function (filePath) {
    var val = coverage[filePath];
    var relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    val.path = relativePath;
    normalizedCoverage[relativePath] = val;
  });
  return normalizedCoverage;
};
// Reporter type
var Reporter = function (config, helper, logger) {
  var log = logger.create('reporter:optimizer');
  this.onBrowserComplete = function (browser, result) {
    var collector = new istanbul.Collector();
    collector.add(makeRelative(result.coverage));
    // normalize the reporters into an array
    log.debug('dumping coverage report(s) for ' + browser.name);
    if (!util.isArray(config.optimizer.coverage.reporters)) {
      config.optimizer.coverage.reporters = [
        config.optimizer.coverage.reporters
      ];
    }
    config.optimizer.coverage.reporters.forEach(function (reporterConfig) {
      var reportDir = path.join(reporterConfig.dir, browser.name);
      var reporter = new istanbul.Reporter(false, reportDir);
      reporter.add(reporterConfig.type);
      reporter.write(collector, true, function () {
        log.debug(reporterConfig.type + ' report generated at ' + reportDir);
      });
    });
  };
};

Reporter.$inject = [
  'config',
  'helper',
  'logger'
];

module.exports = Reporter;
