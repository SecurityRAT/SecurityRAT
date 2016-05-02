'use strict';

angular.module('sdlctoolApp').controller('StatusColumnDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'StatusColumn', 'StatusColumnValue', 'ProjectType',
        function($scope, $stateParams, $uibModalInstance, entity, StatusColumn, StatusColumnValue, ProjectType) {

        $scope.statusColumn = entity;
        $scope.statuscolumnvalues = StatusColumnValue.query();
        $scope.projecttypes = ProjectType.query();
        $scope.load = function(id) {
            StatusColumn.get({id : id}, function(result) {
                $scope.statusColumn = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:statusColumnUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.statusColumn.id != null) {
                StatusColumn.update($scope.statusColumn, onSaveFinished);
            } else {
                StatusColumn.save($scope.statusColumn, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
