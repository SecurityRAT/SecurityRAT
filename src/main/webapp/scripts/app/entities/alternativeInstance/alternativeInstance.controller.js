'use strict';

angular.module('sdlctoolApp')
    .controller('AlternativeInstanceController', function ($scope, AlternativeInstance, AlternativeInstanceSearch, AlternativeSet, sharedProperties, $filter, marked) {
        $scope.alternativeInstances = [];
        $scope.alternativeSets = [];
        $scope.selectedAlternativeSets = [];
        
        $scope.setLabelText = {buttonDefaultText: 'Alternative Set'};
        $scope.selectedSetSettings = {
  			  smartButtonMaxItems: 2,
  			  showCheckAll: false, showUncheckAll: false,
  			  displayProp: 'name', idProp: 'id', externalIdProp: ''
  	    };
        $scope.loadAll = function() {
            AlternativeInstance.query(function(result) {
               $scope.alternativeInstances = result;
               angular.forEach($scope.alternativeInstances, function(instance) {
//            	   instance.content = marked(instance.content);
            	   angular.extend(instance, {selected: false});
               });
            });
            AlternativeSet.query(function(result) {
            	$scope.alternativeSets = result;
            })
            
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            AlternativeInstance.get({id: id}, function(result) {
                $scope.alternativeInstance = result;
                $('#deleteAlternativeInstanceConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            AlternativeInstance.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteAlternativeInstanceConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.search = function () {
            AlternativeInstanceSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.alternativeInstances = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };
        $scope.selectAllTypes = function() {
        	var instances = $filter('filterCategoryForEntities')($scope.alternativeInstances, $scope.selectedAlternativeSets, 'alternativeSet');
//        	instances = $filter('filterCategoryForEntities')(instances, $scope.selectedAlternativeSets, 'alternativeSet')
    		  angular.forEach(instances, function(instance) {
    			  instance.selected = true;
    		  });
  	  	}
        $scope.deselectAllTypes = function() {
        	angular.forEach($scope.alternativeInstances, function(instance) {
          		instance.selected = false;
          	});
        }
        
        $scope.bulkChange = function() {
          	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.alternativeInstances, {selected: true}), ['alternativeSet.showOrder','requirementSkeleton.reqCategory.showOrder', 'requirementSkeleton.showOrder']));
        }

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.alternativeInstance = {content: null, id: null};
        };
    });
