'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingTreeNodeSearch', function ($resource) {
        return $resource('api/_search/trainingTreeNodes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
