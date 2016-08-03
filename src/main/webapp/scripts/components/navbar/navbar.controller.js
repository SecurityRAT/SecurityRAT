'use strict';

angular.module('sdlctoolApp')
    .controller('NavbarController', function ($scope, $location, $state, Auth, Principal, ENV, Util) {
    	Util.get()
    	.then(function(data) {
    		$scope.isCas = data === 'CAS' ? true : false;
    	});

    	$scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.inProduction = ENV === 'prod';
        $scope.logout = function () {
            Auth.logout();
            $state.go('home');
        };
    });
