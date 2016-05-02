'use strict';

angular.module('sdlctoolApp')
    .factory('OptColumnType', function ($resource, DateUtils) {
        return $resource('api/optColumnTypes/:id', {}, {
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
