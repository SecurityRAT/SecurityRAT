'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingEditController', function ($scope, $rootScope, $stateParams, $state, entity, Training) {
        $scope.Training = entity;
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
            $state.go('training', null, { reload: true });
        };
        

        $scope.save = function() {
            $state.params.isDirty = false;
            if ($scope.Training.id != null) {
                Training.update($scope.Training, onSaveFinished);
            } else {
                Training.save($scope.Training, onSaveFinished);
            }
        };

        $scope.cancel = function() {
            // this is done this way because the isDirty property was change by a child state.
            // Changing it in $StateParams would do no good even though this param was inherited by the child state.
            $state.params.isDirty = false;
            $state.go('training',{});
        };
    });
