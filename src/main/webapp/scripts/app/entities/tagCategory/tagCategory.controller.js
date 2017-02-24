'use strict';

angular.module('sdlctoolApp')
    .controller('TagCategoryController', function ($scope, TagCategory, TagCategorySearch, sharedProperties, 
        $filter, EntityHelper) {
        $scope.tagCategorys = [];
	$scope.searchString = '';
        $scope.loadAll = function() {
            TagCategory.query(function(result) {
               $scope.tagCategorys = result;
               angular.forEach($scope.tagCategorys, function(category) {
            	   angular.extend(category, {selected: false});
               });
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            TagCategory.get({id: id}, function(result) {
                $scope.tagCategory = result;
                $('#deleteTagCategoryConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            TagCategory.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTagCategoryConfirmation').modal('hide');
                    $scope.clear();
                });
        };
        $scope.selectAllTypes = function() {
        	angular.forEach($filter('filter')($scope.tagCategorys, $scope.searchString), function(category) {
        		category.selected = true;
        	});
	  	}
        $scope.deselectAllTypes = function() {
            EntityHelper.deselectElements($filter('filter')($scope.tagCategorys, {selected: true}))
        }
      
        $scope.bulkChange = function() {
        	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.tagCategorys, {selected: true}), ['showOrder']));
        }
        
        $scope.search = function () {
            TagCategorySearch.query({query: $scope.searchQuery}, function(result) {
                $scope.tagCategorys = result;
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
            $scope.tagCategory = {name: null, description: null, showOrder: null, active: null, id: null};
        };
    });
