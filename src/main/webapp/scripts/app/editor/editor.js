'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('editor', {
                parent: 'site',
                url: '/',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/editor.html',
                        controller: 'EditorController'
                    }
                },
                resolve: {
                    
                }
            })
    });
