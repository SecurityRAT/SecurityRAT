'use strict';

/* jshint undef: true */
/* globals $ */
angular.module('sdlctoolApp')
    .controller('CollectionInstanceBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, CollectionInstance, CollectionCategory, sharedProperties) {
    	$scope.collectionInstance = [];
    	$scope.collectionCategories = [];
    	$scope.state = {
    			active: true
    	};
    	$scope.selectedCat = {
    			value: null
    	};
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.collectionInstance[0].active;
        	angular.forEach($scope.collectionInstance, function(instance) {
    			if(instance.active === $scope.state.active) {
    				count++;
    			}
        	});
        	
        	if(count !== $scope.collectionInstance.length) {
        		delete $scope.state.active;
        	}
        };
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected collection instances';
    		$scope.glyphicon = 'glyphicon glyphicon-plus';
    		$scope.show = true;
        	$scope.collectionInstance = sharedProperties.getProperty();
        	$scope.getIndeterminateForActiveButton();
        	CollectionCategory.query(function(result) {
        	   $scope.collectionCategories = result;
            });
        };
        $scope.loadAll();
      	  	
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:collectionInstanceUpdate', result);
            $uibModalInstance.close(result);
        };
        
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected collection instances';
        		$scope.glyphicon = 'glyphicon glyphicon-plus';
        	} else {
        		$scope.showTypes = 'Hide selected collection instances';
        		$scope.glyphicon = 'glyphicon glyphicon-minus';
        	}
        };
        
        $scope.save = function () {
                var count = 1;
    		angular.forEach($scope.collectionInstance, function(instance) {
    			if(angular.isDefined($scope.state.active)){ instance.active = $scope.state.active; }
    			if($scope.selectedCat.value !== null) {
    				angular.forEach($scope.collectionCategories, function(cat) {
    	        		if($scope.selectedCat.value === cat.id) {
    	        			instance.collectionCategory = cat;
    	        		}
    	        	});
    			}
                        if (count === $scope.collectionInstance.length) {
    			       CollectionInstance.update(instance, onSaveFinished);
                        } else {
                               CollectionInstance.update(instance);
                        }
                        count++;
    		});
        };

        $scope.delete = function () {
          $('#deleteCollectionInstancesConfirmation').appendTo('body').modal('show');
        };

        $scope.confirmDeleteAll = function (collInstances) {
            var count = 1;
            angular.forEach(collInstances, function(instance) {
                if (count === collInstances.length) {
                  CollectionInstance.delete({id: instance.id}, function(result) {
                       $('#deleteCollectionInstancesConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  CollectionInstance.delete({id: instance.id}, function() {});
                }
                count++;
            });
        };
        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
