'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('statusColumnValue', {
                parent: 'entity',
                url: '/statusColumnValues',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'StatusColumnValues'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/statusColumnValue/statusColumnValues.html',
                        controller: 'StatusColumnValueController'
                    }
                },
                resolve: {
                }
            })
            .state('statusColumnValue.detail', {
                parent: 'entity',
                url: '/statusColumnValue/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'StatusColumnValue'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/statusColumnValue/statusColumnValue-detail.html',
                        controller: 'StatusColumnValueDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'StatusColumnValue', function($stateParams, StatusColumnValue) {
                        return StatusColumnValue.get({id : $stateParams.id});
                    }]
                }
            })
            .state('statusColumnValue.new', {
                parent: 'statusColumnValue',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/statusColumnValue/statusColumnValue-dialog.html',
                        controller: 'StatusColumnValueDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('statusColumnValue', null, { reload: true });
                    }, function() {
                        $state.go('statusColumnValue');
                    })
                }]
            })
            .state('statusColumnValue.edit', {
                parent: 'statusColumnValue',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/statusColumnValue/statusColumnValue-dialog.html',
                        controller: 'StatusColumnValueDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['StatusColumnValue', function(StatusColumnValue) {
                                return StatusColumnValue.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('statusColumnValue', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('statusColumnValue.bulk', {
                parent: 'statusColumnValue',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/statusColumnValue/statusColumnValue-bulk.html',
                        controller: 'StatusColumnValueBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('statusColumnValue', null, { reload: true });
                    }, function() {
                        $state.go('statusColumnValue');
                    })
                }]
            })
    });
