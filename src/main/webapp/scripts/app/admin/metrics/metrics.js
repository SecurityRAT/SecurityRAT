'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('metrics', {
                parent: 'admin',
                url: '/appmetrics',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'Application Metrics'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/metrics/metrics.html',
                        controller: 'MetricsController'
                    }
                },
                resolve: {
                    
                }
            });
    });
