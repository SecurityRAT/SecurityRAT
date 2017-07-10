'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingContentController', function ($scope, $rootScope, $stateParams, $q, entity, Training, OptColumn) {
        $scope.training = entity;
        $scope.optcolumns = OptColumn.query();
        $rootScope.selected = {};
        $rootScope.optColumnDict = {};

        // load selections from entity
        $q.all([$rootScope.training.$promise, $scope.optcolumns.$promise]).then(function() {
            angular.forEach($rootScope.training.optColumns, function(oc) {
                $rootScope.selected[oc.id] = true;
            });
            $scope.selectAll = ($rootScope.training.optColumns.length == $scope.optcolumns.length);
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
            updateSelectAll($rootScope.selected[id]);

            $q.all([$rootScope.training.$promise, $rootScope.optColumnDict.$promise]).then(function() {
                if($rootScope.selected[id]) {
                    $rootScope.training.optColumns.push($rootScope.optColumnDict[id].toJSON());
                } else {
                    for(var i = 0; i < $rootScope.training.optColumns.length; i++) {
                        if($rootScope.training.optColumns[i].id == id) {
                            $rootScope.training.optColumns.splice(i, 1);
                        }
                    }
                }
            });
        };

        $scope.load = function (id) {
            Training.get({id: id}, function(result) {
                $rootScope.training = result;
            });
        };
        $rootScope.$on('sdlctoolApp:trainingUpdate', function(event, result) {
            $rootScope.training = result;
        });
    });
