'use strict';

angular.module('securityratApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('trainingTreeNode', {
                parent: 'entity',
                url: '/trainingTreeNodes',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'TrainingTreeNodes'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/trainingTreeNode/trainingTreeNodes.html',
                        controller: 'TrainingTreeNodeController'
                    }
                },
                resolve: {
                }
            })
            .state('trainingTreeNode.detail', {
                parent: 'entity',
                url: '/trainingTreeNode/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'TrainingTreeNode'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/trainingTreeNode/trainingTreeNode-detail.html',
                        controller: 'TrainingTreeNodeDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'TrainingTreeNode', function($stateParams, TrainingTreeNode) {
                        return TrainingTreeNode.get({id : $stateParams.id});
                    }]
                }
            })
            .state('trainingTreeNode.new', {
                parent: 'trainingTreeNode',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/trainingTreeNode/trainingTreeNode-dialog.html',
                        controller: 'TrainingTreeNodeDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {node_type: null, sort_order: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('trainingTreeNode', null, { reload: true });
                    }, function() {
                        $state.go('trainingTreeNode');
                    })
                }]
            })
            .state('trainingTreeNode.edit', {
                parent: 'trainingTreeNode',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/trainingTreeNode/trainingTreeNode-dialog.html',
                        controller: 'TrainingTreeNodeDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['TrainingTreeNode', function(TrainingTreeNode) {
                                return TrainingTreeNode.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('trainingTreeNode', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
