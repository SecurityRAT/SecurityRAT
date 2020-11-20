angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('home', {
                parent: 'site',
                url: '/invalid',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/main/main.html',
                        controller: 'MainController'
                    }
                },
                resolve: {
                    
                }
            });
    });