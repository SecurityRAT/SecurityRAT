'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingRequirementNodeSearch', function ($resource) {
        return $resource('api/_search/trainingRequirementNodes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
