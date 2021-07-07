'use strict';

angular.module('sdlctoolApp')
    .factory('MonitoringService', function ($rootScope, $http) {
        return {
            getMetrics: function () {
                return $http.get('management/jhimetrics').then(function (response) {
                    return response.data;
                });
            },

            checkHealth: function () {
                return $http.get('management/health').then(function (response) {
                    return response.data;
                });
            },

            threadDump: function () {
                return $http.get('management/threaddump').then(function (response) {
                    return response.data;
                });
            }
        };
    });
