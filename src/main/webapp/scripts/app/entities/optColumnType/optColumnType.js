'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('optColumnType', {
                parent: 'entity',
                url: '/optColumnTypes',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'OptColumnTypes'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/optColumnType/optColumnTypes.html',
                        controller: 'OptColumnTypeController'
                    }
                },
                resolve: {
                }
            })
            .state('optColumnType.detail', {
                parent: 'entity',
                url: '/optColumnType/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'OptColumnType'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/optColumnType/optColumnType-detail.html',
                        controller: 'OptColumnTypeDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'OptColumnType', function($stateParams, OptColumnType) {
                        return OptColumnType.get({id : $stateParams.id});
                    }]
                }
            })
            .state('optColumnType.new', {
                parent: 'optColumnType',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumnType/optColumnType-dialog.html',
                        controller: 'OptColumnTypeDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('optColumnType', null, { reload: true });
                    }, function() {
                        $state.go('optColumnType');
                    })
                }]
            })
            .state('optColumnType.edit', {
                parent: 'optColumnType',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/optColumnType/optColumnType-dialog.html',
                        controller: 'OptColumnTypeDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['OptColumnType', function(OptColumnType) {
                                return OptColumnType.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('optColumnType', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
