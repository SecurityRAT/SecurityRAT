'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('collectionInstance', {
                parent: 'entity',
                url: '/collectionInstances',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'CollectionInstances'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/collectionInstance/collectionInstances.html',
                        controller: 'CollectionInstanceController'
                    }
                },
                resolve: {
                }
            })
            .state('collectionInstance.detail', {
                parent: 'entity',
                url: '/collectionInstance/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'CollectionInstance'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/collectionInstance/collectionInstance-detail.html',
                        controller: 'CollectionInstanceDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'CollectionInstance', function($stateParams, CollectionInstance) {
                        return CollectionInstance.get({id : $stateParams.id});
                    }]
                }
            })
            .state('collectionInstance.new', {
                parent: 'collectionInstance',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/collectionInstance/collectionInstance-dialog.html',
                        controller: 'CollectionInstanceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function() {
                        $state.go('collectionInstance', null, { reload: true });
                    }, function() {
                        $state.go('collectionInstance');
                    });
                }]
            })
            .state('collectionInstance.edit', {
                parent: 'collectionInstance',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/collectionInstance/collectionInstance-dialog.html',
                        controller: 'CollectionInstanceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['CollectionInstance', function(CollectionInstance) {
                                return CollectionInstance.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function() {
                        $state.go('collectionInstance', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
            .state('collectionInstance.bulk', {
	            parent: 'collectionInstance',
	            url: '/edit',
	            data: {
	                roles: ['ROLE_USER'],
	            },
	            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
	            	$uibModal.open({
                        templateUrl: 'scripts/app/entities/collectionInstance/collectionInstance-bulk.html',
                        controller: 'CollectionInstanceBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function() {
                        $state.go('collectionInstance', null, { reload: true });
                    }, function() {
                        $state.go('collectionInstance');
                    });
                }]
	        });
    });
