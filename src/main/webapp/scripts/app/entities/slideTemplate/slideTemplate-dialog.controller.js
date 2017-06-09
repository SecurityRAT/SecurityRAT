'use strict';

angular.module('sdlctoolApp').controller('SlideTemplateDialogController',
    ['$scope', '$stateParams', '$state', 'entity', 'SlideTemplate', 'User',
        function($scope, $stateParams, $state, entity, SlideTemplate, User) {

        $scope.slideTemplate = entity;
        $scope.users = User.query();
        $scope.load = function(id) {
            SlideTemplate.get({id : id}, function(result) {
                $scope.slideTemplate = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:slideTemplateUpdate', result);
        };

        $scope.save = function () {
            if ($scope.slideTemplate.id != null) {
                SlideTemplate.update($scope.slideTemplate, onSaveFinished);
            } else {
                SlideTemplate.save($scope.slideTemplate, onSaveFinished);
            }
            $state.go('^', null, { reload: true });
        };

        $scope.cancel = function() {
            $state.go('slideTemplate', {});
        };
}]);
