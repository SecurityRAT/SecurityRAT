'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('userManagement', {
                parent: 'admin',
                url: '/userManagement',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagement'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagement/userManagement.html',
                        controller: 'UserManagementController'
                    }
                },
                resolve: {
                }
            })
            .state('userManagement.detail', {
                parent: 'userManagement',
                url: '/userManagement/{id}',
                data: {
                    roles: ['ROLE_ADMIN'],
                    pageTitle: 'userManagement'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/admin/userManagement/userManagement-detail.html',
                        controller: 'UserManagementDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'UserManagement', function($stateParams, UserManagement) {
                        return UserManagement.get({id : $stateParams.id});
                    }]
                }
            })
            .state('userManagement.new', {
                parent: 'userManagement',
                url: '/new',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/admin/userManagement/userManagement-dialog.html',
                        controller: 'UserManagementDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {login: null, firstName: null, lastName: null, email: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('userManagement', null, { reload: true });
                    }, function() {
                        $state.go('userManagement');
                    })
                }]
            })
            .state('userManagement.edit', {
                parent: 'userManagement',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_ADMIN'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/admin/userManagement/userManagement-dialog.html',
                        controller: 'UserManagementDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['UserManagement', function(UserManagement) {
                                return UserManagement.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('userManagement', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
