'use strict';

angular.module('securityratApp')
    .factory('TrainingSearch', function ($resource) {
        return $resource('api/_search/trainings/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
