angular.module('sdlctoolApp')
    .controller('TrainingEditTreeController', function ($scope, $rootScope, $stateParams, $state, $timeout, $interval,
        $uibModal, entity, Training, TrainingTreeNode, TrainingTreeUtil) {
        $scope.training = entity;
        $rootScope.trainingTreeData = [];
        $scope.loadingProgressbar = {
            hide: false,
            barValue: 0,
            intervalPromise: undefined
        };
        $scope.modalProgressbar = {
            barValue: 0,
            intervalPromise: undefined
        };
        $scope.treeReady = false;

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.startLoadingProgressBar = function () {
            $scope.loadingProgressbar.intervalPromise = $interval(function () {
                $scope.loadingProgressbar.barValue += 1;
            }, 100, 99);
        };
        $scope.pauseLoadingProgressBar = function (value) {
            if (angular.isDefined($scope.loadingProgressbar.intervalPromise)) {
                $interval.cancel($scope.loadingProgressbar.intervalPromise);
            }
            $scope.loadingProgressbar.barValue = value;
        };
        $scope.stopLoadingProgresBar = function () {
            if (angular.isDefined($scope.loadingProgressbar.intervalPromise)) {
                $interval.cancel($scope.loadingProgressbar.intervalPromise);
            }
            $scope.loadingProgressbar.barValue = 100;
            $scope.loadingProgressbar.hide = true;
        };
        $scope.openSaveProgressModal = function () {
            $scope.modalProgressbar.intervalPromise = $interval(function () {
                $scope.modalProgressbar.barValue += 1;
            }, 100, 99);
            $scope.progressModalTitle = "Saving to database";
            $scope.saveProgressModalInstance = $uibModal.open({
                size: 'md',
                backdrop: 'static',
                templateUrl: 'scripts/app/entities/training/training-progressModal.html',
                scope: $scope
            });
        };
        $scope.closeSaveProgressModal = function () {
            if (angular.isDefined($scope.modalProgressbar.intervalPromise)) {
                $interval.cancel($scope.modalProgressbar.intervalPromise);
            }
            $scope.modalProgressbar.barValue = 100;
            $timeout(function () {

                $state.params.isDirty = false;
                // actions when finished
                $scope.saveProgressModalInstance.close();
                $state.go('training', null, {
                    reload: true
                });
            }, 2500);
        };
        $scope.openFeedbackModal = function (title, message) {
            $scope.feedback = {
                title: title,
                message: message,
                showUpdateButton: true,
                showProgressIndicator: false
            };
            $scope.feedbackModalInstance = $uibModal.open({
                size: 'md',
                backdrop: 'static',
                templateUrl: 'scripts/app/entities/training/training-feedbackModal.html',
                scope: $scope
            });
        };
        $scope.closeFeedbackModal = function (executeUpdates) {
            $scope.feedbackModalInstance.close();
            $scope.startLoadingProgressBar();

            if (executeUpdates) {
                TrainingTreeUtil.ExecuteUpdate.save({
                    id: $scope.rootNode.id
                }).$promise.then(function (treeStatus) {
                    $scope.getAndDisplayTree();
                });
            } else
                $scope.getAndDisplayTree();
        };

        $scope.getAndDisplayTree = function () {
            TrainingTreeNode.get({
                id: $scope.rootNode.id
            }).$promise.then(function (realRootNode) {

                $scope.stopLoadingProgresBar();
                $scope.trainingRoot = realRootNode;
                $scope.trainingRoot.name = $scope.training.name;
                $scope.trainingRoot.opened = true;

                $rootScope.trainingTreeData[0] = TrainingTreeNode.JSON_to_JSTree($scope.trainingRoot);
                $rootScope.displayTree();
                $scope.treeReady = true;
            });
        };

        $scope.init = function () {
            $scope.startLoadingProgressBar();
            TrainingTreeUtil.RootNodeOfTraining.query({
                id: $scope.training.id
            }).$promise.then(function (foundRootNode) {
                $scope.rootNode = foundRootNode;

                TrainingTreeUtil.CheckUpdate.query({
                    id: foundRootNode.id
                }).$promise.then(function (treeStatus) {
                    if (treeStatus.hasUpdates) {
                        $scope.pauseLoadingProgressBar(40);
                        $scope.openFeedbackModal("Structural updates found",
                            "The structure of your training is not longer up to date. " +
                            "Do you want to apply the changes?"
                        );
                    } else {
                        $scope.getAndDisplayTree();
                    }
                });
            });
        };

        $scope.training.$promise.then(function () {
            $scope.init();
        });

        $scope.save = function () {
            if ($scope.training.id != null) {
                // Training.update($scope.training, onSaveFinished);
                $scope.openSaveProgressModal();

                $scope.trainingRoot.fromJSON($rootScope.getTreeJSON());
                $scope.trainingRoot.json_training_id = $scope.training.id;
                TrainingTreeNode.update($scope.trainingRoot).$promise.then(function () {

                    $scope.closeSaveProgressModal();


                }, function (reject) {
                    $scope.closeSaveProgressModal();
                    console.error("saving failed: " + reject);
                });
            }
        };

        $scope.cancel = function () {
            $state.params.isDirty = false;
            $state.go('training', null, {
                reload: true
            });
        };
    });
