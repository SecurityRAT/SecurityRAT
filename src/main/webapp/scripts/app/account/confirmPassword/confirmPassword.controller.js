'use strict';

angular.module('sdlctoolApp')
    .controller('ConfirmPasswordController', function ($rootScope, $scope, Auth, $state, $timeout) {
    	$timeout(function (){angular.element('[ng-model="password"]').focus();});
        $scope.confirm = function (event) {
	            Auth.confirmPassword($scope.password).then(function () {
	                $scope.authenticationError = false;
	                $state.go($rootScope.previousStateName, {confirmed: true});
	            }).catch(function () {
	                $scope.authenticationError = true;
	            });
        };
    });
