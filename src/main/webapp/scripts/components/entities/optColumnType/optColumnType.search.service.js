'use strict';

angular.module('sdlctoolApp')
    .factory('OptColumnTypeSearch', function ($resource) {
        return $resource('api/_search/optColumnTypes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
