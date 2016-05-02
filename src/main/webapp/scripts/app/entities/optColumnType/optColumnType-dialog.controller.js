'use strict';

angular.module('sdlctoolApp').controller('OptColumnTypeDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'OptColumnType', 'OptColumn',
        function($scope, $stateParams, $uibModalInstance, entity, OptColumnType, OptColumn) {

        $scope.optColumnType = entity;
        $scope.optcolumns = OptColumn.query();
        $scope.load = function(id) {
            OptColumnType.get({id : id}, function(result) {
                $scope.optColumnType = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:optColumnTypeUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.optColumnType.id != null) {
                OptColumnType.update($scope.optColumnType, onSaveFinished);
            } else {
                OptColumnType.save($scope.optColumnType, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
