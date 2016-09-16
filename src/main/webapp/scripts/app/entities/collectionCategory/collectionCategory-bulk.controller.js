'use strict';

angular.module('sdlctoolApp')
    .controller('CollectionCategoryBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, CollectionCategory, sharedProperties) {
    	$scope.collectionCategorys = [];
    	$scope.active = true;
    	$scope.state = {
    			active: true
    	};
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.collectionCategorys[0].active;
        	angular.forEach($scope.collectionCategorys, function(instance) {
    			if(instance.active === $scope.state.active) {
    				count++
    			}
        	});
        	
        	if(count !== $scope.collectionCategorys.length) {
        		delete $scope.state.active;
        	}
        }
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected collection categories';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
        	$scope.collectionCategorys = sharedProperties.getProperty();
        	$scope.getIndeterminateForActiveButton();
        };
        $scope.loadAll();
      	  		  
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:collectionCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
        	var count = 0;
    		angular.forEach($scope.collectionCategorys, function(category) {
    			count++;
        		category.active = $scope.state.active;
        		CollectionCategory.update(category);
        	});
    		if(count === $scope.collectionCategorys.length)
    			onSaveFinished('done');
        };
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected collection categories';
        		$scope.glyphicon = "glyphicon glyphicon-plus";
        	} else {
        		$scope.showTypes = 'Hide selected collection categories';
        		$scope.glyphicon = "glyphicon glyphicon-minus";
        	}
        }
        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });