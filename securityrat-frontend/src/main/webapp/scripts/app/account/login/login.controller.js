'use strict';

angular.module('sdlctoolApp')
    .controller('LoginController', function ($rootScope, $scope, $state, $timeout, Auth) {
    	$scope.user = {};
        $scope.errors = {};
        $scope.rememberMe = true;
        $('#username').focus();
        $timeout(function() {$('#username').focus();});
        $scope.login = function (event) {
            event.preventDefault();
            Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberMe: $scope.rememberMe
            }).then(function () {
                $scope.authenticationError = false;
                if ($rootScope.previousStateName === 'register') {
                    $state.go('editor');
                } else {
                    $rootScope.back();
                }
            }).catch(function () {
                $scope.authenticationError = true;
            });
        };
    });
