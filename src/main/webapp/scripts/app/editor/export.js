'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('export', {
                parent: 'site',
                url: '/export',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/export.html',
                        controller: 'ExportController'
                    }
                },
                resolve: {
                    
                }
            });
    });
