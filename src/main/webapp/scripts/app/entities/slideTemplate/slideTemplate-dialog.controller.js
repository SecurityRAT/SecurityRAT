'use strict';

angular.module('securityratApp').controller('SlideTemplateDialogController',
    ['$scope', '$stateParams', '$modalInstance', 'entity', 'SlideTemplate', 'User',
        function($scope, $stateParams, $modalInstance, entity, SlideTemplate, User) {

        $scope.slideTemplate = entity;
        $scope.users = User.query();
        $scope.load = function(id) {
            SlideTemplate.get({id : id}, function(result) {
                $scope.slideTemplate = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('securityratApp:slideTemplateUpdate', result);
            $modalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.slideTemplate.id != null) {
                SlideTemplate.update($scope.slideTemplate, onSaveFinished);
            } else {
                SlideTemplate.save($scope.slideTemplate, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $modalInstance.dismiss('cancel');
        };
}]);
