'use strict';
// framework and reporter registration
module.exports = {
  'framework:optimizer': [
    'factory',
    require('./framework')
  ],
  'reporter:optimizer': [
    'type',
    require('./reporter')
  ]
};
