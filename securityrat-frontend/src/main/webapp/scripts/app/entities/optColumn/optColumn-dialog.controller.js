'use strict';

angular.module('sdlctoolApp').controller('OptColumnDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'OptColumn', 'OptColumnType', 'AlternativeSet', 'OptColumnContent', 'ProjectType',
        function($scope, $stateParams, $uibModalInstance, entity, OptColumn, OptColumnType, AlternativeSet, OptColumnContent, ProjectType) {

        $scope.optColumn = entity;
        $scope.optcolumntypes = OptColumnType.query();
        $scope.alternativesets = AlternativeSet.query();
        $scope.optcolumncontents = OptColumnContent.query();
        $scope.projecttypes = ProjectType.query();
        $scope.load = function(id) {
            OptColumn.get({id : id}, function(result) {
                $scope.optColumn = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:optColumnUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.optColumn.id !== null) {
                OptColumn.update($scope.optColumn, onSaveFinished);
            } else {
                OptColumn.save($scope.optColumn, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
