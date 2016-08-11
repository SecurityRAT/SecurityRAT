'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'account',
                url: '/settings',
                data: {
                    roles: [],
                    pageTitle: 'Settings'
                },
                params: {
                	confirmed : false
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/settings/settings.html',
                        controller: 'SettingsController'
                    }
                },
                // redirect to confirm password to confirm the user before he changes his data.                
                onEnter: function($state, $stateParams){
            		if(!$stateParams.confirmed) {
                		$state.go('confirmPassword');
            		}
                },
                resolve: {
                    
                }
            });
    });
