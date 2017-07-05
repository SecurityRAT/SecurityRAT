'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingContentController', function ($scope, $rootScope, $stateParams, $q, entity, Training, OptColumn) {
        $scope.training = entity;
        console.log("entity: ", entity);
        $scope.optcolumns = OptColumn.query();
        $rootScope.selected = {};
        $rootScope.optColumnDict = {};



        // load selections from entity
        $q.all([$scope.training.$promise, $scope.optcolumns.$promise]).then(function() {


        // $scope.training.$promise.then(function(trainingResult) {
            console.log("result: ", $scope.training);
            angular.forEach($scope.training.optColumns, function(oc) {
                $rootScope.selected[oc.id] = true;
            });

            console.log($scope.training.optColumns.length);
            console.log($scope.optcolumns.length);
            $scope.selectAll = ($scope.training.optColumns.length == $scope.optcolumns.length);

            console.log("selection restored from: ", $scope.Training.optColumns);
        });


        // fill optColumnDict
        $scope.optcolumns.$promise.then(function(optionColumns) {
           angular.forEach(optionColumns, function(oc) {
               $rootScope.optColumnDict[oc.id] = oc;
           });
        });

        $scope.toggleAll = function() {
            angular.forEach($rootScope.selected, function(element, id){
                if(element != null) {
                    $rootScope.selected[id] = $scope.selectAll;
                    $scope.updateSelection(id);
                }
            });
        };

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

        $scope.updateSelection = function(id) {
            console.log("updateSelection ", id, " ", $rootScope.selected[id]);
            updateSelectAll($rootScope.selected[id]);

            $q.all([$scope.training.$promise, $rootScope.optColumnDict.$promise]).then(function() {
                console.log("ALL INITIAL PROMISES RESOLVED");

                if($rootScope.selected[id]) {
                    $scope.training.optColumns.push($rootScope.optColumnDict[id].toJSON());
                } else {
                    console.log($scope.training.optColumns.constructor.name);
                    // $scope.training.optColumns = $scope.training.optColumns.filter(obj => obj.id != id);
                    for(var i = 0; i < $scope.training.optColumns.length; i++) {
                        if($scope.training.optColumns[i].id == id) {
                            console.log("before splice ", $scope.training.optColumns);
                            console.log("... SPLICE ", i);
                            $scope.training.optColumns.splice(i, 1);
                            console.log("after splice ", $scope.training.optColumns);
                        }
                    }
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
