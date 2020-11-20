'use strict';

angular.module('sdlctoolApp')
    .controller('TagInstanceController', function ($scope, TagInstance, TagInstanceSearch, TagCategory, 
        sharedProperties, $filter, EntityHelper) {
        $scope.tagInstances = [];
        $scope.tagCategories = [];
        $scope.selectedCategory = [];
        $scope.searchString = '';
        
        $scope.loadAll = function() {
        	TagInstance.query(function(result) {
               $scope.tagInstances = result;
               angular.forEach($scope.tagInstances, function(instance) {
            	   angular.extend(instance, {selected: false});
               });
            });
        	TagCategory.query(function(result) {
            	$scope.tagCategories = result;
            })
        };
        $scope.loadAll();
        $scope.categoryLabelText = {buttonDefaultText: 'Tag Category'};
        $scope.selectedCategorySettings = {
  			  smartButtonMaxItems: 2,
  			  showCheckAll: false, showUncheckAll: false,
  			  displayProp: 'name', idProp: 'id', externalIdProp: ''
  	    };
        
        $scope.delete = function (id) {
            TagInstance.get({id: id}, function(result) {
                $scope.tagInstance = result;
                $('#deleteTagInstanceConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            TagInstance.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteTagInstanceConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.filterEntity = function() {
            var filterByCategories = $filter('filterCategoryForEntities')($scope.tagInstances, $scope.selectedCategory, 'tagCategory');
            return $filter('filter')(filterByCategories, $scope.searchString);
        }

        function selectAllTypes () {
            angular.forEach($scope.filterEntity(), function(instance) {
                instance.selected = true;
            });
  	  	}
        function deselectAllTypes () {
            EntityHelper.deselectElements($filter('filter')($scope.filterEntity(), {selected: true}))
        }

        $scope.performSelection = function(selectionValue) {
            EntityHelper.performSelection(selectionValue, selectAllTypes, deselectAllTypes);
        }
        
        $scope.bulkChange = function() {
          	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.tagInstances, {selected: true}), ['tagCategory.showOrder','showOrder']));
        }
        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.tagInstance = {name: null, description: null, showOrder: null, active: null, id: null};
        };
    });
