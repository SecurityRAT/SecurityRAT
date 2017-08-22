angular.module('sdlctoolApp')
    .controller('TrainingEditController', function ($scope, $rootScope, $stateParams, $state, entity, Training) {
        $scope.training = entity;

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.save = function() {
            if ($scope.training.id != null) {
                Training.update($scope.training, onSaveFinished);
            } else {
                Training.save($scope.training, onSaveFinished);
            }
            $state.go('trainings', null, { reload: true });
        };

        $scope.cancel = function() {
            $state.go('trainings', {});
        };
    });
