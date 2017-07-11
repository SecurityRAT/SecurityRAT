'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingDetailController', function ($scope, $rootScope, $stateParams, entity, Training, TrainingTreeNode, OptColumn, CollectionInstance) {
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
