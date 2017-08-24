'use strict';

angular.module('sdlctoolApp')
    .controller('FeRequirementSkeletonDetailController', function ($scope, $filter, $rootScope, entity, apiFactory, $window) {
        $scope.requirementSkeleton = entity;
        $scope.optColumnContents = [];
        $scope.altInstances = [];
        $scope.tagCategories = [];
		$scope.collCategories = [];
		
		$window.document.title = 'Browse requirement [' + entity.shortName + ']';
        
        angular.forEach($scope.requirementSkeleton.collectionInstances, function(collInstance) {
    		var isPresent = $filter('filter')($scope.collCategories, {'id' : collInstance.collectionCategory.id});
    		if(isPresent.length === 0) {
    			$scope.collCategories.push(collInstance.collectionCategory);
    		}
		});
		
    	angular.forEach($scope.requirementSkeleton.tagInstances, function(tagInstance) {
    		var isPresent = $filter('filter')($scope.tagCategories, {'id' : tagInstance.tagCategory.id});
    		if(isPresent.length === 0) {
    			$scope.tagCategories.push(tagInstance.tagCategory);
    		}
    	});
        apiFactory.getAll('alternativeinstances').then(function(result) {
        	angular.forEach(result, function(instance){
        		if(instance.requirementSkeleton.id === $scope.requirementSkeleton.id) { $scope.altInstances.push(instance); }
        	});
        });
        apiFactory.getAll('optColumnContents').then(function(result) {
        	angular.forEach(result, function(content) {
        		if(content.requirementSkeleton.id === $scope.requirementSkeleton.id) {
        			$scope.optColumnContents.push(content);
        		}
        	});
        });
        $rootScope.$on('sdlctoolApp:requirementSkeletonUpdate', function(event, result) {
            $scope.requirementSkeleton = result;
        });
    });
