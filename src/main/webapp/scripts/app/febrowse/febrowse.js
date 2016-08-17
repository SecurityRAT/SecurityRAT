'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('febrowse', {
                abstract: true,
                parent: 'site'
            });
    });
