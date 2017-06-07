'use strict';

angular.module('securityratApp')
    .controller('SlideTemplateDetailController', function ($scope, $rootScope, $stateParams, entity, SlideTemplate, User) {
        $scope.slideTemplate = entity;
        $scope.load = function (id) {
            SlideTemplate.get({id: id}, function(result) {
                $scope.slideTemplate = result;
            });
        };
        $rootScope.$on('securityratApp:slideTemplateUpdate', function(event, result) {
            $scope.slideTemplate = result;
        });
    });
