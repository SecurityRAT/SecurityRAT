'use strict';

angular.module('sdlctoolApp').controller('StatusColumnValueDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'StatusColumnValue', 'StatusColumn',
        function($scope, $stateParams, $uibModalInstance, entity, StatusColumnValue, StatusColumn) {

        $scope.statusColumnValue = entity;
        $scope.statuscolumns = StatusColumn.query();
        $scope.load = function(id) {
            StatusColumnValue.get({id : id}, function(result) {
                $scope.statusColumnValue = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:statusColumnValueUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.statusColumnValue.id != null) {
                StatusColumnValue.update($scope.statusColumnValue, onSaveFinished);
            } else {
                StatusColumnValue.save($scope.statusColumnValue, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
