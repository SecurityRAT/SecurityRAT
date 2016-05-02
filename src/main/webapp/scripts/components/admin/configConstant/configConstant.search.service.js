'use strict';

angular.module('sdlctoolApp')
    .factory('ConfigConstantSearch', function ($resource) {
        return $resource('admin-api/_search/configConstants/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
