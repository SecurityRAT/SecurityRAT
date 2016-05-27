angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('requirements', {
                parent: 'site',
                url: '/requirements',
                cache: false,
                data: {
                    roles: ['ROLE_FRONTEND_USER']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/requirements.html',
                        controller: 'RequirementsController',
                        reload: true
                    }
                },
                resolve: {
                    
                },
            });
    });