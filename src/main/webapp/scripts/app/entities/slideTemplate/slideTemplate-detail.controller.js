'use strict';

angular.module('sdlctoolApp')
    .controller('SlideTemplateDetailController', function($scope, $stateParams, $state, $timeout, entity, SlideTemplate) {

        $scope.slideTemplate = entity;
        $scope.load = function(id) {
            SlideTemplate.get({id : id}, function(result) {
                $scope.slideTemplate = result;
            });
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:slideTemplateUpdate', result);
        };

        $scope.save = function () {
            $scope.updateSlidePreview();
            if ($scope.slideTemplate.id != null) {
                SlideTemplate.update($scope.slideTemplate, onSaveFinished);
            } else {
                SlideTemplate.save($scope.slideTemplate, onSaveFinished);
            }
            $state.go('slideTemplate', null, { reload: true });
        };

        $scope.cancel = function() {
            $state.go('slideTemplate', {});
        };

        $scope.updateSlidePreview = function() {
            var content = $scope.slideTemplate.content;
            content = content
                .replace(/({{ *training.name *}})/g, "TrainingName")
                .replace(/({{ *parent.name *}})/g, "ParentName");
            document.getElementById('previewFrameId').contentWindow.postMessage(
                JSON.stringify({
                    method: 'updateSlide',
                    args: [ content ]
                }), '*' );
            console.log("preview updated!");
        };

        $timeout(function() {
            // this must be done _after_ the iframe content loaded or has no effect
            $scope.updateSlidePreview();
        }, 2500);
});
