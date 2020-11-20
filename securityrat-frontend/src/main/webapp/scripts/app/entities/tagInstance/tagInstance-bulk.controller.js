'use strict';

angular.module('sdlctoolApp')
    .controller('TagInstanceBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, TagInstance, TagCategory, sharedProperties) {
    	$scope.tagInstance = [];
    	$scope.tagCategories = [];
    	$scope.state = {
    			active: true
    	}
    	$scope.selectedCat = {
    			value: null
    	};
    	
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.tagInstance[0].active;
        	angular.forEach($scope.tagInstance, function(instance) {
    			if(instance.active === $scope.state.active) {
    				count++
    			}
        	});
        	
        	if(count !== $scope.tagInstance.length) {
        		delete $scope.state.active;
        	}
        }
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected tag instances';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
        	$scope.tagInstance = sharedProperties.getProperty();
        	$scope.getIndeterminateForActiveButton();
        	TagCategory.query(function(result) {
        	   $scope.tagCategories = result;
            });
        };
        $scope.loadAll();
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected tag instances';
        		$scope.glyphicon = "glyphicon glyphicon-plus";
        	} else {
        		$scope.showTypes = 'Hide selected tag instances';
        		$scope.glyphicon = "glyphicon glyphicon-minus";
        	}
        }  	
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:tagInstanceUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
                var count = 1;
    		angular.forEach($scope.tagInstance, function(instance) {
    			if(angular.isDefined($scope.state.active))
    				instance.active = $scope.state.active;
    			if($scope.selectedCat.value !== null) {
    				angular.forEach($scope.tagCategories, function(cat) {
    	        		if($scope.selectedCat.value === cat.id) {
    	        			instance.tagCategory = cat;
    	        		}
    	        	});
    			}
                        if (count == $scope.tagInstance.length) {
    			        TagInstance.update(instance, onSaveFinished);
                        } else {
                                TagInstance.update(instance);
                        }
                        count++;
    		});
        };

        $scope.delete = function () {
          $('#deleteTagInstancesConfirmation').appendTo("body").modal('show');
        };
        
        $scope.confirmDeleteAll = function (instances) {
            var count = 1;
            angular.forEach(instances, function(instance) {
                if (count == instances.length) {
                  TagInstance.delete({id: instance.id}, function(result) {
                       $('#deleteTagInstancesConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  TagInstance.delete({id: instance.id}, function() {});
                }
                count++;
            });
        };
        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
