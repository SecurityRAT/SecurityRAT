'use strict';

angular.module('sdlctoolApp')
    .factory('TagCategorySearch', function ($resource) {
        return $resource('api/_search/tagCategorys/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
