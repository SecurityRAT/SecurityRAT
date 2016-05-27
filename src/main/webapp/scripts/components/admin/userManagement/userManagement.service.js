'use strict';

angular.module('sdlctoolApp')
    .factory('UserManagement', function ($resource, DateUtils) {
        return $resource('admin-api/userAuthorities/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
