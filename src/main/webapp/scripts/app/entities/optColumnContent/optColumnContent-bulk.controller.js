'use strict';

/* jshint undef: true */
/* globals $ */

angular.module('sdlctoolApp')
    .controller('OptColumnContentBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, OptColumnContent, 
    		RequirementSkeleton, OptColumn, sharedProperties) {
    	$scope.optColumnContents = [];
    	$scope.optColumns = [];
    	$scope.requirementSkeletons = [];
    	$scope.state = {
    			active: true
    	};
    	$scope.selectedOptColumn = {
    			value: null
    	};
    	$scope.selectedRequirementSkeleton = {
    			value: null
    	};
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected contents';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.show = true;
    		$scope.optColumnContents = sharedProperties.getProperty();
        	RequirementSkeleton.query(function(result) {
        		$scope.requirementSkeletons = result;
        		$scope.requirementSkeletons = $filter('orderBy')($scope.requirementSkeletons, ['reqCategory.showOrder', 'showOrder']);
            });
        	OptColumn.query(function(result) {
        		$scope.optColumns = result;
        		$scope.optColumns = $filter('orderBy')($scope.optColumns, ['showOrder']);
            });
        };
        $scope.loadAll();
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected contents';
        		$scope.glyphicon = "glyphicon glyphicon-plus";
        	} else {
        		$scope.showTypes = 'Hide selected contents';
        		$scope.glyphicon = "glyphicon glyphicon-minus";
        	}
        };   	
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:optColumnContentUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
                var count = 1;
    		angular.forEach($scope.optColumnContents, function(content) {
    			if($scope.selectedOptColumn.value !== null) {
    				angular.forEach($scope.optColumns, function(opt) {
    	        		if($scope.selectedOptColumn.value === opt.id) {
    	        			content.optColumn = opt;
    	        		}
    	        	});
    			}
    			if($scope.selectedRequirementSkeleton.value !== null) {
    				angular.forEach($scope.requirementSkeletons, function(req) {
    	        		if($scope.selectedRequirementSkeleton.value === req.id) {
    	        			content.requirementSkeleton = req;
    	        		}
    	        	});
    			}
 			if (count === $scope.optColumnContents.length) {
    				OptColumnContent.update(content, onSaveFinished);
 			} else {
				OptColumnContent.update(content);
			}
			count++;
    		});
        };

        $scope.delete = function () {
          $('#deleteOptColumnContentsConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDeleteAll = function (optColumnContents) {
            var count = 1;
            angular.forEach(optColumnContents, function(columnContent) {
                if (count === optColumnContents.length) {
                  OptColumnContent.delete({id: columnContent.id}, function(result) {
                       $('#deleteOptColumnContentsConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  OptColumnContent.delete({id: columnContent.id}, function() {});
                }
                count++;
            });
        };

        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
