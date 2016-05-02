'use strict';

angular.module('sdlctoolApp')
    .factory('TagInstance', function ($resource, DateUtils) {
        return $resource('api/tagInstances/:id', {}, {
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
