'use strict';

angular.module('sdlctoolApp')
    .controller('StatusColumnValueDetailController', function ($scope, $rootScope, $stateParams, entity, StatusColumnValue) {
        $scope.statusColumnValue = entity;
        $scope.load = function (id) {
            StatusColumnValue.get({id: id}, function(result) {
                $scope.statusColumnValue = result;
            });
        };
        $rootScope.$on('sdlctoolApp:statusColumnValueUpdate', function(event, result) {
            $scope.statusColumnValue = result;
        });
    });
