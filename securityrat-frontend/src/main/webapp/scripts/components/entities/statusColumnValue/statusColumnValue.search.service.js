'use strict';

angular.module('sdlctoolApp')
    .factory('StatusColumnValueSearch', function ($resource) {
        return $resource('api/_search/statusColumnValues/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
