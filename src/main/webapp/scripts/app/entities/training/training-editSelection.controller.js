angular.module('sdlctoolApp')
    .controller('TrainingEditSelectionController', function ($scope, $rootScope, $stateParams, $state, $timeout, $interval,
                                                             $uibModal, entity, Training, TrainingTreeUtil) {
        $scope.training = entity;
        $scope.modalProgressbar = { barValue: 0, intervalPromise: undefined };

        $scope.openSaveProgressModal = function() {
            $scope.modalProgressbar.intervalPromise = $interval(function() { $scope.modalProgressbar.barValue += 1; }, 100, 99);
            $scope.progressModalTitle = "Regenerating";
            $scope.saveProgressModalInstance = $uibModal.open({
                size: 'md',
                backdrop: 'static',
                templateUrl: 'scripts/app/entities/training/training-progressModal.html',
                scope: $scope
            });
        };
        $scope.closeSaveProgressModal = function() {
            $state.params.isDirty = false;
            if (angular.isDefined($scope.modalProgressbar.intervalPromise)) {
                $interval.cancel($scope.modalProgressbar.intervalPromise);
            }
            $scope.modalProgressbar.barValue = 100;
            $timeout(function() {
                // actions when finished
                $scope.saveProgressModalInstance.close();
            }, 2500);
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.save = function() {
            if ($scope.training.id != null) {
                $scope.openSaveProgressModal();
                Training.update($scope.training, onSaveFinished).$promise.then(function(training) {
                    TrainingTreeUtil.RootNodeOfTraining.query({id: $scope.training.id}).$promise.then(function(rootNode) {
                        TrainingTreeUtil.ExecuteUpdate.save({id: rootNode.id}).$promise.then(function(hasUpdates) {
                            $scope.closeSaveProgressModal();
                            $state.go('training', null, { reload: true });
                        })
                    });
                });
            }
        };

        $scope.cancel = function() {
            $state.params.isDirty = false;
            $state.go('training', {});
        };
    });
