'use strict';

angular.module('sdlctoolApp').controller('TagInstanceDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'TagInstance', 'TagCategory', 'RequirementSkeleton',
        function($scope, $stateParams, $uibModalInstance, entity, TagInstance, TagCategory, RequirementSkeleton) {

        $scope.tagInstance = entity;
        $scope.tagcategorys = TagCategory.query();
        $scope.requirementskeletons = RequirementSkeleton.query();
        $scope.load = function(id) {
            TagInstance.get({id : id}, function(result) {
                $scope.tagInstance = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:tagInstanceUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.tagInstance.id != null) {
                TagInstance.update($scope.tagInstance, onSaveFinished);
            } else {
                TagInstance.save($scope.tagInstance, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
