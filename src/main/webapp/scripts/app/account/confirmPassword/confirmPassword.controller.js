'use strict';

angular.module('sdlctoolApp')
    .controller('ConfirmPasswordController', function ($rootScope, $scope, Auth, $state) {
        $scope.confirm = function (event) {
	            Auth.confirmPassword($scope.password).then(function () {
	                $scope.authenticationError = false;
	                $state.go($rootScope.previousStateName, {confirmed: true});
	            }).catch(function () {
	                $scope.authenticationError = true;
	            });
        };
    });
