'use strict';

angular.module('sdlctoolApp')
    .controller('OptColumnController', function ($scope, OptColumn, OptColumnSearch, sharedProperties, $filter, EntityHelper) {
        $scope.optColumns = [];
	$scope.searchString = '';
        $scope.loadAll = function() {
            OptColumn.query(function(result) {
               $scope.optColumns = result;
               angular.forEach($scope.optColumns, function(opt) {
            	   angular.extend(opt, {selected: false});
               });
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            OptColumn.get({id: id}, function(result) {
                $scope.optColumn = result;
                $('#deleteOptColumnConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            OptColumn.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteOptColumnConfirmation').modal('hide');
                    $scope.clear();
                });
        };
        $scope.selectAllTypes = function() {
    		  angular.forEach($filter('filter')($scope.optColumns, $scope.searchString), function(opt) {
    			  opt.selected = true;
    		  });
  	  	}
        $scope.deselectAllTypes = function() {
        	EntityHelper.deselectElements($filter('filter')($scope.optColumns, {selected: true}));
        }
        
        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.optColumns, {selected: true}), ['showOrder']));
        }
          
        $scope.search = function () {
            OptColumnSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.optColumns = result;
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
            $scope.optColumn = {name: null, description: null, showOrder: null, active: null, id: null};
        };
    });
