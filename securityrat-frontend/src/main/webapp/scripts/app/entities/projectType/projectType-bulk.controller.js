'use strict';

angular.module('sdlctoolApp')
    .controller('ProjectTypeBulkController',function($scope, $stateParams, $uibModalInstance, $filter, entity, ProjectType, OptColumn, StatusColumn, sharedProperties) {
    	$scope.projectTypes = [];
    	$scope.optColumns = [];
    	$scope.statusColumns = [];
    	$scope.state = {
    			active: true
    	}
    	$scope.selectedOptColumns = {};
    	$scope.selectedStatusColumns = {};
    	
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.projectTypes[0].active;
        	angular.forEach($scope.projectTypes, function(type) {
    			if(type.active === $scope.state.active) {
    				count++
    			}
        	});
        	
        	if(count !== $scope.projectTypes.length) {
        		delete $scope.state.active;
        	}
        }
    	
    	$scope.getStateForOptColumns = function(optColumnId) {
        	var count = 0;
        	angular.forEach($scope.projectTypes, function(type) {
        		angular.forEach(type.optColumns, function(opt) {
        			if(optColumnId === opt.id) {
        				count++
        			}
        		});
        	});
        	if(count === $scope.projectTypes.length) {
        		$scope.selectedOptColumns[optColumnId].value = optColumnId.toString();
        	} else if(count !== $scope.count && count !== 0) {
        		$scope.selectedOptColumns[optColumnId].isKnown = true;
        	}
        }
    	$scope.getStateForStatColumns = function(statColumnId) {
        	var count = 0;
        	angular.forEach($scope.projectTypes, function(type) {
        		angular.forEach(type.statusColumns, function(stat) {
        			if(statColumnId === stat.id) {
        				count++
        			}
        		});
        	});
        	if(count === $scope.projectTypes.length) {
        		$scope.selectedStatusColumns[statColumnId].value = statColumnId.toString();
        	} else if(count !== $scope.count && count !== 0) {
        		$scope.selectedStatusColumns[statColumnId].isKnown = true;
        	}
        }
    	
    	$scope.removeIndeterminateState = function(column, selector) {
    		$scope[selector][column.id].isKnown = false;
    	}
    	
        $scope.loadAll = function() {
        	$scope.show = true;
        	$scope.projectTypes = sharedProperties.getProperty();
        	$scope.showTypes = 'Show selected project types';
    		$scope.glyphicon = "glyphicon glyphicon-plus";
    		$scope.getIndeterminateForActiveButton();
        	OptColumn.query(function(result) {
        	   $scope.optColumns = result;
        	   angular.forEach($scope.optColumns, function(opt) {
        		   $scope.selectedOptColumns[opt.id] = {};
        		   $scope.selectedOptColumns[opt.id].isKnown = false;
        		   $scope.selectedOptColumns[opt.id].selectedCount = 0;
        		   $scope.selectedOptColumns[opt.id].value = '';
        	   })
            });
        	StatusColumn.query(function(result) {
         	   $scope.statusColumns = result;
         	   angular.forEach($scope.statusColumns, function(stat) {
         		   $scope.selectedStatusColumns[stat.id] = {};
         		   $scope.selectedStatusColumns[stat.id].isKnown = false;
         		   $scope.selectedStatusColumns[stat.id].selectedCount = 0;
         		   $scope.selectedStatusColumns[stat.id].value = '';
         	   });
             });
        };
        $scope.loadAll();
      	  	
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:projectTypeUpdate', result);
            $uibModalInstance.close(result);
        };
        
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showTypes = 'Show selected project types';
        		$scope.glyphicon = "glyphicon glyphicon-plus";
        	} else {
        		$scope.showTypes = 'Hide selected project types';
        		$scope.glyphicon = "glyphicon glyphicon-minus";
        	}
        }
        
        $scope.save = function () {
		var count = 1;
    		angular.forEach($scope.projectTypes, function(type) {
    			if(angular.isDefined($scope.state.active))
    				type.active = $scope.state.active;
				angular.forEach($scope.optColumns, function(opt) {
					var hasOptColumn = false;
					var index = 0;
					for(var i = 0; i < type.optColumns.length; i++){
						if(opt.id === type.optColumns[i].id) {
							hasOptColumn = true;
							index = i;
						}
					};
					if(!$scope.selectedOptColumns[opt.id].isKnown) {
						if($scope.selectedOptColumns[opt.id].value != '' && !hasOptColumn) {
							type.optColumns.push(opt);
						} else if($scope.selectedOptColumns[opt.id].value === '' && hasOptColumn) {
							type.optColumns.splice(index, 1);
						}
					}
				}); 
				angular.forEach($scope.statusColumns, function(stat) {
					var hasOptColumn = false;
					var index = 0;
					for(var i = 0; i < type.statusColumns.length; i++){
						if(stat.id === type.statusColumns[i].id) {
							hasOptColumn = true;
							index = i;
						}
					};
					if(!$scope.selectedStatusColumns[stat.id].isKnown) {
						if($scope.selectedStatusColumns[stat.id].value != '' && !hasOptColumn) {
							type.statusColumns.push(stat);
						} else if($scope.selectedStatusColumns[stat.id].value === '' && hasOptColumn) {
							type.statusColumns.splice(index, 1);
						}
					}
				});
			if (count == $scope.projectTypes.length) {
    				ProjectType.update(type, onSaveFinished);
			} else {
				ProjectType.update(type);
			}
			count++;
    		});
        };
       
        $scope.delete = function () {
          $('#deleteProjectTypesConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDeleteAll = function (types) {
            var count = 1;
            angular.forEach(types, function(type) {
                if (count == types.length) {
                  ProjectType.delete({id: type.id}, function(result) {
                       $('#deleteProjectTypesConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  ProjectType.delete({id: type.id}, function() {});
                }
                count++;
            });
        };   
 
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
