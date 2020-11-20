'use strict';
/* jshint unused: false */
angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('optColumn', {
                parent: 'entity',
                url: '/optColumns',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'OptColumns'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/optColumn/optColumns.html',
                        controller: 'OptColumnController'
                    }
                },
                resolve: {
                }
            })
            .state('optColumn.detail', {
                parent: 'entity',
                url: '/optColumn/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'OptColumn'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/optColumn/optColumn-detail.html',
                        controller: 'OptColumnDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'OptColumn', function($stateParams, OptColumn) {
                        return OptColumn.get({id : $stateParams.id});
                    }]
                }
            })
            .state('optColumn.new', {
                parent: 'optColumn',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumn/optColumn-dialog.html',
                        controller: 'OptColumnDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: false, id: null, isVisibleByDefault: true};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('optColumn', null, { reload: true });
                    }, function() {
                        $state.go('optColumn');
                    });
                }]
            })
            .state('optColumn.edit', {
                parent: 'optColumn',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumn/optColumn-dialog.html',
                        controller: 'OptColumnDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['OptColumn', function(OptColumn) {
                                return OptColumn.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('optColumn', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
            .state('optColumn.bulk', {
                parent: 'optColumn',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumn/optColumn-bulk.html',
                        controller: 'OptColumnBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null, isVisibleByDefault: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('optColumn', null, { reload: true });
                    }, function() {
                        $state.go('optColumn');
                    });
                }]
            });
    });
