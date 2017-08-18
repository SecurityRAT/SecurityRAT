'use strict';

/* jshint undef: true */
/* globals $ */

angular.module('sdlctoolApp')
    .controller('AlternativeSetBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, AlternativeSet, OptColumn, sharedProperties) {
    	$scope.alternativeSets = [];
    	$scope.optColumns = [];
    	$scope.state = {
    			active: true
    	};
    	$scope.selectedOptColumn = {
    			value: null
    	};
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.alternativeSets[0].active;
        	angular.forEach($scope.alternativeSets, function(set) {
    			if(set.active === $scope.state.active) {
    				count++;
    			}
        	});
        	
        	if(count !== $scope.alternativeSets.length) {
        		delete $scope.state.active;
        	}
        };
    	
        $scope.loadAll = function() {
        	$scope.showTypes = 'Show selected alternative sets';
    		$scope.glyphicon = 'glyphicon glyphicon-plus';
    		$scope.show = true;
        	$scope.alternativeSets = sharedProperties.getProperty();
        	$scope.getIndeterminateForActiveButton();
        	OptColumn.query(function(result) {
        		$scope.optColumns = result;
            });
        };
        $scope.loadAll();
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected alternative sets';
        		$scope.glyphicon = 'glyphicon glyphicon-plus';
        	} else {
        		$scope.showTypes = 'Hide selected alternative sets';
        		$scope.glyphicon = 'glyphicon glyphicon-minus';
        	}
		};
		
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:alternativeSetUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
		var count = 1;
    		angular.forEach($scope.alternativeSets, function(set) {
    			if(angular.isDefined($scope.state.active)){ set.active = $scope.state.active; }
    			if($scope.selectedOptColumn.value !== null) {
    				angular.forEach($scope.optColumns, function(optColumn) {
    	        		if($scope.selectedOptColumn.value === optColumn.id) {
    	        			set.optColumn = optColumn;
    	        		}
    	        	});
    			}
			if (count === $scope.alternativeSets.length) {
    				AlternativeSet.update(set, onSaveFinished);
			} else {
				AlternativeSet.update(set);
			}
			count++;
    		});
        };

        $scope.delete = function () {
          $('#deleteAlternativeSetsConfirmation').appendTo('body').modal('show');
        };

        $scope.confirmDeleteAll = function (sets) {
            var count = 1;
            angular.forEach(sets, function(set) {
                if (count === sets.length) {
                  AlternativeSet.delete({id: set.id}, function(result) {
                       $('#deleteAlternativeSetsConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  AlternativeSet.delete({id: set.id}, function() {});
                }
                count++;
            });
        };

        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
