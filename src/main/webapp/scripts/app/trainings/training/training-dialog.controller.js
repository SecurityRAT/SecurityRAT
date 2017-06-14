'use strict';

angular.module('sdlctoolApp').controller('TrainingDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Training',
        function($scope, $stateParams, $modalInstance, entity, Training) {

        $scope.training = entity;
        $scope.load = function(id) {
            Training.get({id : id}, function(result) {
                $scope.training = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolAppl:trainingUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.training.id != null) {
                Training.update($scope.training, onSaveFinished);
            } else {
                Training.save($scope.training, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
