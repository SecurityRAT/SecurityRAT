'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('requirementSkeleton', {
                parent: 'entity',
                url: '/requirementSkeletons',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'RequirementSkeletons'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/requirementSkeleton/requirementSkeletons.html',
                        controller: 'RequirementSkeletonController'
                    }
                },
                resolve: {
                }
            })
            .state('requirementSkeleton.detail', {
                parent: 'entity',
                url: '/requirementSkeleton/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'RequirementSkeleton'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/requirementSkeleton/requirementSkeleton-detail.html',
                        controller: 'RequirementSkeletonDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'RequirementSkeleton', function($stateParams, RequirementSkeleton) {
                        return RequirementSkeleton.get({id : $stateParams.id});
                    }]
                }
            })
            .state('requirementSkeleton.new', {
                parent: 'requirementSkeleton',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/requirementSkeleton/requirementSkeleton-dialog.html',
                        controller: 'RequirementSkeletonDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {universalId: null, shortName: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('requirementSkeleton', null, { reload: true });
                    }, function() {
                        $state.go('requirementSkeleton');
                    });
                }]
            })
            .state('requirementSkeleton.edit', {
                parent: 'requirementSkeleton',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/requirementSkeleton/requirementSkeleton-dialog.html',
                        controller: 'RequirementSkeletonDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['RequirementSkeleton', function(RequirementSkeleton) {
                                return RequirementSkeleton.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('requirementSkeleton', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
            .state('requirementSkeleton.bulk', {
                parent: 'requirementSkeleton',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/requirementSkeleton/requirementSkeleton-bulk.html',
                        controller: 'RequirementSkeletonBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {universalId: null, shortName: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('requirementSkeleton', null, { reload: true });
                    }, function() {
                        $state.go('requirementSkeleton');
                    });
                }]
            });
    });
