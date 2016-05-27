'use strict';

angular.module('sdlctoolApp')
    .factory('Authorities', function ($resource, DateUtils) {
        return $resource('admin-api/authorities/:id', {}, {
            'query': { method: 'GET', isArray: true}
//        ,
//            'get': {
//                method: 'GET',
//                transformResponse: function (data) {
//                    data = angular.fromJson(data);
//                    return data;
//                }
//            },
//            'update': { method:'PUT' }
        });
        });