'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tagCategory', {
                parent: 'entity',
                url: '/tagCategorys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'TagCategorys'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/tagCategory/tagCategorys.html',
                        controller: 'TagCategoryController'
                    }
                },
                resolve: {
                }
            })
            .state('tagCategory.detail', {
                parent: 'entity',
                url: '/tagCategory/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'TagCategory'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/tagCategory/tagCategory-detail.html',
                        controller: 'TagCategoryDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'TagCategory', function($stateParams, TagCategory) {
                        return TagCategory.get({id : $stateParams.id});
                    }]
                }
            })
            .state('tagCategory.new', {
                parent: 'tagCategory',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/tagCategory/tagCategory-dialog.html',
                        controller: 'TagCategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('tagCategory', null, { reload: true });
                    }, function() {
                        $state.go('tagCategory');
                    })
                }]
            })
            .state('tagCategory.edit', {
                parent: 'tagCategory',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/tagCategory/tagCategory-dialog.html',
                        controller: 'TagCategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['TagCategory', function(TagCategory) {
                                return TagCategory.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('tagCategory', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('tagCategory.bulk', {
                parent: 'tagCategory',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/tagCategory/tagCategory-bulk.html',
                        controller: 'TagCategoryBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('tagCategory', null, { reload: true });
                    }, function() {
                        $state.go('tagCategory');
                    })
                }]
            })
    });
