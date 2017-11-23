'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingContentController', function ($scope, $rootScope, $stateParams, $q, entity, Training, OptColumn) {
        $scope.training = entity;
        $scope.optcolumns = OptColumn.query();
        $rootScope.selected = {};
        $rootScope.optColumnDict = {};
        var backUpSelection = {};

        // load selections from entity
        $q.all([$scope.training.$promise, $scope.optcolumns.$promise]).then(function() {
            // 1) fill $rootScope.selected with false for each OptColumn id
            angular.forEach($scope.optcolumns, function(oc) {
                $rootScope.selected[oc.id] = false;
            });

            // 2) set saved selections to true
            if($scope.training.optColumns != null) {
                angular.forEach($scope.training.optColumns, function(oc_selected) {
                    $rootScope.selected[oc_selected.id] = true;
                });
                angular.copy($rootScope.selected, backUpSelection);
                $scope.selectAll = ($scope.training.optColumns.length === $scope.optcolumns.length);
            }
        });


        // fill optColumnDict
        $scope.optcolumns.$promise.then(function(optionColumns) {
           angular.forEach(optionColumns, function(oc) {
               $rootScope.optColumnDict[oc.id] = oc;
           });
        });

        // called when user clicks the selectAll-Checkbox
        $scope.toggleAll = function() {
            angular.forEach($rootScope.selected, function(element, id){
                if(element != null) {
                    $rootScope.selected[id] = $scope.selectAll;
                    $scope.updateSelection(id);
                }
            });
        };

        // updates state of the selectAll-Checkbox
        var updateSelectAll = function(value) {
            if(!value)
                $scope.selectAll = false;
            else {
                var all_manually_selected = true;
                angular.forEach($rootScope.selected, function(element){
                    if(element != null && !element)
                        all_manually_selected = false;
                });
                if(all_manually_selected)
                    $scope.selectAll = true;
            }
        };

        // adds or removes a selection to/from the training entity (which will be saved to db in parent controller)
        $scope.updateSelection = function(id) {
            updateSelectAll($rootScope.selected[id]);
            if(angular.equals($rootScope.selected, backUpSelection)) {
                $stateParams.isDirty = false;
            } else {
                $stateParams.isDirty = true;
            }

            $q.all([$scope.training.$promise, $rootScope.optColumnDict.$promise]).then(function() {
                if($rootScope.selected[id]) {
                    if($scope.training.optColumns == null)
                        $scope.training.optColumns = [];
                    $scope.training.optColumns.push($rootScope.optColumnDict[id].toJSON());
                } else {
                    $scope.training.optColumns = $.grep($scope.training.optColumns, function(optColumn) {
                        return optColumn.id != id;
                    });
                }
            });
        };

        $scope.load = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
            });
        };
        $rootScope.$on('sdlctoolApp:trainingUpdate', function(event, result) {
            $scope.training = result;
        });
    });
