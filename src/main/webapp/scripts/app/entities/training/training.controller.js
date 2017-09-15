'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingController', function ($scope, $filter, $state,  Training, TrainingSearch, TrainingTreeUtil,
                                                TrainingTreeNode, $uibModal) {
        $scope.trainings = [];

        $scope.today = $filter('date')(new Date(), 'mediumDate');
        $scope.loadAll = function() {
            Training.query(function(result) {
               $scope.trainings = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
                $('#deleteTrainingConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            TrainingTreeUtil.RootNodeOfTraining.query({id: id}).$promise.then(function(rootNode) {

                TrainingTreeNode.delete(rootNode).$promise.then(function() {
                    Training.delete({id: id},
                        function () {
                            $scope.loadAll();
                            $('#deleteTrainingConfirmation').modal('hide');
                            $scope.clear();
                        });
                });
            });
        };

        $scope.search = function () {
            TrainingSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.trainings = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.training = {name: null, description: null, allRequirementsSelected: null, id: null};
        };

        $scope.startPresentation = function(id) {
            window.open($state.href('viewTraining', {id: id}, '_blank'));
        };

        $scope.checkUpdate = function(training_id) {
            TrainingTreeUtil.RootNodeOfTraining.query({id: training_id}).$promise.then(function(foundRootNode) {
                $scope.rootNode = foundRootNode;

                TrainingTreeUtil.CheckUpdate.query({id: foundRootNode.id}).$promise.then(function(treeStatus) {
                    if(treeStatus.hasUpdates) {
                        $scope.openFeedbackModal("Structural updates found",
                            "The structure of this training is not longer up to date. " +
                            "Do you want to apply the changes?",
                            true
                        );
                    } else {
                        $scope.openFeedbackModal("No structural updates found",
                            "The structure of this training is up to date. ",
                            false
                        );
                    }
                });
            });
        };

        $scope.openFeedbackModal = function(title, message, showUpdateButton) {
            $scope.feedback = {
                title: title,
                message: message,
                showUpdateButton: showUpdateButton,
                showProgressIndicator: false
            };
            $scope.feedbackModalInstance = $uibModal.open({
                size: 'md',
                backdrop: 'static',
                templateUrl: 'scripts/app/entities/training/training-feedbackModal.html',
                scope: $scope
            });
        };
        $scope.closeFeedbackModal = function(executeUpdates) {
            if(executeUpdates) {
                $scope.feedback.showProgressIndicator = true;
                TrainingTreeUtil.ExecuteUpdate.save({id: $scope.rootNode.id}).$promise.then(function(treeStatus) {
                    $scope.feedback.title = "Update finished";
                    $scope.feedback.message = "The structure of this training has been updated successfully";
                    $scope.feedback.showUpdateButton = false;
                    $scope.feedback.showProgressIndicator = false;
                });
            } else {
                $scope.feedbackModalInstance.close();
            }
        };
    });
