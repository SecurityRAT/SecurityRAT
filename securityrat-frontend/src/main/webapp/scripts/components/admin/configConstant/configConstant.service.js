'use strict';

angular.module('sdlctoolApp')
    .factory('ConfigConstant', function ($resource, DateUtils) {
        return $resource('admin-api/configConstants/:id', {}, {
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
