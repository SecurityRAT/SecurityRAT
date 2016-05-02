'use strict';

angular.module('sdlctoolApp').controller('ProjectTypeDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'ProjectType', 'StatusColumn', 'OptColumn', 'RequirementSkeleton',
        function($scope, $stateParams, $uibModalInstance, entity, ProjectType, StatusColumn, OptColumn, RequirementSkeleton) {

        $scope.projectType = entity;
        $scope.statuscolumns = StatusColumn.query();
        $scope.optcolumns = OptColumn.query();
        $scope.requirementskeletons = RequirementSkeleton.query();
        $scope.load = function(id) {
            ProjectType.get({id : id}, function(result) {
                $scope.projectType = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:projectTypeUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.projectType.id != null) {
                ProjectType.update($scope.projectType, onSaveFinished);
            } else {
                ProjectType.save($scope.projectType, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
