'use strict';

angular.module('securityratApp')
    .factory('TrainingTreeNodeSearch', function ($resource) {
        return $resource('api/_search/trainingTreeNodes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
