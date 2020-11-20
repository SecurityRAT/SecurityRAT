'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('slideTemplate', {
                parent: 'entity',
                url: '/slideTemplates',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN'],
                    pageTitle: 'SlideTemplates'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/slideTemplate/slideTemplates.html',
                        controller: 'SlideTemplateController'
                    }
                },
                resolve: {
                }
            })
            .state('slideTemplate.detail', {
                parent: 'slideTemplate',
                url: '/slideTemplates/{id}',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN'],
                    pageTitle: 'SlideTemplate'
                },
                params: {
                    isDirty : false
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/slideTemplate/slideTemplate-detail.html',
                        controller: 'SlideTemplateDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'SlideTemplate', function($stateParams, SlideTemplate) {
                        return SlideTemplate.get({id : $stateParams.id});
                    }]
                }
            })
            .state('slideTemplate.new', {
                parent: 'slideTemplate',
                url: '/new',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN'],
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/slideTemplate/slideTemplate-detail.html',
                        controller: 'SlideTemplateDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'SlideTemplate', function($stateParams, SlideTemplate) {
                        return SlideTemplate();
                    }]
                }
            })
    });
