'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingSkeletonController', function ($scope, $rootScope, $stateParams, entity, Training, User, TrainingTreeNode) {
        $scope.training = entity;
        $scope.load = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
            });
        };
        $rootScope.$on('sdlctoolApp:trainingUpdate', function(event, result) {
            $scope.training = result;
        });
    });
