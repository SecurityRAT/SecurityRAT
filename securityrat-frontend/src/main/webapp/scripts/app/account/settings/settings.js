'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'account',
                url: '/settings',
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN'],
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
                onEnter: function($state, $stateParams, $timeout){
            		if(!$stateParams.confirmed) {
            			//timeout helps to complete previous current state before going to state confirm password.
            			$timeout(function(){
	                		$state.go('confirmPassword');
	                	});
            		}
                },
                resolve: {
                    
                }
            });
    });
