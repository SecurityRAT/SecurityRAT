'use strict';

angular.module('sdlctoolApp')
    .factory('StatusColumnSearch', function ($resource) {
        return $resource('api/_search/statusColumns/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
