'use strict';

angular.module('sdlctoolApp')
    .controller('StatusColumnValueController', function ($scope, StatusColumn, StatusColumnValue, 
        StatusColumnValueSearch, sharedProperties, $filter, EntityHelper) {
        $scope.statusColumnValues = [];
        $scope.statusColumns = [];
        $scope.selectedColumns = [];
        $scope.searchString = '';
        $scope.statusColumnLabelText = {buttonDefaultText: 'Status Column'};
        $scope.selectedColumnSettings = {
  			  smartButtonMaxItems: 2,
  			  showCheckAll: false, showUncheckAll: false,
  			  displayProp: 'name', idProp: 'id', externalIdProp: ''
  	    };

        $scope.loadAll = function() {
            StatusColumnValue.query(function(result) {
               $scope.statusColumnValues = result;
               angular.forEach($scope.statusColumnValues, function(value) {
            	   angular.extend(value, {selected: false});
               });
            });
            StatusColumn.query(function(result) {
            	$scope.statusColumns = result;
            })
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            StatusColumnValue.get({id: id}, function(result) {
                $scope.statusColumnValue = result;
                $('#deleteStatusColumnValueConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            StatusColumnValue.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteStatusColumnValueConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.filterEntity = function() {
            var filterByStatColumns = $filter('filterCategoryForEntities')($scope.statusColumnValues, $scope.selectedColumns, 'statusColumn');
            return $filter('filter')(filterByStatColumns, $scope.searchString);
        }

        function selectAllValues () {
            
            angular.forEach($scope.filterEntity(), function(value) {
              value.selected = true;
            });
  	  	}
        function deselectAllValues () {
            EntityHelper.deselectElements($filter('filter')($scope.filterEntity(), {selected: true}))
        }
        
        $scope.performSelection = function(selectionValue) {
            EntityHelper.performSelection(selectionValue, selectAllValues, deselectAllValues);
        }

        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.statusColumnValues, {selected: true}), ['statusColumn.showOrder','showOrder']));
        }
        $scope.search = function () {
            StatusColumnValueSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.statusColumnValues = result;
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
            $scope.statusColumnValue = {name: null, description: null, showOrder: null, active: null, id: null};
        };
    });
