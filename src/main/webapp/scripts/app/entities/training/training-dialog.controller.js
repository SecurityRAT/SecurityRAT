'use strict';

angular.module('securityratApp').controller('TrainingDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'Training', 'User', 'TrainingTreeNode',
        function($scope, $stateParams, $modalInstance, entity, Training, User, TrainingTreeNode) {

        $scope.training = entity;
        $scope.users = User.query();
        $scope.trainingtreenodes = TrainingTreeNode.query();
        $scope.load = function(id) {
            Training.get({id : id}, function(result) {
                $scope.training = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('securityratApp:trainingUpdate', result);
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
