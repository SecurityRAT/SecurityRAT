'use strict';

angular.module('sdlctoolApp')
    .factory('OptColumnSearch', function ($resource) {
        return $resource('api/_search/optColumns/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
