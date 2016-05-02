'use strict';

angular.module('sdlctoolApp')
    .controller('ReqCategoryBulkController', function($scope, $stateParams, $uibModalInstance, $filter, entity, ReqCategory, sharedProperties) {
    	$scope.requirementCategories = [];
    	$scope.active = true;
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected requirement categories';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
        	$scope.requirementCategories = sharedProperties.getProperty();
        };
        $scope.loadAll();
      	  		  
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:requirementCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
    		angular.forEach($scope.requirementCategories, function(category) {
    			category.active = $scope.active;
    			ReqCategory.update(category, onSaveFinished);
    		});
        }
        
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected requirement categories';
        		$scope.glyphicon = "glyphicon glyphicon-plus";
        	} else {
        		$scope.showTypes = 'Hide selected requirement categories';
        		$scope.glyphicon = "glyphicon glyphicon-minus";
        	}
        }
        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        }
    });