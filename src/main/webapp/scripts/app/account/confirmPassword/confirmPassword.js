'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('confirmPassword', {
                parent: 'account',
                url: '/confirmPassword',
                data: {
                    roles: [], 
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
