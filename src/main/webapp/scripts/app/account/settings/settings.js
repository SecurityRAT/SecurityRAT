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
                onEnter: function(Auth, $timeout, $rootScope, $state, $stateParams){
            		if(!$stateParams.confirmed) {
	                	$timeout(function(){
	                		$state.go('confirmPassword');
	                	});
            		}
                },
                resolve: {
                    
                }
            });
    });
