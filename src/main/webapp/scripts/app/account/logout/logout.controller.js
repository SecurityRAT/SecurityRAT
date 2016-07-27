'use strict';

angular.module('sdlctoolApp')
    .controller('LogoutController', function ($scope, Auth, Principal) {
        Auth.logout();
        Principal.identity().then(function(account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });
    });
