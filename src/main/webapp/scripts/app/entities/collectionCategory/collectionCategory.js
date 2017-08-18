'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('collectionCategory', {
                parent: 'entity',
                url: '/collectionCategorys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'CollectionCategorys'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/collectionCategory/collectionCategorys.html',
                        controller: 'CollectionCategoryController'
                    }
                },
                resolve: {
                }
            })
            .state('collectionCategory.detail', {
                parent: 'entity',
                url: '/collectionCategory/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'CollectionCategory'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/collectionCategory/collectionCategory-detail.html',
                        controller: 'CollectionCategoryDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'CollectionCategory', function($stateParams, CollectionCategory) {
                        return CollectionCategory.get({id : $stateParams.id});
                    }]
                }
            })
            .state('collectionCategory.new', {
                parent: 'collectionCategory',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/collectionCategory/collectionCategory-dialog.html',
                        controller: 'CollectionCategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function() {
                        $state.go('collectionCategory', null, { reload: true });
                    }, function() {
                        $state.go('collectionCategory');
                    });
                }]
            })
            .state('collectionCategory.edit', {
                parent: 'collectionCategory',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/collectionCategory/collectionCategory-dialog.html',
                        controller: 'CollectionCategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['CollectionCategory', function(CollectionCategory) {
                                return CollectionCategory.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function() {
                        $state.go('collectionCategory', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
	        .state('collectionCategory.bulk', {
	            parent: 'collectionCategory',
	            url: '/edit',
	            data: {
	                roles: ['ROLE_USER'],
	            },
	            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
	            	$uibModal.open({
	                    templateUrl: 'scripts/app/entities/collectionCategory/collectionCategory-bulk.html',
	                    controller: 'CollectionCategoryBulkController',
	                    size: 'lg',
	                    resolve: {
	                        entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
	                        }    
	                    }
	                }).result.then(function() {
	                    $state.go('collectionCategory', null, { reload: true });
	                }, function() {
	                	$state.go('collectionCategory');
	                });
	            }]
	        });
    });
