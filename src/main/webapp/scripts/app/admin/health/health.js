'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('health', {
                parent: 'admin',
                url: '/apphealth',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'Health checks'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/health/health.html',
                        controller: 'HealthController'
                    }
                },
                resolve: {
                    
                }
            });
    });
