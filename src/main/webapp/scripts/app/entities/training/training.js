'use strict';

angular.module('securityratApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('training', {
                parent: 'entity',
                url: '/trainings',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'Trainings'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/trainings.html',
                        controller: 'TrainingController'
                    }
                },
                resolve: {
                }
            })
            .state('training.detail', {
                parent: 'entity',
                url: '/training/{id}',
                data: {
                    roles: ['ROLE_USER'],
                    pageTitle: 'Training'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/training-detail.html',
                        controller: 'TrainingDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'Training', function($stateParams, Training) {
                        return Training.get({id : $stateParams.id});
                    }]
                }
            })
            .state('training.new', {
                parent: 'training',
                url: '/new',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/training/training-dialog.html',
                        controller: 'TrainingDialogController',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {name: null, description: null, last_modified_date: null, id: null};
                            }
                        }
                    }).result.then(function(result) {
                        $state.go('training', null, { reload: true });
                    }, function() {
                        $state.go('training');
                    })
                }]
            })
            .state('training.edit', {
                parent: 'training',
                url: '/{id}/edit',
                data: {
                    roles: ['ROLE_USER'],
                },
                onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
                    $modal.open({
                        templateUrl: 'scripts/app/entities/training/training-dialog.html',
                        controller: 'TrainingDialogController',
                        size: 'lg',
                        resolve: {
                            entity: ['Training', function(Training) {
                                return Training.get({id : $stateParams.id});
                            }]
                        }
                    }).result.then(function(result) {
                        $state.go('training', null, { reload: true });
                    }, function() {
                        $state.go('^');
                    })
                }]
            });
    });
