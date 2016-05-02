'use strict';

angular.module('sdlctoolApp')
    .controller('StatusColumnController', function ($scope, StatusColumn, StatusColumnSearch, sharedProperties, $filter) {
        $scope.statusColumns = [];
        $scope.loadAll = function() {
            StatusColumn.query(function(result) {
               $scope.statusColumns = result;
               angular.forEach($scope.statusColumns, function(stat) {
            	   angular.extend(stat, {selected: false});
               });
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            StatusColumn.get({id: id}, function(result) {
                $scope.statusColumn = result;
                $('#deleteStatusColumnConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            StatusColumn.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteStatusColumnConfirmation').modal('hide');
                    $scope.clear();
                });
        };
        
        $scope.selectAllTypes = function() {
        	angular.forEach($scope.statusColumns, function(stat) {
        		stat.selected = true;
        	});
        }
        $scope.deselectAllTypes = function() {
        	angular.forEach($scope.statusColumns, function(stat) {
        		stat.selected = false;
        	});
        }
        
        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.statusColumns, {selected: true}), ['showOrder']));
        }
      
        $scope.search = function () {
            StatusColumnSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.statusColumns = result;
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
            $scope.statusColumn = {name: null, description: null, isEnum: null, showOrder: null, active: null, id: null};
        };
    });
