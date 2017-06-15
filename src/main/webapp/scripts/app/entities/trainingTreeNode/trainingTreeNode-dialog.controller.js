'use strict';

angular.module('securityratApp').controller('TrainingTreeNodeDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'TrainingTreeNode', 'Training',
        function($scope, $stateParams, $modalInstance, entity, TrainingTreeNode, Training) {

        $scope.trainingTreeNode = entity;
        $scope.trainingtreenodes = TrainingTreeNode.query();
        $scope.trainings = Training.query();
        $scope.load = function(id) {
            TrainingTreeNode.get({id : id}, function(result) {
                $scope.trainingTreeNode = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('securityratApp:trainingTreeNodeUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.trainingTreeNode.id != null) {
                TrainingTreeNode.update($scope.trainingTreeNode, onSaveFinished);
            } else {
                TrainingTreeNode.save($scope.trainingTreeNode, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
