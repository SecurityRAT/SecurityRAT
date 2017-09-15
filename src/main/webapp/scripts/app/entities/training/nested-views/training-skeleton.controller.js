'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingSkeletonController', function ($scope, $rootScope, $stateParams, entity, Training, User, TrainingTreeNode) {
        $scope.training = entity;
        $scope.load = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
            });
        };

        $scope.setDirty = function() {
            $stateParams.isDirty = true;
        };

        $rootScope.$on('sdlctoolApp:trainingUpdate', function(event, result) {
            $scope.training = result;
        });

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.update = function () {
            //console.log("update() of training-skeleton.controller triggered!");
                // Training.update($scope.training, onSaveFinished);
                // push the data to the FormService instead:
                // TrainingForm.data = $scope.training.name;
                // console.log("Pushing to FormService: ", $scope.training.name);
        };
    });
