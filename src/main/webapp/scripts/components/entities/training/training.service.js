'use strict';

angular.module('sdlctoolApp')
    .factory('Training', function ($resource, DateUtils) {
        return $resource('api/trainings/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.last_modified = DateUtils.convertDateTimeFromServer(data.last_modified);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });
