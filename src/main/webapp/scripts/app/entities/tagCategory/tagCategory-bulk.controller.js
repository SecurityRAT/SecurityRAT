'use strict';

angular.module('sdlctoolApp')
    .controller('TagCategoryBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, TagCategory, sharedProperties) {
    	$scope.tagCategories = [];
    	$scope.active = true;
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected tag categories';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
        	$scope.tagCategories = sharedProperties.getProperty();
        };
        $scope.loadAll();
      	  		  
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:tagCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
    		angular.forEach($scope.tagCategories, function(category) {
    			category.active = $scope.active;
    			TagCategory.update(category, onSaveFinished);
    		});
        };
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected tag categories';
        		$scope.glyphicon = "glyphicon glyphicon-plus";
        	} else {
        		$scope.showTypes = 'Hide selected tag categories';
        		$scope.glyphicon = "glyphicon glyphicon-minus";
        	}
        }
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });