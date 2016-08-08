'use strict';

angular.module('sdlctoolApp')
    .controller('NavbarController', function ($scope, $location, $state, Auth, Principal, ENV, $rootScope) {
    	$scope.isCas = $rootScope.ANTHENTICATIONTYPE;
    	$scope.cannotRegister = !$rootScope.REGISTRATIONTYPE & !$rootScope.ANTHENTICATIONTYPE;
    	$scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.inProduction = ENV === 'prod';
        $scope.logout = function () {
            Auth.logout();
            $state.go('home');
        };
    });
