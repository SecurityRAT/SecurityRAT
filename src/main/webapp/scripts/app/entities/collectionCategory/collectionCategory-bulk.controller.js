'use strict';

angular.module('sdlctoolApp')
    .controller('CollectionCategoryBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, CollectionCategory, sharedProperties) {
    	$scope.collectionCategorys = [];
    	$scope.active = true;
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected collection categories';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
        	$scope.collectionCategorys = sharedProperties.getProperty();
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
        		category.active = $scope.active;
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