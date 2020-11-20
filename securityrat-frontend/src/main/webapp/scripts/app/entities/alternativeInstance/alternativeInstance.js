'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('alternativeInstance', {
                parent: 'entity',
                url: '/alternativeInstances',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'AlternativeInstances'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/alternativeInstance/alternativeInstances.html',
                        controller: 'AlternativeInstanceController'
                    }
                },
                resolve: {
                }
            })
            .state('alternativeInstance.detail', {
                parent: 'entity',
                url: '/alternativeInstance/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'AlternativeInstance'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/alternativeInstance/alternativeInstance-detail.html',
                        controller: 'AlternativeInstanceDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'AlternativeInstance', function($stateParams, AlternativeInstance) {
                        return AlternativeInstance.get({id : $stateParams.id});
                    }]
                }
            })
            .state('alternativeInstance.new', {
                parent: 'alternativeInstance',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/alternativeInstance/alternativeInstance-dialog.html',
                        controller: 'AlternativeInstanceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {content: null, id: null};
                            }
                        }
                    }).result.then(function() {
                        $state.go('alternativeInstance', null, { reload: true });
                    }, function() {
                        $state.go('alternativeInstance');
                    });
                }]
            })
            .state('alternativeInstance.edit', {
                parent: 'alternativeInstance',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/alternativeInstance/alternativeInstance-dialog.html',
                        controller: 'AlternativeInstanceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['AlternativeInstance', function(AlternativeInstance) {
                                return AlternativeInstance.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function() {
                        $state.go('alternativeInstance', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
            .state('alternativeInstance.bulk', {
                parent: 'alternativeInstance',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/alternativeInstance/alternativeInstance-bulk.html',
                        controller: 'AlternativeInstanceBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function() {
                        $state.go('alternativeInstance', null, { reload: true });
                    }, function() {
                        $state.go('alternativeInstance');
                    });
                }]
            });
    });
