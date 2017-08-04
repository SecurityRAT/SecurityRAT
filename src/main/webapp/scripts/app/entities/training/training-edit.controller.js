angular.module('sdlctoolApp')
    .controller('TrainingEditController', function ($scope, $rootScope, $stateParams, $state, entity, Training,
                                                    TrainingTreeNode, TrainingTreeUtil) {
        $scope.training = entity;
        $rootScope.trainingTreeData = [];

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.init = function() {
            TrainingTreeUtil.RootNodeOfTraining.query({id: $scope.training.id}).$promise.then(function(foundRootNode) {
                console.log("The foundRootNode", foundRootNode);
                TrainingTreeNode.get({id: foundRootNode.id}).$promise.then(function (realRootNode) {

                    $scope.trainingRoot = realRootNode;
                    $scope.trainingRoot.name = $scope.training.name;
                    $scope.trainingRoot.opened = true;

                    $scope.trainingRoot.loadSubTree().then(function() {
                        console.log("TREE LOADING FINISHED", $scope.trainingRoot);
                        $rootScope.trainingTreeData[0] = $scope.trainingRoot.getJSON();
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
                Training.update($scope.training, onSaveFinished);
            } else {
                Training.save($scope.training, onSaveFinished);
            }
        };
    });
