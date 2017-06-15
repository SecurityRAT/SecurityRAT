'use strict';

angular.module('securityratApp')
    .controller('TrainingDetailController', function ($scope, $rootScope, $stateParams, entity, Training, User, TrainingTreeNode) {
        $scope.training = entity;
        $scope.load = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
            });
        };
        $rootScope.$on('securityratApp:trainingUpdate', function(event, result) {
            $scope.training = result;
        });
    });
