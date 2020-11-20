'use strict';

angular.module('sdlctoolApp').controller('CollectionCategoryDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'CollectionCategory', 'CollectionInstance',
        function($scope, $stateParams, $uibModalInstance, entity, CollectionCategory, CollectionInstance) {

        $scope.collectionCategory = entity;
        $scope.collectioninstances = CollectionInstance.query();
        $scope.load = function(id) {
            CollectionCategory.get({id : id}, function(result) {
                $scope.collectionCategory = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:collectionCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.collectionCategory.id !== null) {
                CollectionCategory.update($scope.collectionCategory, onSaveFinished);
            } else {
                CollectionCategory.save($scope.collectionCategory, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
