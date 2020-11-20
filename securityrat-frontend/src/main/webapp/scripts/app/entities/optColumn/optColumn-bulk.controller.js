'use strict';
/* jshint undef: true */
/* globals $ */

angular.module('sdlctoolApp')
    .controller('OptColumnBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, OptColumn, OptColumnType, sharedProperties) {
    	$scope.optColumns = [];
    	$scope.optColumnTypes = [];
    	$scope.state = {
    			active: true
    	};
    	$scope.selectedType = {
    			value: null
    	};
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.optColumns[0].active;
        	angular.forEach($scope.optColumns, function(opt) {
    			if(opt.active === $scope.state.active) {
    				count++;
    			}
        	});
        	
        	if(count !== $scope.optColumns.length) {
        		delete $scope.state.active;
        	}
        };
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected option columns';
    		$scope.glyphicon = 'glyphicon glyphicon-plus';
    		$scope.show = true;
        	$scope.optColumns = sharedProperties.getProperty();
        	$scope.getIndeterminateForActiveButton();
        	OptColumnType.query(function(result) {
        	   $scope.optColumnTypes = result;
            });
        };
        $scope.loadAll();
      	  	
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:optColumnUpdate', result);
            $uibModalInstance.close(result);
        };
        
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected option columns';
        		$scope.glyphicon = 'glyphicon glyphicon-plus';
        	} else {
        		$scope.showTypes = 'Hide selected option columns';
        		$scope.glyphicon = 'glyphicon glyphicon-minus';
        	}
        };

        $scope.save = function () {
                var count = 1;
    		angular.forEach($scope.optColumns, function(optColumn) {
    			if(angular.isDefined($scope.state.active)){ optColumn.active = $scope.state.active; }
    			if($scope.selectedType.value !== null) {
    				angular.forEach($scope.optColumnTypes, function(type) {
    	        		if($scope.selectedType.value === type.id) {
    	        			optColumn.optColumnType = type;
    	        		}
    	        	});
    			}
			if (count === $scope.optColumns.length) {
		                OptColumn.update(optColumn, onSaveFinished);
                	} else {
                  		OptColumn.update(optColumn);
                	}
                	count++;
    		});
        };

        $scope.delete = function () {
          $('#deleteOptColumnsConfirmation').appendTo('body').modal('show');
        };

        $scope.confirmDeleteAll = function (optColumns) {
            var count = 1;
            angular.forEach(optColumns, function(optColumn) {
                if (count === optColumns.length) {
                  OptColumn.delete({id: optColumn.id}, function(result) {
                       $('#deleteOptColumnsConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  OptColumn.delete({id: optColumn.id}, function() {});
                }
                count++;
            });
        };
        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
