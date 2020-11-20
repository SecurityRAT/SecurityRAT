'use strict';

angular.module('sdlctoolApp')
    .factory('AlternativeInstanceSearch', function ($resource) {
        return $resource('api/_search/alternativeInstances/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
