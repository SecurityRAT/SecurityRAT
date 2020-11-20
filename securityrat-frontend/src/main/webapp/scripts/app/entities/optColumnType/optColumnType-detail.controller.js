'use strict';

angular.module('sdlctoolApp')
    .controller('OptColumnTypeDetailController', function ($scope, $rootScope, $stateParams, entity, OptColumnType) {
        $scope.optColumnType = entity;
        $scope.load = function (id) {
            OptColumnType.get({id: id}, function(result) {
                $scope.optColumnType = result;
            });
        };
        $rootScope.$on('sdlctoolApp:optColumnTypeUpdate', function(event, result) {
            $scope.optColumnType = result;
        });
    });
