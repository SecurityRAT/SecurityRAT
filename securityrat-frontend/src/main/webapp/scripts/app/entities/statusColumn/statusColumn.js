'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('statusColumn', {
                parent: 'entity',
                url: '/statusColumns',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'StatusColumns'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/statusColumn/statusColumns.html',
                        controller: 'StatusColumnController'
                    }
                },
                resolve: {
                }
            })
            .state('statusColumn.detail', {
                parent: 'entity',
                url: '/statusColumn/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'StatusColumn'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/statusColumn/statusColumn-detail.html',
                        controller: 'StatusColumnDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'StatusColumn', function($stateParams, StatusColumn) {
                        return StatusColumn.get({id : $stateParams.id});
                    }]
                }
            })
            .state('statusColumn.new', {
                parent: 'statusColumn',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/statusColumn/statusColumn-dialog.html',
                        controller: 'StatusColumnDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, isEnum: false, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('statusColumn', null, { reload: true });
                    }, function() {
                        $state.go('statusColumn');
                    })
                }]
            })
            .state('statusColumn.edit', {
                parent: 'statusColumn',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/statusColumn/statusColumn-dialog.html',
                        controller: 'StatusColumnDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['StatusColumn', function(StatusColumn) {
                                return StatusColumn.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('statusColumn', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('statusColumn.bulk', {
                parent: 'statusColumn',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/statusColumn/statusColumn-bulk.html',
                        controller: 'StatusColumnBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('statusColumn', null, { reload: true });
                    }, function() {
                        $state.go('statusColumn');
                    })
                }]
            });
    });
