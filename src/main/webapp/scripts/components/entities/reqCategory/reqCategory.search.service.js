'use strict';

angular.module('sdlctoolApp')
    .factory('ReqCategorySearch', function ($resource) {
        return $resource('api/_search/reqCategorys/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
