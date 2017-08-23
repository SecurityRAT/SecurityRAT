angular.module('sdlctoolApp')
    .controller('TrainingEditTreeController', function ($scope, $rootScope, $stateParams, $state, $timeout, $interval,
                                                    $uibModal, entity, Training, TrainingTreeNode, TrainingTreeUtil) {
        $scope.training = entity;
        $rootScope.trainingTreeData = [];
        $scope.modalProgressbar = { barValue: 0, intervalPromise: undefined };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.openSaveProgressModal = function() {
            $scope.modalProgressbar.intervalPromise = $interval(function() { $scope.modalProgressbar.barValue += 1; }, 100, 99);

            $scope.saveProgressModalInstance = $uibModal.open({
                size: 'md',
                backdrop: 'static',
                templateUrl: 'scripts/app/entities/training/training-progressModal.html',
                scope: $scope
            });
        };
        $scope.closeSaveProgressModal = function() {
            if (angular.isDefined($scope.modalProgressbar.intervalPromise)) {
                $interval.cancel($scope.modalProgressbar.intervalPromise);
                $scope.modalProgressbar.intervalPromise = undefined;
            }
            $scope.modalProgressbar.barValue = 100;
            $timeout(function() {
                // actions when finished
                $scope.saveProgressModalInstance.close();
                $state.go('training', null, { reload: true });
            }, 2500);
        };
        $scope.openFeedbackModal = function(title, message) {
            $scope.feedback = { title: title, message: message };
            $scope.feedbackModalInstance = $uibModal.open({
                size: 'md',
                backdrop: 'static',
                templateUrl: 'scripts/app/entities/training/training-feedbackModal.html',
                scope: $scope
            });
        };
        $scope.closeFeedbackModal = function() {
            $scope.feedbackModalInstance.close();
        };

        $scope.init = function() {
            TrainingTreeUtil.RootNodeOfTraining.query({id: $scope.training.id}).$promise.then(function(foundRootNode) {
                console.log("The foundRootNode", foundRootNode);
                TrainingTreeUtil.CheckUpdate.query({id: foundRootNode.id}).$promise.then(function(treeStatus) {
                    console.log("treeStatus", treeStatus);
                    if(treeStatus.hasUpdates) {
                        $scope.openFeedbackModal("Structural Updates found", "This training has been updated due to changes to the database. Please check your structure and modify it accordingly.");
                    }
                    TrainingTreeNode.get({id: foundRootNode.id}).$promise.then(function (realRootNode) {

                        $scope.trainingRoot = realRootNode;
                        $scope.trainingRoot.name = $scope.training.name;
                        $scope.trainingRoot.opened = true;

                        console.log("TREE LOADING FINISHED", $scope.trainingRoot);
                        $rootScope.trainingTreeData[0] = TrainingTreeNode.JSON_to_JSTree($scope.trainingRoot);
                        console.log("the real json", $rootScope.trainingTreeData[0]);
                        $rootScope.displayTree();
                    });
                });
            });
        };

        $scope.training.$promise.then(function() {
            $scope.init();
        });

        $scope.save = function() {
            if ($scope.training.id != null) {
                // Training.update($scope.training, onSaveFinished);
                $scope.openSaveProgressModal();

                $scope.trainingRoot.fromJSON($rootScope.getTreeJSON());
                $scope.trainingRoot.json_training_id = $scope.training.id;
                TrainingTreeNode.update($scope.trainingRoot).$promise.then(function() {

                    $scope.closeSaveProgressModal();


                }, function(reject) {
                    $scope.closeSaveProgressModal();
                    console.error("saving failed: "+ reject);
                });
            }
        };

        $scope.cancel = function() {
            $state.go('training', null, { reload: true });
        };
    });
