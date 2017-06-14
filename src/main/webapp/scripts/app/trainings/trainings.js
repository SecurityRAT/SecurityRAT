'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('trainings', {
                abstract: true,
                parent: 'site'
            });
    });
