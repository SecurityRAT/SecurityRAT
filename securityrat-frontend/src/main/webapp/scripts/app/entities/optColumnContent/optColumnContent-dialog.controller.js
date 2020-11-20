'use strict';

angular.module('sdlctoolApp').controller('OptColumnContentDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'OptColumnContent', 'OptColumn', 'RequirementSkeleton',
        function($scope, $stateParams, $uibModalInstance, entity, OptColumnContent, OptColumn, RequirementSkeleton) {
        $scope.optColumnContent = entity;
        $scope.optcolumns = OptColumn.query();
        $scope.requirementskeletons = RequirementSkeleton.query();
        $scope.load = function(id) {
            OptColumnContent.get({id : id}, function(result) {
                $scope.optColumnContent = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:optColumnContentUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
//        	if($scope.optColumnContent.content.indexOf('>') !== -1 || $scope.optColumnContent.content.indexOf('<') !== -1)
//        		$scope.optColumnContent.content = _.escape($scope.optColumnContent.content);
            if ($scope.optColumnContent.id !== null) {
                OptColumnContent.update($scope.optColumnContent, onSaveFinished);
            } else {
                OptColumnContent.save($scope.optColumnContent, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
