'use strict';

angular.module('sdlctoolApp')
    .controller('FeRequirementSkeletonController', function ($scope, $filter, sharedProperties, RequirementSkeleton, RequirementSkeletonSearch, ReqCategory, TagInstance
    		, ProjectType, CollectionInstance, TagCategory, CollectionCategory, $document) {
        $scope.requirementSkeletons = [];
        $scope.filterCategory = [];
        $scope.tagCategories = [];
        $scope.collCategories = [];
        $scope.dropdowns = {};
        $scope.tagInstances = [];
        $scope.projectTypes = [];
        $scope.collectionsInstances = [];
        
        $scope.loadAll = function() {
            RequirementSkeleton.query(function(result) {
               $scope.requirementSkeletons = result;
               angular.forEach($scope.requirementSkeletons, function(requirement) {
            	   angular.extend(requirement, {selected: false});
               });
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
        };
        $scope.loadAll();
        $scope.searchArrayByValue = function(search, object) {
        	var bool = false;
        	angular.forEach(object, function(obj) {
        		angular.forEach(obj, function(value, key) {
        			if(key === 'id') {
	        			if(value === search){
	        				bool = true;
	        			}
        			}
        		});
        	});
        	return bool;
        }

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.requirementSkeleton = {universalId: null, shortName: null, description: null, showOrder: null, active: null, id: null};
        };
    });
