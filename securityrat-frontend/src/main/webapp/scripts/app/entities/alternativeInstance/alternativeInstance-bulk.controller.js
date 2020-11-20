'use strict';
/* jshint undef: true */
/* globals $ */
angular.module('sdlctoolApp')
    .controller('AlternativeInstanceBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, AlternativeInstance, 
    		RequirementSkeleton, AlternativeSet, sharedProperties) {
    	$scope.alternativeInstances = [];
    	$scope.alternativeSets = [];
    	$scope.requirementSkeletons = [];
    	$scope.state = {
    			active: true
    	};
    	$scope.selectedAlternativeSet = {
    			value: null
    	};
    	$scope.selectedRequirementSkeleton = {
    			value: null
    	};
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected alternative instances';
    		$scope.glyphicon = 'glyphicon glyphicon-plus';
    		$scope.show = true;
    		$scope.alternativeInstances = sharedProperties.getProperty();
        	RequirementSkeleton.query(function(result) {
        		$scope.requirementSkeletons = result;
        		$scope.requirementSkeletons = $filter('orderBy')($scope.requirementSkeletons, ['reqCategory.showOrder', 'showOrder']);
            });
        	AlternativeSet.query(function(result) {
        		$scope.alternativeSets = result;
        		$scope.optColumns = $filter('orderBy')($scope.optColumns, ['showOrder']);
            });
        };
        $scope.loadAll();
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected alternative instances';
        		$scope.glyphicon = 'glyphicon glyphicon-plus';
        	} else {
        		$scope.showTypes = 'Hide selected alternative instances';
        		$scope.glyphicon = 'glyphicon glyphicon-minus';
        	}
        };
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:alternativeInstanceUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
		var count = 1;
    		angular.forEach($scope.alternativeInstances, function(instance) {
    			if($scope.selectedAlternativeSet.value !== null) {
    				angular.forEach($scope.alternativeSets, function(set) {
    	        		if($scope.selectedAlternativeSet.value === set.id) {
    	        			instance.alternativeSet = set;
    	        		}
    	        	});
    			}
    			if($scope.selectedRequirementSkeleton.value !== null) {
    				angular.forEach($scope.requirementSkeletons, function(req) {
    	        		if($scope.selectedRequirementSkeleton.value === req.id) {
    	        			instance.requirementSkeleton = req;
    	        		}
    	        	});
    			}
			if (count === $scope.alternativeInstances.length) {
    				AlternativeInstance.update(instance, onSaveFinished);
			} else {
				AlternativeInstance.update(instance);
			}
			count++;
    		});
        };
        
        $scope.delete = function () {
          $('#deleteAlternativeInstancesConfirmation').appendTo('body').modal('show');
        };

        $scope.confirmDeleteAll = function (instances) {
            var count = 1;
            angular.forEach(instances, function(instance) {            
		if (count === instances.length) {
                  AlternativeInstance.delete({id: instance.id}, function(result) {
                       $('#deleteAlternativeInstancesConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  AlternativeInstance.delete({id: instance.id}, function() {});
                }
                count++;
            });
        };

        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
