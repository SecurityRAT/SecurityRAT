'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingCustomSlideNodeSearch', function ($resource) {
        return $resource('api/_search/trainingCustomSlideNodes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
