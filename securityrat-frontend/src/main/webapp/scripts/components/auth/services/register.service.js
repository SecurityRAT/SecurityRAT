'use strict';

angular.module('sdlctoolApp')
    .factory('Register', function ($resource) {
        return $resource('api/register', {}, {
        });
    });


