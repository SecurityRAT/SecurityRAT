'use strict';

angular.module('sdlctoolApp')
    .factory('OptColumnContentSearch', function ($resource) {
        return $resource('api/_search/optColumnContents/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
