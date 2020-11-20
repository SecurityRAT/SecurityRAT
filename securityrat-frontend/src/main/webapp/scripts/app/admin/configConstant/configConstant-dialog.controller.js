'use strict';

angular.module('sdlctoolApp').controller('ConfigConstantDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'ConfigConstant',
        function($scope, $stateParams, $uibModalInstance, entity, ConfigConstant) {

        $scope.constant = entity;
        $scope.load = function(id) {
        	ConfigConstant.get({id : id}, function(result) {
                $scope.constant = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:configConstantUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.constant.id != null) {
            	ConfigConstant.update($scope.constant, onSaveFinished);
            } else {
            	ConfigConstant.save($scope.constant, onSaveFinished);
            }
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
