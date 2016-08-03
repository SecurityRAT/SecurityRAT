'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('password', {
                parent: 'account',
                url: '/password',
                data: {
                    roles: [],
                    pageTitle: 'Password'
                },
                params: {
                	confirmed : false
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/account/password/password.html',
                        controller: 'PasswordController'
                    }
                },
                // redirect to confirm password to confirm the user before change his password.
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
