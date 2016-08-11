'use strict';

angular.module('sdlctoolApp')
    .controller('LogoutController', function (Auth) {
        Auth.logout();
    });
