'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('optColumnContent', {
                parent: 'entity',
                url: '/optColumnContents',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'OptColumnContents'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/optColumnContent/optColumnContents.html',
                        controller: 'OptColumnContentController'
                    }
                },
                resolve: {
                }
            })
            .state('optColumnContent.detail', {
                parent: 'entity',
                url: '/optColumnContent/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'OptColumnContent'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/optColumnContent/optColumnContent-detail.html',
                        controller: 'OptColumnContentDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'OptColumnContent', function($stateParams, OptColumnContent) {
                        return OptColumnContent.get({id : $stateParams.id});
                    }]
                }
            })
            .state('optColumnContent.new', {
                parent: 'optColumnContent',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumnContent/optColumnContent-dialog.html',
                        controller: 'OptColumnContentDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {content: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('optColumnContent', null, { reload: true });
                    }, function() {
                        $state.go('optColumnContent');
                    })
                }]
            })
            .state('optColumnContent.edit', {
                parent: 'optColumnContent',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumnContent/optColumnContent-dialog.html',
                        controller: 'OptColumnContentDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['OptColumnContent', function(OptColumnContent) {
                                return OptColumnContent.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('optColumnContent', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
            .state('optColumnContent.bulk', {
                parent: 'optColumnContent',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumnContent/optColumnContent-bulk.html',
                        controller: 'OptColumnContentBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('optColumnContent', null, { reload: true });
                    }, function() {
                        $state.go('optColumnContent');
                    });
                }]
            });
    });
