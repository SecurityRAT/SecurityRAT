'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('starter', {
                parent: 'site',
                url: '/starter',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/starter.html',
                        controller: 'StarterController'
                    }
                },
                resolve: {
                    
                }
            });
    });