'use strict';

angular.module('sdlctoolApp').controller('TagCategoryDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'TagCategory', 'TagInstance',
        function($scope, $stateParams, $uibModalInstance, entity, TagCategory, TagInstance) {

        $scope.tagCategory = entity;
        $scope.taginstances = TagInstance.query();
        $scope.load = function(id) {
            TagCategory.get({id : id}, function(result) {
                $scope.tagCategory = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:tagCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.tagCategory.id != null) {
                TagCategory.update($scope.tagCategory, onSaveFinished);
            } else {
                TagCategory.save($scope.tagCategory, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
