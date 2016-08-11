'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tagInstance', {
                parent: 'entity',
                url: '/tagInstances',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'TagInstances'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/tagInstance/tagInstances.html',
                        controller: 'TagInstanceController'
                    }
                },
                resolve: {
                }
            })
            .state('tagInstance.detail', {
                parent: 'entity',
                url: '/tagInstance/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'TagInstance'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/tagInstance/tagInstance-detail.html',
                        controller: 'TagInstanceDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'TagInstance', function($stateParams, TagInstance) {
                        return TagInstance.get({id : $stateParams.id});
                    }]
                }
            })
            .state('tagInstance.new', {
                parent: 'tagInstance',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/tagInstance/tagInstance-dialog.html',
                        controller: 'TagInstanceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('tagInstance', null, { reload: true });
                    }, function() {
                        $state.go('tagInstance');
                    })
                }]
            })
            .state('tagInstance.edit', {
                parent: 'tagInstance',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/tagInstance/tagInstance-dialog.html',
                        controller: 'TagInstanceDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['TagInstance', function(TagInstance) {
                                return TagInstance.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('tagInstance', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            })
            .state('tagInstance.bulk', {
                parent: 'tagInstance',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/tagInstance/tagInstance-bulk.html',
                        controller: 'TagInstanceBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('tagInstance', null, { reload: true });
                    }, function() {
                        $state.go('tagInstance');
                    })
                }]
            })
    });
