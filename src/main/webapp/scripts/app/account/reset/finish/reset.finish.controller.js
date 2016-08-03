'use strict';

angular.module('sdlctoolApp')
    .controller('ResetFinishController', function ($scope, $stateParams, $timeout, Auth) {

        $scope.keyMissing = $stateParams.key === undefined;
        $scope.doNotMatch = null;
        var allowedChars = "[A-Z\\da-z\\!\"\\#\\$\\%\\&\\'\\(\\)\\*\\.\\-\\,\\/\\:\\;\\<\\=\\>\\?\\@\\[\\]\\^\\_\\`\\{\\}\\|\\~\\+]";
        var regexPassword = "^(?=" + allowedChars + "*[a-z])(?=" + allowedChars 
		 + "*[A-Z])(?=" + allowedChars +"*\\d)(?=" + allowedChars +"*[\\!\"\\#\\$\\%\\&\\'\\(\\)\\*\\.\\-\\,\\/\\:\\;\\<\\=\\>\\?\\@\\[\\]\\^\\_\\`\\{\\}\\|\\~\\+])"+ allowedChars + "+$";
        $scope.passwordPattern = new RegExp(regexPassword);
        $scope.resetAccount = {};
        $timeout(function (){angular.element('[ng-model="resetAccount.password"]').focus();});

        $scope.finishReset = function() {
            if ($scope.resetAccount.password !== $scope.confirmPassword) {
                $scope.doNotMatch = 'ERROR';
            } else {
                Auth.resetPasswordFinish({key: $stateParams.key, newPassword: $scope.resetAccount.password}).then(function () {
                    $scope.success = 'OK';
                }).catch(function (response) {
                    $scope.success = null;
                    $scope.error = 'ERROR';

                });
            }

        };
    });
