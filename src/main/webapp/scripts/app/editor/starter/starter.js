'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('starter', {
                parent: 'site',
                url: '/starter',
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/starter/starter.html',
                        controller: 'StarterController'
                    }
                },
                resolve: {
                    
                }
            });
    });