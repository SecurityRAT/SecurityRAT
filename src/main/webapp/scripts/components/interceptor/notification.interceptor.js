 'use strict';

angular.module('sdlctoolApp')
    .factory('notificationInterceptor', function ($q, AlertService) {
        return {
            response: function(response) {
                var alertKey = response.headers('X-sdlctoolApp-alert');
                if (angular.isString(alertKey)) {
                    AlertService.success(alertKey, { param : response.headers('X-sdlctoolApp-params')});
                }
                return response;
            },
        };
    });