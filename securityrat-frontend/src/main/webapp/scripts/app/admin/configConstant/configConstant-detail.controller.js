'use strict';

angular.module('sdlctoolApp')
    .controller('ConfigConstantDetailController', function ($scope, $rootScope, $stateParams, entity, ConfigConstant) {
        $scope.constant = entity;
        $scope.load = function (id) {
        	ConfigConstant.get({id: id}, function(result) {
                $scope.constant = result;
            });
        };
        $rootScope.$on('sdlctoolApp:configConstantUpdate', function(event, result) {
            $scope.constant = result;
        });
    });
