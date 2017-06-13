'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('slideTemplate', {
                parent: 'entity',
                url: '/slideTemplates',
                data: {
                    roles: ['ROLE_TRAINER'],
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
                parent: 'entity',
                url: '/slideTemplate/{id}',
                data: {
                    roles: ['ROLE_TRAINER'],
                    pageTitle: 'SlideTemplate'
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
                    roles: ['ROLE_TRAINER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/slideTemplate/slideTemplate-dialog.html',
                        controller: 'SlideTemplateDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, content: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('slideTemplate', null, { reload: true });
                    }, function() {
                        $state.go('slideTemplate');
                    })
                }]
            })
            .state('slideTemplate.edit', {
                parent: 'slideTemplate',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_TRAINER'],
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/slideTemplate/slideTemplate-dialog.html',
                        controller: 'SlideTemplateDialogController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'SlideTemplate', function($stateParams, SlideTemplate) {
                        return SlideTemplate.get({id : $stateParams.id});
                    }]
                }
            });
    });
