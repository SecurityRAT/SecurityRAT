'use strict';

angular.module('sdlctoolApp').controller('AlternativeInstanceDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'AlternativeInstance', 'AlternativeSet', 'RequirementSkeleton',
        function($scope, $stateParams, $uibModalInstance, entity, AlternativeInstance, AlternativeSet, RequirementSkeleton) {

        $scope.alternativeInstance = entity;
        $scope.alternativesets = AlternativeSet.query();
        $scope.requirementskeletons = RequirementSkeleton.query();
        $scope.load = function(id) {
            AlternativeInstance.get({id : id}, function(result) {
                $scope.alternativeInstance = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:alternativeInstanceUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
//        	if($scope.alternativeInstance.content.indexOf('>') !== -1 || $scope.alternativeInstance.content.indexOf('<') !== -1)
//        		$scope.alternativeInstance.content = _.escape($scope.alternativeInstance.content);
            if ($scope.alternativeInstance.id !== null) {
                AlternativeInstance.update($scope.alternativeInstance, onSaveFinished);
            } else {
                AlternativeInstance.save($scope.alternativeInstance, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
