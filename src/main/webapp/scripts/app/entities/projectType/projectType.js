'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('projectType', {
                parent: 'entity',
                url: '/projectTypes',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'ProjectTypes'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/projectType/projectTypes.html',
                        controller: 'ProjectTypeController'
                    }
                },
                resolve: {
                }
            })
            .state('projectType.detail', {
                parent: 'entity',
                url: '/projectType/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'ProjectType'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/projectType/projectType-detail.html',
                        controller: 'ProjectTypeDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'ProjectType', function($stateParams, ProjectType) {
                        return ProjectType.get({id : $stateParams.id});
                    }]
                }
            })
            .state('projectType.new', {
                parent: 'projectType',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/projectType/projectType-dialog.html',
                        controller: 'ProjectTypeDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('projectType', null, { reload: true });
                    }, function() {
                        $state.go('projectType');
                    })
                }]
            })
            .state('projectType.edit', {
                parent: 'projectType',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/projectType/projectType-dialog.html',
                        controller: 'ProjectTypeDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['ProjectType', function(ProjectType) {
                                return ProjectType.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('projectType', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
             .state('projectType.bulk', {
                parent: 'projectType',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/projectType/projectType-bulk.html',
                        controller: 'ProjectTypeBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('projectType', null, { reload: true });
                    }, function() {
                        $state.go('projectType');
                    })
                }]
            })
    });
