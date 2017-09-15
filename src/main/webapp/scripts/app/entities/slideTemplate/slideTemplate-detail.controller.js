'use strict';

angular.module('sdlctoolApp')
    .controller('SlideTemplateDetailController', function ($scope, $stateParams, $state, $timeout, entity, SlideTemplate,
        marked) {

        $scope.slideTemplate = angular.isDefined(entity) ? entity : {};
        $scope.load = function (id) {
            SlideTemplate.get({
                id: id
            }, function (result) {
                $scope.slideTemplate = result;
            });
        };

        var onSaveFinished = function (result) {
            $state.params.isDirty = false;
            $scope.$emit('sdlctoolApp:slideTemplateUpdate', result);
            $state.go('slideTemplate', null, {
                reload: true
            });
        };

        $scope.save = function () {
            $scope.updateSlidePreview(false, "");
            if ($scope.slideTemplate.id != null) {
                SlideTemplate.update($scope.slideTemplate, onSaveFinished);
            } else {
                SlideTemplate.save($scope.slideTemplate, onSaveFinished);
            }

        };

        $scope.cancel = function () {
            $state.params.isDirty = false;
            $state.go('slideTemplate', {});
        };

        $scope.setDirty = function(value) {
            $stateParams.isDirty = value;
        };
        
        $scope.updateSlidePreview = function () {
            if (angular.isDefined($scope.slideTemplate.content)) {
                $stateParams.isDirty = true;
                var content = $scope.slideTemplate.content;
                content = content
                    .replace(/({{ *training.name *}})/g, "TrainingName")
                    .replace(/({{ *parent.name *}})/g, "ParentName");
                document.getElementById('previewFrameId').contentWindow.postMessage(
                    JSON.stringify({
                        method: 'updateSlide',
                        args: [marked(content)]
                    }), '*');
                // console.log("preview updated!");
            }
        };

        $timeout(function () {
            // this must be done _after_ the iframe content loaded or has no effect
            $scope.updateSlidePreview();
            // slideTemplate object is still clean at this stage;
            $stateParams.isDirty = false;
        }, 500);
    });
