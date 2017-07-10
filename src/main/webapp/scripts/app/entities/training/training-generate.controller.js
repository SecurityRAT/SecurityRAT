angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, $state, entity, Training) {
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
            $state.go('training', null, { reload: true });
        };
    });
