'use strict';

angular.module('sdlctoolApp').controller('CollectionInstanceDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'CollectionInstance', 'CollectionCategory', 'RequirementSkeleton',
        function($scope, $stateParams, $uibModalInstance, entity, CollectionInstance, CollectionCategory, RequirementSkeleton) {

        $scope.collectionInstance = entity;
        $scope.collectioncategorys = CollectionCategory.query();
        $scope.requirementskeletons = RequirementSkeleton.query();
        $scope.load = function(id) {
            CollectionInstance.get({id : id}, function(result) {
                $scope.collectionInstance = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:collectionInstanceUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.collectionInstance.id !== null) {
                CollectionInstance.update($scope.collectionInstance, onSaveFinished);
            } else {
                CollectionInstance.save($scope.collectionInstance, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
