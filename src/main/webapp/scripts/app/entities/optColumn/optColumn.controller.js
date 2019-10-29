'use strict';

/* jshint undef: true */
/* globals $ */

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
                $('#deleteOptColumnConfirmation').appendTo('body').modal('show');
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

        $scope.filterEntity = function() {
            return $filter('filter')($scope.optColumns, $scope.searchString);
        };

        function selectAllTypes () {
    		  angular.forEach($scope.filterEntity(), function(opt) {
    			  opt.selected = true;
    		  });
  	  	}
        function deselectAllTypes () {
        	EntityHelper.deselectElements($filter('filter')($scope.filterEntity(), {selected: true}));
        }
        
        $scope.performSelection = function(selectionValue) {
            EntityHelper.performSelection(selectionValue, selectAllTypes, deselectAllTypes);
        };

        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.optColumns, {selected: true}), ['showOrder']));
        };
          
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
            $scope.optColumn = {name: null, description: null, showOrder: null, active: null, isVisibleByDefault:null, id: null};
        };
    });
