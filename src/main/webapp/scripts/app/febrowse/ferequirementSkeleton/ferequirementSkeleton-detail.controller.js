'use strict';

angular.module('sdlctoolApp')
    .controller('FeRequirementSkeletonDetailController', function ($scope, $filter, $rootScope, entity, RequirementSkeleton, OptColumnContent, apiFactory, AlternativeInstance) {
        $scope.requirementSkeleton = entity;
        $scope.optColumnContents = [];
        $scope.altInstances = [];
        $scope.load = function (id) {
            RequirementSkeleton.get({id: id}, function(result) {
            	
                $scope.requirementSkeleton = result;
            });
        };
        OptColumnContent.query(function(result) {
        	angular.forEach(result, function(content) {
        		if(content.requirementSkeleton.id === $scope.requirementSkeleton.id) {
        			$scope.optColumnContents.push(content);
        		}
        	})
        });
        AlternativeInstance.query(function(result) {
        	angular.forEach(result, function(instance){
        		if(instance.requirementSkeleton.id == $scope.requirementSkeleton.id)
        			$scope.altInstances.push(instance);
        	})
        });
        $rootScope.$on('sdlctoolApp:requirementSkeletonUpdate', function(event, result) {
            $scope.requirementSkeleton = result;
        });
    });
