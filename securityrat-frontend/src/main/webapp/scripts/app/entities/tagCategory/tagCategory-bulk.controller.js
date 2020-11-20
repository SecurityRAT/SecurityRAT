'use strict';

angular.module('sdlctoolApp')
    .controller('TagCategoryBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, TagCategory, sharedProperties) {
    	$scope.tagCategories = [];
    	$scope.state = {
    			active: true
    	}
    	
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.tagCategories[0].active;
        	angular.forEach($scope.tagCategories, function(instance) {
    			if(instance.active === $scope.state.active) {
    				count++
    			}
        	});
        	
        	if(count !== $scope.tagCategories.length) {
        		delete $scope.state.active;
        	}
        }
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected tag categories';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
        	$scope.tagCategories = sharedProperties.getProperty();
        	$scope.getIndeterminateForActiveButton();
        };
        $scope.loadAll();
      	  		  
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:tagCategoryUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
                var count = 1;
    		angular.forEach($scope.tagCategories, function(category) {
    			category.active = $scope.state.active;
                        if (count == $scope.tagCategories.length) {
                               TagCategory.update(category, onSaveFinished);
                        } else {
                               TagCategory.update(category);
                        }
                        count++;
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

        $scope.delete = function () {
          $('#deleteTagCategoriesConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDeleteAll = function (tagCategories) {
            var count = 1;
            angular.forEach(tagCategories, function(tagCat) {
                if (count == tagCategories.length) {
                  TagCategory.delete({id: tagCat.id}, function(result) {
                       $('#deleteTagCategoriesConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  TagCategory.delete({id: tagCat.id}, function() {});
                }
                count++;
            });
        }; 

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
