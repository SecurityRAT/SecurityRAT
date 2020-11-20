'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('export', {
                parent: 'site',
                url: '/export',
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/export/export.html',
                        controller: 'ExportController'
                    }
                },
                resolve: {
                    
                }
            });
    });
