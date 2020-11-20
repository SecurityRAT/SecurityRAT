'use strict';

angular.module('sdlctoolApp')
    .controller('SessionsController', function ($scope, Sessions, Principal) {
        Principal.identity().then(function(account) {
            $scope.account = account;
        });

        $scope.success = null;
        $scope.error = null;
        $scope.sessions = Sessions.getAll();
        $scope.invalidate = function (series) {
            // NOTE: We need to encode the "series" value in a format that can
            //       pass Spring's firewall. Thus, the parameter is not allowed
            //       to contain hexadecimal numbers with a percent sign as
            //       prefix (like '%2F').
            //
            // Fix is based on: https://stackoverflow.com/a/21648161 and
            //                  https://stackoverflow.com/a/13691499
            //
            // NOTE: The fix uses UTF-8 instead of UTF-16 because UTF-16 is a
            //       multibyte character set and we would have to mess around
            //       with the endianness (because JavaScript has no defined
            //       default endianness).

            series = (function hexEncode(src) {
                var hex, i, result = "";

                // utf16 -> utf8

                src = unescape(encodeURIComponent(src));

                // utf8 -> hex

                for (i = 0; i < src.length; i++) {
                    hex = src.charCodeAt(i).toString(16);
                    result += ("0" + hex).slice(-2);
                }

                return result;
            }) (series);

            Sessions.delete({series: series},
                function () {
                    $scope.error = null;
                    $scope.success = 'OK';
                    $scope.sessions = Sessions.getAll();
                },
                function () {
                    $scope.success = null;
                    $scope.error = 'ERROR';
                });
        };
    });
