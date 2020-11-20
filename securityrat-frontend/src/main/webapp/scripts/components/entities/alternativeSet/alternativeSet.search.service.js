'use strict';

angular.module('sdlctoolApp')
    .factory('AlternativeSetSearch', function ($resource) {
        return $resource('api/_search/alternativeSets/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
