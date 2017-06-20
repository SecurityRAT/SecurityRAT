angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, entity, Training, User) {
        $scope.Training = entity;
        $scope.users = User.query();

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.save = function() {
            //console.log("save() on TrainingGenerateController called");

            if ($scope.Training.id != null) {
                Training.update($scope.Training, onSaveFinished);
            } else {
                Training.save($scope.Training, onSaveFinished);
            }
            $state.go('training', null, { reload: true });
        };
    });
