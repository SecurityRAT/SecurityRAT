'use strict';

angular.module('sdlctoolApp')
    .controller('RequirementSkeletonController', function ($scope, $filter, sharedProperties, RequirementSkeleton, RequirementSkeletonSearch, ReqCategory, TagInstance
    		, ProjectType, CollectionInstance, TagCategory, CollectionCategory, $document) {
        $scope.requirementSkeletons = [];
        $scope.filterCategory = [];
        $scope.tagCategories = [];
        $scope.collCategories = [];
        $scope.dropdowns = {};
        $scope.tagInstances = [];
        $scope.projectTypes = [];
        $scope.collectionsInstances = [];
        $scope.selectedCategory = [];
        $scope.selectedTags = [];
        $scope.selectedTypes = [];
        $scope.selectedColls = [];
	$scope.searchString = '';
	$scope.length = 1000;
	$scope.numberToDisplay = 50;
        $scope.categoryLabelText = {buttonDefaultText: 'Category'};
        $scope.selectedCategorySettings = {
  			  smartButtonMaxItems: 2,
  			  showCheckAll: false, showUncheckAll: false,
  			  displayProp: 'name', idProp: 'id', externalIdProp: ''
  	    };
        $scope.selectedTagSettings = {
    			  smartButtonMaxItems: 2,
    			  showCheckAll: false, showUncheckAll: false,
    			  displayProp: 'name', idProp: 'id', externalIdProp: '',
    			  groupByTextProvider: function(groupValue) {
//    				  var value = JSON.parse(groupValue);
    				  return groupValue.name;
    			  }
    	    };
//        $scope.tagLabelText = {buttonDefaultText: 'Tags'};
        $scope.typeLabelText = {buttonDefaultText: 'Project Types'};
//        $scope.collectionLabelText = {buttonDefaultText: 'Collections'};
        
        $scope.loadAll = function() {
            RequirementSkeleton.query(function(result) {
               $scope.requirementSkeletons = result;
               angular.forEach($scope.requirementSkeletons, function(requirement) {
            	   angular.extend(requirement, {selected: false});
               });
	       $scope.length = $scope.requirementSkeletons.length;
            });
            ReqCategory.query(function(result) {
            	$scope.filterCategory = result;
            	$filter('orderBy')($scope.filterCategory, 'showOrder');
             });
            TagInstance.query(function(result) {
            	$scope.tagInstances = result;
            	$filter('orderBy')($scope.tagInstances, 'showOrder');
             });
            ProjectType.query(function(result) {
            	$scope.projectTypes = result;
            	$filter('orderBy')($scope.projectTypes, 'showOrder');
             });
            CollectionInstance.query(function(result) {
            	$scope.collectionsInstances = result;
            	$filter('orderBy')($scope.collectionsInstances, 'showOrder');
             });
            TagCategory.query(function(result) {
            	$scope.tagCategories = result;
            	$filter('orderBy')($scope.tagCategories, 'showOrder');
            });
            CollectionCategory.query(function(result) {
            	$scope.collCategories = result;
            	$filter('orderBy')($scope.collCategories, 'showOrder');
            });
            $scope.dropdowns.tag = {buttonText: 'Tags', open: false, defaultText: 'Tags'};
            $scope.dropdowns.coll = {buttonText: 'Collections', open: false, defaultText: 'Collections'};
        };
        $scope.loadAll();
        
	$scope.loadMore = function() {
	   if ($scope.numberToDisplay + 50 < $scope.length) {
           	$scope.numberToDisplay += 50;
	   } else {
		$scope.numberToDisplay = $scope.length;
	   }
       };
        
        $scope.toggleDropdown = function(selector, $event) {
        	var dropdowns = ['tag', 'coll'];
        	dropdowns.splice(dropdowns.indexOf(selector), 1);
        	if(!$scope.dropdowns[selector].open) {
	        	$document.on('click', function (e) {
	                var target = e.target.parentElement;
	                var parentFound = false;
	
					while (angular.isDefined(target) && target !== null && !parentFound) {
					    if (angular.equals(target.id, 'multiselect-parent') && !parentFound) {
					            parentFound = true;
					    }
					    target = target.parentElement;
					}
					
					if (!parentFound) {
					    $scope.$apply(function () {
					        $scope.dropdowns[selector].open = false;
					    });
					}
				});
				for(var i = 0; i < dropdowns.length; i++) {
					$scope.dropdowns[dropdowns[i]].open = false;
				}
				$scope.dropdowns[selector].open = true;
        	}else {
        		$scope.dropdowns[selector].open = false;
        	}
        }
        
        $scope.selectTagInstance = function(tagInstance, selector, dropdownSelector) {
        	var exist = false;
        	var index = 0;
        	for(var i = 0; i < $scope[selector].length; i++) {
        		if($scope[selector][i].id == tagInstance.id) {
        			exist = true;
        			index = i;
        			break;
        		}
        	}
        	if(!exist) {
        		$scope[selector].push(tagInstance);
        	} else {
        		$scope[selector].splice(index, 1);
        	}
        	if($scope[selector].length === 0)  {
        		$scope.dropdowns[dropdownSelector].buttonText = $scope.dropdowns[dropdownSelector].defaultText;
        	}
        	if($scope[selector].length > 0) {
        		$scope.dropdowns[dropdownSelector].buttonText = '';
        		$scope.dropdowns[dropdownSelector].buttonText = $scope[selector][0].name;
        		for(var i = 1; i < $scope[selector].length && i < 2; i++) {
        			$scope.dropdowns[dropdownSelector].buttonText += ', ' + $scope[selector][1].name;
        		}
        		if($scope[selector].length > 2 )
        			$scope.dropdowns[dropdownSelector].buttonText += ',...'
        	}
        	
        }
        
        $scope.isTagSelected = function(tagInstance, selector) {
        	var exist = false;
        	for(var i = 0; i < $scope[selector].length; i++) {
        		if($scope[selector][i].id == tagInstance.id) {
        			exist = true;
        			break;
        		}
        	}
        	if(!exist) {
        		return false;
        	}else {
        		return true;
        	}
        }
        
        $scope.selectAllReqs = function() {
        	var requirements = $filter('filterCategoryForEntities')($scope.requirementSkeletons, $scope.selectedCategory, 'reqCategory');
        	requirements = $filter('filterByTagForReqSkeletons')(requirements, $scope.selectedTags);
        	requirements = $filter('filterByCollsForReqSkeletons')(requirements, $scope.selectedColls);
        	requirements = $filter('filterByTypesForReqSkeletons')(requirements, $scope.selectedTypes);
        	requirements = $filter('orderBy')(requirements, ['reqCategory.showOrder','showOrder']);
        	
  		  angular.forEach(requirements, function(requirement) {
  			  requirement.selected = true;
  		  });
	  	}
	  	
	  	$scope.deselectAllReqs = function() {
	  		  angular.forEach($scope.requirementSkeletons, function(requirement) {
	  			  requirement.selected = false;
	  		  });
	  	}
	  	
	  	$scope.bulkChange = function() {
	  		var reqs = [];
	  		angular.forEach($scope.requirementSkeletons, function(requirement) {
	  			if (requirement.selected) {
	  				reqs.push(requirement);
	  			}
	  		});
	  		sharedProperties.setProperty(reqs);
	  	}
        
        $scope.delete = function (id) {
            RequirementSkeleton.get({id: id}, function(result) {
                $scope.requirementSkeleton = result;
		$('#deleteRequirementSkeletonConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            RequirementSkeleton.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteRequirementSkeletonConfirmation').modal('hide');
                    $scope.clear();
                });
        };


        $scope.search = function () {
            RequirementSkeletonSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.requirementSkeletons = result;
                
                
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.requirementSkeleton = {universalId: null, shortName: null, description: null, showOrder: null, active: null, id: null};
        };
    });
