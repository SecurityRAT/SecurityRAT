'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('password', {
                parent: 'account',
                url: '/password',
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN'],
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
                onEnter: function($state, $stateParams, $timeout){
                		if(!$stateParams.confirmed) {
                			// complete state password before going to state confirmPassword
                			$timeout(function(){
                				$state.go('confirmPassword');
                			});
                		}
                },
                resolve: {
                }
            });
    });
