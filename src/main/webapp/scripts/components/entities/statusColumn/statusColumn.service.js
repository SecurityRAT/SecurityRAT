'use strict';

angular.module('sdlctoolApp')
    .factory('StatusColumn', function ($resource, DateUtils) {
        return $resource('api/statusColumns/:id', {}, {
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
