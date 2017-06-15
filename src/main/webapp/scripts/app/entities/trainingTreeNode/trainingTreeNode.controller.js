'use strict';

angular.module('securityratApp')
    .controller('TrainingTreeNodeController', function ($scope, TrainingTreeNode, TrainingTreeNodeSearch) {
        $scope.trainingTreeNodes = [];
        $scope.loadAll = function() {
            TrainingTreeNode.query(function(result) {
               $scope.trainingTreeNodes = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            TrainingTreeNode.get({id: id}, function(result) {
                $scope.trainingTreeNode = result;
                $('#deleteTrainingTreeNodeConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            TrainingTreeNode.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTrainingTreeNodeConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.search = function () {
            TrainingTreeNodeSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.trainingTreeNodes = result;
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
            $scope.trainingTreeNode = {node_type: null, sort_order: null, id: null};
        };
    });
