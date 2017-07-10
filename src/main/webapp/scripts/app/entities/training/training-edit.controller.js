angular.module('sdlctoolApp')
    .controller('TrainingEditController', function ($scope, $rootScope, $stateParams, $state, entity, Training) {
        $scope.Training = entity;

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.save = function() {
            if ($scope.Training.id != null) {
                Training.update($scope.Training, onSaveFinished);
            } else {
                Training.save($scope.Training, onSaveFinished);
            }

            // set form controller to "unsubmitted" state
            // $scope.editForm.$setUntouched();
            // $scope.editForm.$setPristine();
            // $state.go('training', null, {reload: true});
        };
    });
