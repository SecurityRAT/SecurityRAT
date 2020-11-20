'use strict';

angular.module('sdlctoolApp').controller('ReqCategoryDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'ReqCategory', 'RequirementSkeleton',
        function($scope, $stateParams, $uibModalInstance, entity, ReqCategory, RequirementSkeleton) {

        $scope.reqCategory = entity;
        $scope.requirementskeletons = RequirementSkeleton.query();
        $scope.load = function(id) {
            ReqCategory.get({id : id}, function(result) {
                $scope.reqCategory = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:reqCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.reqCategory.id != null) {
                ReqCategory.update($scope.reqCategory, onSaveFinished);
            } else {
                ReqCategory.save($scope.reqCategory, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
