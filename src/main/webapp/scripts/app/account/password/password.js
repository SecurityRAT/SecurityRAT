'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('password', {
                parent: 'account',
                url: '/password',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'Password'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/password/password.html',
                        controller: 'PasswordController'
                    }
                },
                resolve: {
                    
                }
            });
    });
