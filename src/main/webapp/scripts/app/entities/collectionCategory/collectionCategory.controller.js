'use strict';

angular.module('sdlctoolApp')
    .controller('CollectionCategoryController', function ($scope, CollectionCategory, CollectionCategorySearch, sharedProperties, $filter) {
        $scope.collectionCategorys = [];
        $scope.nonDeletedCat = [];
	$scope.searchString = '';
        $scope.loadAll = function() {
            CollectionCategory.query(function(result) {
               $scope.collectionCategorys = result;
               angular.forEach($scope.collectionCategorys, function(category) {
            	   angular.extend(category, {selected: false});
               });
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            CollectionCategory.get({id: id}, function(result) {
                $scope.collectionCategory = result;
                $('#deleteCollectionCategoryConfirmation').appendTo("body").modal('show');
            }, function(error) {
            	
            });
        };

        $scope.confirmDelete = function (id) {
            CollectionCategory.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteCollectionCategoryConfirmation').modal('hide');
                    $scope.clear();
                });
        };
        
        $scope.selectAllTypes = function() {
        	angular.forEach($filter('filter')($scope.collectionCategorys, $scope.searchString), function(category) {
        		category.selected = true;
        	});
	  	}
        $scope.deselectAllTypes = function() {
            EntityHelper.deselectElements($filter('filter')($scope.collectionCategorys, {selected: true}))
        }
      
        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.collectionCategorys, {selected: true}), ['showOrder']));
        }
      
        $scope.search = function () {
        	CollectionCategorySearch.query({query: $scope.searchQuery}, function(result) {
        		$scope.collectionCategorys = result;
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
        	$scope.collectionCategory = {name: null, description: null, showOrder: null, active: null, id: null};
        };
    });
