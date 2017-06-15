'use strict';

angular.module('securityratApp')
    .controller('TrainingTreeNodeDetailController', function ($scope, $rootScope, $stateParams, entity, TrainingTreeNode, Training) {
        $scope.trainingTreeNode = entity;
        $scope.load = function (id) {
            TrainingTreeNode.get({id: id}, function(result) {
                $scope.trainingTreeNode = result;
            });
        };
        $rootScope.$on('securityratApp:trainingTreeNodeUpdate', function(event, result) {
            $scope.trainingTreeNode = result;
        });
    });
