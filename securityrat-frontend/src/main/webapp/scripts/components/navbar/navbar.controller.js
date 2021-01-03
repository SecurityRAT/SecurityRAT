'use strict';

angular.module('sdlctoolApp')
    .controller('NavbarController', function ($scope, $state, Principal, ENV, appConfig) {
    	$scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.inProduction = ENV === 'prod';
        $scope.showAssistant = JSON.parse(appConfig.showImportAssistant.toLowerCase());
    });
