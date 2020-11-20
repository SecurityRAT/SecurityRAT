'use strict';

angular.module('sdlctoolApp')
    .controller('PasswordController', function ($scope, Auth, Principal, $state) {
        var allowedChars = '[A-Z\\da-z\\!\"\\#\\$\\%\\&\\\'\\(\\)\\*\\.\\-\\,\\/\\:\\;\\<\\=\\>\\?\\@\\[\\]\\^\\_\\`\\{\\}\\|\\~\\+]';
        var regexPassword = '^(?=' + allowedChars + '*[a-z])(?=' + allowedChars +
            '*[A-Z])(?=' + allowedChars + '*\\d)(?=' + allowedChars + '*[\\!\"\\#\\$\\%\\&\\\'\\(\\)\\*\\.\\-\\,\\/\\:\\;\\<\\=\\>\\?\\@\\[\\]\\^\\_\\`\\{\\}\\|\\~\\+])' + allowedChars + "+$";
        $scope.passwordPattern = new RegExp(regexPassword);
        Principal.identity().then(function (account) {
            $scope.account = account;
        });

        $scope.success = null;
        $scope.error = null;
        $scope.doNotMatch = null;
        $scope.changePassword = function () {
            if ($scope.password !== $scope.confirmPassword) {
                $scope.doNotMatch = 'ERROR';
            } else {
                $scope.doNotMatch = null;
                Auth.changePassword($scope.password).then(function () {
                    $scope.error = null;
                    $scope.success = 'OK';
                    $state.go('editor');
                }).catch(function () {
                    $scope.success = null;
                    $scope.error = 'ERROR';
                });
            }
        };
    });
