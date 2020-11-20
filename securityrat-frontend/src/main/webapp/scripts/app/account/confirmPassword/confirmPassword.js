'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('confirmPassword', {
                parent: 'account',
                url: '/confirmPassword',
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN'], 
                    pageTitle: 'Confirm Password'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/confirmPassword/confirmPassword.html',
                        controller: 'ConfirmPasswordController'
                    }
                },
                resolve: {
                    
                }
            });
    });
