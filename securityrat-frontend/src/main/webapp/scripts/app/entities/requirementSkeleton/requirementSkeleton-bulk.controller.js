'use strict';

/* jshint undef: true */
/* globals $ */

angular.module('sdlctoolApp')
    .controller('RequirementSkeletonBulkController', function($scope, $stateParams, $uibModalInstance, sharedProperties, $filter, entity, RequirementSkeleton, ReqCategory, TagInstance, 
    		TagCategory, CollectionCategory, CollectionInstance, ProjectType) {
    	$scope.requirements = [];
    	$scope.requirementCategories = [];
    	$scope.tagInstances = [];
    	$scope.selectedTagInstances = {};
    	$scope.collectionInstances = [];
    	$scope.selectedCollectionInstances = {};
    	$scope.projectTypes = [];
    	$scope.selectedProjectTypes = {};
    	$scope.tagCategories = [];
        $scope.collectionCategories = [];
        $scope.count = 0;
        $scope.showRequirement = 'Show selected requirements';
        $scope.glyphicon = "glyphicon glyphicon-plus";
        $scope.show = true;	
        $scope.indeterminateTagInstances = [];
        $scope.selectedCat = {
    			value: null
    	};
        
    	$scope.state = {
    			active: true
    	};
    	$scope.getIndeterminateForActiveButton = function() {
        	var count = 0;
        	$scope.state.active = $scope.requirements[0].active;
        	angular.forEach($scope.requirements, function(requirement) {
    			if(requirement.active === $scope.state.active) {
    				count++;
    			}
        	});
        	
        	if(count !== $scope.requirements.length) {
        		delete $scope.state.active;
        	}
        };
        $scope.loadAll = function() {
        	$scope.requirements = sharedProperties.getProperty();
        	$scope.count = $scope.requirements.length;
        	$scope.getIndeterminateForActiveButton();
        	ReqCategory.query(function(result) {
        	   $scope.requirementCategories = result;
               $filter('orderBy')($scope.requirementCategories, 'showOrder');
            });
        	TagCategory.query(function(result) {
        		$scope.tagCategories = result;
                $filter('orderBy')($scope.tagCategories, 'showOrder');
            });
        	TagInstance.query(function(result) {
        		$scope.tagInstances = result;
                $filter('orderBy')($scope.tagInstances, 'showOrder');
                angular.forEach($scope.tagInstances, function(instance) {
                	$scope.selectedTagInstances[instance.id] = {};
                	$scope.selectedTagInstances[instance.id].value = '';
                	$scope.selectedTagInstances[instance.id].isKnown = false;
                });
            });
        	CollectionInstance.query(function(result) {
        		$scope.collectionInstances = result;
                $filter('orderBy')($scope.collectionInstances, 'showOrder');
                angular.forEach($scope.collectionInstances, function(coll) {
                	$scope.selectedCollectionInstances[coll.id] = {};
                	$scope.selectedCollectionInstances[coll.id].value = '';
                	$scope.selectedCollectionInstances[coll.id].isKnown = false;
                });
            });
        	CollectionCategory.query(function(result) {
        		$scope.collectionCategories = result;
                $filter('orderBy')($scope.collectionCategories, 'showOrder');
            });
        	ProjectType.query(function(result) {
        		$scope.projectTypes = result;
                $filter('orderBy')($scope.projectTypes, 'showOrder');
                angular.forEach($scope.projectTypes, function(type) {
                	$scope.selectedProjectTypes[type.id] = {};
                	$scope.selectedProjectTypes[type.id].value = '';
                	$scope.selectedProjectTypes[type.id].isKnown = false;
                });
            });
        };
        $scope.loadAll();
        
        $scope.getCollectionInstancesForCategory = function(collectionCategoryId) {
        	var collectionInstances = [];
        	collectionInstances = $scope.collectionInstances.filter(function (el) {
        		return el.collectionCategory.id === collectionCategoryId;
        	});
        	return collectionInstances;
        };
        
        $scope.getTagInstancesForCategory = function(tagCategoryId) {
        	var tagInstances = [];
        	tagInstances = $scope.tagInstances.filter(function (el) {
        		return el.tagCategory.id === tagCategoryId;
        	});
        	return tagInstances;
        };
        
        $scope.getCheckedForTagInstances = function(tagInstanceId) {
        	var count = 0;
        	angular.forEach($scope.requirements, function(requirement) {
        		angular.forEach(requirement.tagInstances, function(tag) {
        			if(tagInstanceId === tag.id) {
        				count++;
        			}
        		});
        	});
        	if(count === $scope.count) {
        		$scope.selectedTagInstances[tagInstanceId].value = tagInstanceId.toString();
        	} else if(count !== $scope.count && count !== 0) {
        		$scope.selectedTagInstances[tagInstanceId].isKnown = true;
        	}
        };
        
        $scope.getCheckedForCollectionInstances = function(collectionInstanceId) {
        	var count = 0;
        	angular.forEach($scope.requirements, function(requirement) {
        		angular.forEach(requirement.collectionInstances, function(collection) {
        			if(collectionInstanceId === collection.id) {
        				count++;
        			}
        		});
        	});
        	if(count === $scope.count) {
        		$scope.selectedCollectionInstances[collectionInstanceId].value = collectionInstanceId.toString();
        	} else if(count !== $scope.count && count !== 0) {
        		$scope.selectedCollectionInstances[collectionInstanceId].isKnown = true;
        	}
        };
        
        $scope.getCheckedForProjectTypes = function(projectTypeId) {
        	var count = 0;
        	angular.forEach($scope.requirements, function(requirement) {
        		angular.forEach(requirement.projectTypes, function(projectType) {
        			if(projectTypeId === projectType.id) {
        				count++;
        			}
        		});
        	});
        	
        	if(count === $scope.count) {
        		$scope.selectedProjectTypes[projectTypeId].value = projectTypeId.toString();
        	} else if(count !== $scope.count && count !== 0){
        		$scope.selectedProjectTypes[projectTypeId].isKnown = true;
        	}
        };
        
        // Desactivate the indeterminate state of the given property id of the selector
        $scope.removeIndeterminate = function(propertyId, selector) {
        	$scope[selector][propertyId].isKnown = false;
        };
        
        $scope.toggleShowHide = function() {
        	$scope.show = !$scope.show;
        	if($scope.show) {
        		$scope.showRequirement = 'Show selected requirements';
        		$scope.glyphicon = "glyphicon glyphicon-plus";
        	} else {
        		$scope.showRequirement = 'Hide selected requirements';
        		$scope.glyphicon = "glyphicon glyphicon-minus";
        	}
        };
      	  		  
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:requirementSkeletonUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
                var count = 1;
        	angular.forEach($scope.requirements, function(requirement) {
    			angular.forEach($scope.tagInstances, function(tag) {
    				var hasInstance = false;
					var index = 0;
					for(var i = 0; i < requirement.tagInstances.length; i++){
						if(tag.id === requirement.tagInstances[i].id) {
							hasInstance = true;
							index = i;
						}
					}
					if(!$scope.selectedTagInstances[tag.id].isKnown){
						if ($scope.selectedTagInstances[tag.id].value !== '' && !hasInstance) {
							requirement.tagInstances.push(tag);
						} else if($scope.selectedTagInstances[tag.id].value === '' && hasInstance) {
							requirement.tagInstances.splice(index, 1);
						}
					}
    			});
    			
    			angular.forEach($scope.collectionInstances, function(coll) {
    				var hasInstance = false;
					var index = 0;
					for(var i = 0; i < requirement.collectionInstances.length; i++){
						if(coll.id === requirement.collectionInstances[i].id) {
							hasInstance = true;
							index = i;
						}
					}
					if(!$scope.selectedCollectionInstances[coll.id].isKnown){
						if ($scope.selectedCollectionInstances[coll.id].value !== '' && !hasInstance) {
							requirement.collectionInstances.push(coll);
						} else if($scope.selectedCollectionInstances[coll.id].value === '' && hasInstance) {
							requirement.collectionInstances.splice(index, 1);
						}
					}
    			});
    			angular.forEach($scope.projectTypes, function(type) {
    				var hasInstance = false;
					var index = 0;
					for(var i = 0; i < requirement.projectTypes.length; i++){
						if(type.id === requirement.projectTypes[i].id) {
							hasInstance = true;
							index = i;
						}
					}
					if(!$scope.selectedProjectTypes[type.id].isKnown){
						if ($scope.selectedProjectTypes[type.id].value !== '' && !hasInstance) {
							requirement.projectTypes.push(type);
						} else if($scope.selectedProjectTypes[type.id].value === '' && hasInstance) {
							requirement.projectTypes.splice(index, 1);
						}
					}
    			});
        		if($scope.selectedCat.value !== null) {
    				angular.forEach($scope.requirementCategories, function(cat) {
    	        		if($scope.selectedCat.value === cat.id) {
    	        			requirement.reqCategory = cat;
    	        		}
    	        	});
    			}
        		if(angular.isDefined($scope.state.active)){ requirement.active = $scope.state.active; }
        		if (count === $scope.requirements.length) {
                            RequirementSkeleton.update(requirement, onSaveFinished);
                        } else {
                            RequirementSkeleton.update(requirement);
                        }
                        count++;
        	});
        };

         $scope.delete = function () {
          $('#deleteRequirementSkeletonsConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDeleteAll = function (requirements) {
            var count = 1;
            angular.forEach(requirements, function(req) {
                if (count === requirements.length) {
                  RequirementSkeleton.delete({id: req.id}, function(result) {
                       $('#deleteRequirementSkeletonsConfirmation').modal('hide');
                       onSaveFinished(result);
                  });
                } else {
                  RequirementSkeleton.delete({id: req.id}, function() {});
                }
                count++;
            });
        };
        
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
    });
