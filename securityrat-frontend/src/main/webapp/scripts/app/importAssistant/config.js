'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider.state('importAssistantStep1', {
            parent: 'site',
            url: '/import/step1',
            data: {
                roles: [ 'ROLE_ADMIN' ]
            },
            views: {
                'content@': {
                    templateUrl: 'scripts/app/importAssistant/step1.html',
                    controller: 'ImportAssistantStep1Controller'
                }
            },
            resolve: {}
        })
        .state('importAssistantStep2', {
            parent: 'site',
            url: '/import/step2',
            data: {
                roles: [ 'ROLE_ADMIN' ]
            },
            views: {
                'content@': {
                    templateUrl: 'scripts/app/importAssistant/step2.html',
                    controller: 'ImportAssistantStep2Controller'
                }
            },
            resolve: {}
        })
        .state('importAssistantStep3', {
            parent: 'site',
            url: '/import/step3',
            data: {
                roles: [ 'ROLE_ADMIN' ]
            },
            views: {
                'content@': {
                    templateUrl: 'scripts/app/importAssistant/step3.html',
                    controller: 'ImportAssistantStep3Controller'
                }
            },
            resolve: {}
        });
    });
