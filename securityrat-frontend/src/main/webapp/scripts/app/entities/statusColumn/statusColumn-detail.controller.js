'use strict';

angular.module('sdlctoolApp')
    .controller('StatusColumnDetailController', function ($scope, $rootScope, $stateParams, entity, StatusColumn) {
        $scope.statusColumn = entity;
        $scope.load = function (id) {
            StatusColumn.get({id: id}, function(result) {
                $scope.statusColumn = result;
            });
        };
        $rootScope.$on('sdlctoolApp:statusColumnUpdate', function(event, result) {
            $scope.statusColumn = result;
        });
    });
