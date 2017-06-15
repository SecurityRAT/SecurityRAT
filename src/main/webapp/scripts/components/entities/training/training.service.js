'use strict';

angular.module('securityratApp')
    .factory('Training', function ($resource, DateUtils) {
        return $resource('api/trainings/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.last_modified_date = DateUtils.convertLocaleDateFromServer(data.last_modified_date);
                    return data;
                }
            },
            'update': {
                method: 'PUT',
                transformRequest: function (data) {
                    data.last_modified_date = DateUtils.convertLocaleDateToServer(data.last_modified_date);
                    return angular.toJson(data);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {
                    data.last_modified_date = DateUtils.convertLocaleDateToServer(data.last_modified_date);
                    return angular.toJson(data);
                }
            }
        });
    });
