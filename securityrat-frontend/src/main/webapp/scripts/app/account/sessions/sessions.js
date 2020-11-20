'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('sessions', {
                parent: 'account',
                url: '/sessions',
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN'],
                    pageTitle: 'Sessions'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/sessions/sessions.html',
                        controller: 'SessionsController'
                    }
                },
                
                resolve: {
                    
                }
            });
    });
