'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingCategoryNodeSearch', function ($resource) {
        return $resource('api/_search/trainingCategoryNodes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
