'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingRequirementNode', function ($resource, DateUtils) {
        return $resource('api/trainingRequirementNodes/:id', {}, {
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
