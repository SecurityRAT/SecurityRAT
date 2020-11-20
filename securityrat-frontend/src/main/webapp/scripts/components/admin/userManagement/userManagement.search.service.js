'use strict';

angular.module('sdlctoolApp')
    .factory('UserManagementSearch', function ($resource) {
        return $resource('admin-api/_search/users/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
