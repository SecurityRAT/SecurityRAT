'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingGeneratedSlideNodeSearch', function ($resource) {
        return $resource('api/_search/trainingGeneratedSlideNodes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
