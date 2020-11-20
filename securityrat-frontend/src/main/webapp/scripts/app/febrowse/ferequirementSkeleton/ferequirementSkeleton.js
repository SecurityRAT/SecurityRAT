'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('ferequirementSkeleton', {
                parent: 'febrowse',
                url: '/reqId',
                data: {
                    roles: ['ROLE_USER', 'ROLE_FRONTEND_USER', 'ROLE_ADMIN'],
                    pageTitle: 'Browse requirements'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/febrowse/ferequirementSkeleton/ferequirementSkeletons.html',
                        controller: 'FeRequirementSkeletonController'
                    }
                },
                resolve: {
                }
            })
            .state('ferequirementSkeleton.detail', {
                parent: 'ferequirementSkeleton',
                url: '/{id}',
                data: {
                    roles: ['ROLE_USER', 'ROLE_FRONTEND_USER', 'ROLE_ADMIN'],
                    pageTitle: 'Browse requirement'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/febrowse/ferequirementSkeleton/ferequirementSkeleton-detail.html',
                        controller: 'FeRequirementSkeletonDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'apiFactory', '$state', function($stateParams, apiFactory, $state) {
                       return apiFactory.getAll('requirementSkeletons/' + $stateParams.id).then(function(result) {
                        	return result;
                        });
                    }]
                }
            });
    });
