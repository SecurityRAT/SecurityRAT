'use strict';

angular.module('sdlctoolApp').controller('AlternativeSetDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'AlternativeSet', 'OptColumn', 'AlternativeInstance',
        function($scope, $stateParams, $uibModalInstance, entity, AlternativeSet, OptColumn, AlternativeInstance) {

        $scope.alternativeSet = entity;
        $scope.optcolumns = OptColumn.query();
        $scope.alternativeinstances = AlternativeInstance.query();
        $scope.load = function(id) {
            AlternativeSet.get({id : id}, function(result) {
                $scope.alternativeSet = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:alternativeSetUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.alternativeSet.id !== null) {
                AlternativeSet.update($scope.alternativeSet, onSaveFinished);
            } else {
                AlternativeSet.save($scope.alternativeSet, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
