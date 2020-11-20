'use strict';

angular.module('sdlctoolApp')
    .controller('NavbarController', function ($scope, $state, Principal, ENV) {
    	$scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.inProduction = ENV === 'prod';
    });
