'use strict';

angular.module('sdlctoolApp')
    .controller('AlternativeSetController', function ($scope, AlternativeSet, AlternativeSetSearch, OptColumn, sharedProperties, $filter) {
        $scope.alternativeSets = [];
        $scope.optColumns = [];
        $scope.selectedOptColumns = [];
 	$scope.searchString = '';       
        $scope.optColumnLabelText = {buttonDefaultText: 'Option Column'};
        $scope.selectedOptColumnSettings = {
  			  smartButtonMaxItems: 2,
  			  showCheckAll: false, showUncheckAll: false,
  			  displayProp: 'name', idProp: 'id', externalIdProp: ''
  	    };
        
        $scope.loadAll = function() {
            AlternativeSet.query(function(result) {
               $scope.alternativeSets = result;
               angular.forEach($scope.alternativeSets, function(set) {
            	   angular.extend(set, {selected: false});
               });
            });
            OptColumn.query(function(result){
            	$scope.optColumns = result;
            })
        };
        $scope.loadAll();
        
        $scope.delete = function (id) {
            AlternativeSet.get({id: id}, function(result) {
                $scope.alternativeSet = result;
                $('#deleteAlternativeSetConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            AlternativeSet.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteAlternativeSetConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.search = function () {
            AlternativeSetSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.alternativeSets = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };
        $scope.selectAllTypes = function() {
  		  angular.forEach($filter('filterCategoryForEntities')($scope.alternativeSets, $scope.selectedOptColumns, 'optColumn'), function(set) {
  			set.selected = true;
  		  });
	  	}
        $scope.deselectAllTypes = function() {
        	angular.forEach($scope.alternativeSets, function(set) {
        		set.selected = false;
        	});
        }
      
        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.alternativeSets, {selected: true}), ['optColumn.showOrder','showOrder']));
        }

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.alternativeSet = {name: null, description: null, showOrder: null, active: null, id: null};
        };
    });
