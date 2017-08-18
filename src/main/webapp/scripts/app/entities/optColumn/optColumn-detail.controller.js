'use strict';

angular.module('sdlctoolApp')
    .controller('OptColumnDetailController', function ($scope, $rootScope, $stateParams, entity, OptColumn) {
        $scope.optColumn = entity;
        $scope.load = function (id) {
            OptColumn.get({id: id}, function(result) {
                $scope.optColumn = result;
            });
        };
        $rootScope.$on('sdlctoolApp:optColumnUpdate', function(event, result) {
            $scope.optColumn = result;
        });
    });
