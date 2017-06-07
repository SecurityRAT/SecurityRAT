'use strict';

angular.module('securityratApp')
    .factory('SlideTemplate', function ($resource, DateUtils) {
        return $resource('api/slideTemplates/:id', {}, {
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
