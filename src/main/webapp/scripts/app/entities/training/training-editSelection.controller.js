angular.module('sdlctoolApp')
    .controller('TrainingEditSelectionController', function ($scope, $rootScope, $stateParams, $state, entity, Training) {
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
            $state.go('training', null, { reload: true });
        };

        $scope.cancel = function() {
            $state.go('training', {});
        };
    });
