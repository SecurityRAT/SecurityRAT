'use strict';

angular.module('sdlctoolApp')
    .controller('CollectionInstanceController', function ($scope, CollectionInstance, CollectionInstanceSearch, sharedProperties, $filter, CollectionCategory) {
        $scope.collectionInstances = [];
        $scope.collectionCategories = [];
        $scope.selectedCategory = [];
        $scope.loadAll = function() {
            CollectionInstance.query(function(result) {
               $scope.collectionInstances = result;
               angular.forEach($scope.collectionInstances, function(instance) {
            	   angular.extend(instance, {selected: false});
               });
            });
            CollectionCategory.query(function(result) {
            	$scope.collectionCategories = result;
            })
        };
        $scope.loadAll();
        $scope.categoryLabelText = {buttonDefaultText: 'Collection Category'};
        $scope.selectedCategorySettings = {
  			  smartButtonMaxItems: 2,
  			  showCheckAll: false, showUncheckAll: false,
  			  displayProp: 'name', idProp: 'id', externalIdProp: ''
  	    };
        
        $scope.delete = function (id) {
            CollectionInstance.get({id: id}, function(result) {
                $scope.collectionInstance = result;
                $('#deleteCollectionInstanceConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            CollectionInstance.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteCollectionInstanceConfirmation').modal('hide');
                    $scope.clear();
                });
        };
        $scope.selectAllTypes = function() {
  		  angular.forEach($filter('filterCategoryForEntities')($scope.collectionInstances, $scope.selectedCategory, 'collectionCategory'), function(instance) {
  			instance.selected = true;
  		  });
	  	}
        $scope.deselectAllTypes = function() {
        	angular.forEach($scope.collectionInstances, function(instance) {
        		instance.selected = false;
        	});
        }
      
        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.collectionInstances, {selected: true}), ['collectionCategory.showOrder','showOrder']));
        }
        $scope.search = function () {
            CollectionInstanceSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.collectionInstances = result;
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
            $scope.collectionInstance = {name: null, description: null, showOrder: null, active: null, id: null};
        };
    });
