'use strict';

angular.module('sdlctoolApp')
    .factory('CollectionCategorySearch', function ($resource) {
        return $resource('api/_search/collectionCategorys/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
