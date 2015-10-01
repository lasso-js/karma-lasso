'use strict';
// framework and reporter registration
module.exports = {
    'framework:lasso': [
        'factory',
        require('./framework')
    ],
    'reporter:lasso': [
        'type',
        require('./reporter')
    ]
};
