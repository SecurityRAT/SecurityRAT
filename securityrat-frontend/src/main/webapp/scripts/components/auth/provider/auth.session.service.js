'use strict';

angular.module('sdlctoolApp')
    .factory('AuthServerProvider', function loginService($http, localStorageService, $rootScope) {
        return {
            login: function (credentials) {
                var data = 'j_username=' + encodeURIComponent(credentials.username) +
                    '&j_password=' + encodeURIComponent(credentials.password) +
                    '&remember-me=' + credentials.rememberMe + '&submit=Login';
                return $http.post('api/authentication', data, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            },
            logout: function () {
                // logout from the server
                $http.post('api/logout')
                    .then(function (response) {
                        localStorageService.clearAll();
                        if (!$rootScope.AUTHENTICATIONTYPE) {
                            // to get a new csrf token call the api                    
                            $http.get('api/account').then(function () { }).catch(function() {});
                            return response;
                        } else {
                            location.href = $rootScope.CASLOGOUTURL;
                        }
                    }, function() {});
            },
            getToken: function () {
                var token = localStorageService.get('token');
                return token;
            },
            hasValidToken: function () {
                var token = this.getToken();
                return !!token;
            }
        };
    });
