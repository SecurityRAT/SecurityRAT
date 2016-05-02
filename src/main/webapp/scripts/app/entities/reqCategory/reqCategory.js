'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('reqCategory', {
                parent: 'entity',
                url: '/reqCategorys',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'ReqCategorys'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/reqCategory/reqCategorys.html',
                        controller: 'ReqCategoryController'
                    }
                },
                resolve: {
                }
            })
            .state('reqCategory.detail', {
                parent: 'entity',
                url: '/reqCategory/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'ReqCategory'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/reqCategory/reqCategory-detail.html',
                        controller: 'ReqCategoryDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'ReqCategory', function($stateParams, ReqCategory) {
                        return ReqCategory.get({id : $stateParams.id});
                    }]
                }
            })
            .state('reqCategory.new', {
                parent: 'reqCategory',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/reqCategory/reqCategory-dialog.html',
                        controller: 'ReqCategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, shortcut: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('reqCategory', null, { reload: true });
                    }, function() {
                        $state.go('reqCategory');
                    })
                }]
            })
            .state('reqCategory.edit', {
                parent: 'reqCategory',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/reqCategory/reqCategory-dialog.html',
                        controller: 'ReqCategoryDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['ReqCategory', function(ReqCategory) {
                                return ReqCategory.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('reqCategory', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('reqCategory.bulk', {
                parent: 'reqCategory',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/reqCategory/reqCategory-bulk.html',
                        controller: 'ReqCategoryBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, shortcut: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('reqCategory', null, { reload: true });
                    }, function() {
                        $state.go('reqCategory');
                    })
                }]
            })
    });
