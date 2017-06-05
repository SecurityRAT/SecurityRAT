'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingController', function ($scope, Training, TrainingSearch) {
        $scope.trainings = [];
        $scope.loadAll = function() {
            Training.query(function(result) {
               $scope.trainings = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
                $('#deleteTrainingConfirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            Training.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTrainingConfirmation').modal('hide');
                    $scope.clear();
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
            $scope.training = {name: null, description: null, last_modified: null, id: null};
        };
    });
