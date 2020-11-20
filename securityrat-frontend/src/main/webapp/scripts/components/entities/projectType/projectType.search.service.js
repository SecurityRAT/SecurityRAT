'use strict';

angular.module('sdlctoolApp')
    .factory('ProjectTypeSearch', function ($resource) {
        return $resource('api/_search/projectTypes/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
