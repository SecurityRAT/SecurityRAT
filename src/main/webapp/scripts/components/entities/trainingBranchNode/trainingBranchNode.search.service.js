'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingBranchNodeSearch', function ($resource) {
        return $resource('api/_search/trainingBranchNodes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
