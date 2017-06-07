'use strict';

angular.module('sdlctoolApp')
    .controller('SlideTemplateDetailController', function ($scope, $rootScope, $stateParams, entity, SlideTemplate, User) {
        $scope.slideTemplate = entity;
        $scope.load = function (id) {
            SlideTemplate.get({id: id}, function(result) {
                $scope.slideTemplate = result;
            });
        };
        $rootScope.$on('sdlctoolApp:slideTemplateUpdate', function(event, result) {
            $scope.slideTemplate = result;
        });
    });
