'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('configConstant', {
                parent: 'admin',
                url: '/configConstants',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'configConstants'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/configConstant/configConstant.html',
                        controller: 'ConfigConstantController'
                    }
                },
                resolve: {
                }
            })
            .state('configConstant.detail', {
                parent: 'admin',
                url: '/configConstant/{id}',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'configConstant'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/configConstant/configConstant-detail.html',
                        controller: 'ConfigConstantDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'ConfigConstant', function($stateParams, ConfigConstant) {
                        return ConfigConstant.get({id : $stateParams.id});
                    }]
                }
            })
//            .state('configConstant.new', {
//                parent: 'configConstant',
//                url: '/new',
//                data: {
//                    roles: ['ROLE_ADMIN'],
//                },
//                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
//                	$uibModal.open({
//                        templateUrl: 'scripts/app/admin/configConstant/configConstant-dialog.html',
//                        controller: 'ConfigConstantDialogController',
//                        size: 'lg',
//                        resolve: {
//                            entity: function () {
//                                return {name: null, description: null, id: null};
//                            }
//                        }
//                    }).result.then(function(result) {
//                        $state.go('configConstant', null, { reload: true });
//                    }, function() {
//                        $state.go('configConstant');
//                    })
//                }]
//            })
            .state('configConstant.edit', {
                parent: 'configConstant',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/admin/configConstant/configConstant-dialog.html',
                        controller: 'ConfigConstantDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['ConfigConstant', function(ConfigConstant) {
                                return ConfigConstant.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('configConstant', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
