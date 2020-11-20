'use strict';

angular.module('sdlctoolApp')
    .factory('Password', function ($resource) {
        return $resource('api/account/change_password', {}, {
        });
    });

angular.module('sdlctoolApp')
    .factory('PasswordResetInit', function ($resource) {
        return $resource('api/account/reset_password/init', {}, {
        })
    });

angular.module('sdlctoolApp')
    .factory('PasswordResetFinish', function ($resource) {
        return $resource('api/account/reset_password/finish', {}, {
        })
    });
angular.module('sdlctoolApp')
.factory('ConfirmPassword', function ($resource) {
    return $resource('api/account/confirm_password', {}, {
    })
});
