'use strict';

angular.module('sdlctoolApp')
    .factory('CollectionInstanceSearch', function ($resource) {
        return $resource('api/_search/collectionInstances/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
