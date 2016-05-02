'use strict';

angular.module('sdlctoolApp')
    .factory('TagInstanceSearch', function ($resource) {
        return $resource('api/_search/tagInstances/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
