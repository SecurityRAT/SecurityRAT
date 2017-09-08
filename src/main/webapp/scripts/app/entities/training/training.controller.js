'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingController', function ($scope, $filter, $state,  Training, TrainingSearch, TrainingTreeUtil,
                                                TrainingTreeNode) {
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
        }
    });
