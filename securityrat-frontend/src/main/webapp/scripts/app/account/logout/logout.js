'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('logout', {
                parent: 'account',
                url: '/logout',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/logout/logout.html',
                        controller: 'LogoutController'
                    }
                }
            });
    });
