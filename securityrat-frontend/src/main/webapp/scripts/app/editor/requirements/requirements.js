'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('requirements', {
                parent: 'site',
                url: '/requirements',
                cache: false,
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/requirements/requirements.html',
                        controller: 'RequirementsController',
                        reload: true
                    }
                },
                resolve: {

                },
                onEnter : function(sharedProperties, $state) {
                    if(angular.isUndefined(sharedProperties.getProperty())){
                        $state.go('editor');
                    }
                }
            });
    });
