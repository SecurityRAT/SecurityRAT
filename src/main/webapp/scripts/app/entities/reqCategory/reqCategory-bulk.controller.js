'use strict';

angular.module('sdlctoolApp')
    .controller('ReqCategoryBulkController', function($scope, $stateParams, $uibModalInstance, $filter, entity, ReqCategory, sharedProperties) {
    	$scope.requirementCategories = [];
    	$scope.active = true;
    	$scope.state = {
    			active: true
    	}
    	
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.requirementCategories[0].active;
        	angular.forEach($scope.requirementCategories, function(instance) {
    			if(instance.active === $scope.state.active) {
    				count++
    			}
        	});
        	
        	if(count !== $scope.requirementCategories.length) {
        		delete $scope.state.active;
        	}
        }
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected requirement categories';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
        	$scope.requirementCategories = sharedProperties.getProperty();
        	$scope.getIndeterminateForActiveButton ();
        };
        $scope.loadAll();
      	  		  
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:requirementCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
                var count = 1;
    		angular.forEach($scope.requirementCategories, function(category) {
    			category.active = $scope.state.active;
                        if (count == $scope.requirementCategories.length) {
    				ReqCategory.update(category, onSaveFinished);
                        } else {
				ReqCategory.update(category);
                        }
			count++;
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
       
         $scope.delete = function () {
          $('#deleteReqCategoriesConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDeleteAll = function (reqCategories) {
            var count = 1;
            angular.forEach(reqCategories, function(reqCat) {
                if (count == reqCategories.length) {
                  ReqCategory.delete({id: reqCat.id}, function(result) {
                       $('#deleteReqCategoriesConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  ReqCategory.delete({id: reqCat.id}, function() {});
                }
                count++;
            });
        };
 
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        }
    });
