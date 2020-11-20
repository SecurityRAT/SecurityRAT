'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('alternativeSet', {
                parent: 'entity',
                url: '/alternativeSets',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'AlternativeSets'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/alternativeSet/alternativeSets.html',
                        controller: 'AlternativeSetController'
                    }
                },
                resolve: {
                }
            })
            .state('alternativeSet.detail', {
                parent: 'entity',
                url: '/alternativeSet/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'AlternativeSet'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/alternativeSet/alternativeSet-detail.html',
                        controller: 'AlternativeSetDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'AlternativeSet', function($stateParams, AlternativeSet) {
                        return AlternativeSet.get({id : $stateParams.id});
                    }]
                }
            })
            .state('alternativeSet.new', {
                parent: 'alternativeSet',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/alternativeSet/alternativeSet-dialog.html',
                        controller: 'AlternativeSetDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: false, id: null};
                            }
                        }
                    }).result.then(function() {
                        $state.go('alternativeSet', null, { reload: true });
                    }, function() {
                        $state.go('alternativeSet');
                    });
                }]
            })
            .state('alternativeSet.edit', {
                parent: 'alternativeSet',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/alternativeSet/alternativeSet-dialog.html',
                        controller: 'AlternativeSetDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['AlternativeSet', function(AlternativeSet) {
                                return AlternativeSet.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function() {
                        $state.go('alternativeSet', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
             .state('alternativeSet.bulk', {
                parent: 'alternativeSet',
                url: '/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                	$uibModal.open({
                        templateUrl: 'scripts/app/entities/alternativeSet/alternativeSet-bulk.html',
                        controller: 'AlternativeSetBulkController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, showOrder: null, active: null, id: null};
                            }
                        }
                    }).result.then(function() {
                        $state.go('alternativeSet', null, { reload: true });
                    }, function() {
                        $state.go('alternativeSet');
                    });
                }]
            });
    });
