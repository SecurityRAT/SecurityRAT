'use strict';

angular.module('sdlctoolApp').controller('RequirementSkeletonDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'RequirementSkeleton', 'OptColumnContent', 'AlternativeInstance', 'ReqCategory', 'TagInstance', 'CollectionInstance', 'ProjectType', 'CollectionCategory', 'TagCategory',
        function($scope, $stateParams, $uibModalInstance, entity, RequirementSkeleton, OptColumnContent, AlternativeInstance, ReqCategory, TagInstance, CollectionInstance, ProjectType, CollectionCategory, TagCategory) {

        $scope.requirementSkeleton = entity;
        if(typeof $scope.requirementSkeleton.tagInstances === 'undefined')  { $scope.requirementSkeleton.tagInstances=[]; }
        if(typeof $scope.requirementSkeleton.collectionInstances === 'undefined') { $scope.requirementSkeleton.collectionInstances=[]; }
        if(typeof $scope.requirementSkeleton.projectTypes === 'undefined') { $scope.requirementSkeleton.projectTypes=[]; }
        $scope.optcolumncontents = OptColumnContent.query();
        $scope.alternativeinstances = AlternativeInstance.query();
        $scope.reqcategorys = ReqCategory.query();
        $scope.taginstances = TagInstance.query();
        $scope.collectioninstances = CollectionInstance.query();
        $scope.projecttypes = ProjectType.query();
        $scope.tagCategories = TagCategory.query();
        $scope.collectionCategories = CollectionCategory.query();
        $scope.chosenCollections = [];
        $scope.load = function(id) {
            RequirementSkeleton.get({id : id}, function(result) {
                $scope.requirementSkeleton = result;         
            });
        };
        
        $scope.getCollectionInstancesForCategory = function(collectionCategoryId) {
        	var collectionInstances = [];
        	collectionInstances = $scope.collectioninstances.filter(function (el) {
        		return el.collectionCategory.id === collectionCategoryId;
        	});
        	return collectionInstances;
        };
        
        $scope.getTagInstancesForCategory = function(tagCategoryId) {
        	var tagInstances = [];
        	tagInstances = $scope.taginstances.filter(function (el) {
        		return el.tagCategory.id === tagCategoryId;
        	});
        	return tagInstances;
        };
        
        $scope.arrayObjectIndexOf = function(myArray, searchTerm, property) {
            if(typeof myArray === 'undefined') { return -1; }
        	for(var i = 0, len = myArray.length; i < len; i++) {
                if (myArray[i][property] === searchTerm) { return i; }
            }
            return -1;
        };
        
        $scope.toggleSelection = function (myArray, myObject) {
        	if(typeof myArray === 'undefined')  { myArray = []; }
        	var idx = $scope.arrayObjectIndexOf(myArray, myObject.id, 'id'); 
        	if (idx > -1) {
        		myArray.splice(idx, 1);
        	} else {
        		myArray.push(myObject);
        	}
        };
		
        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:requirementSkeletonUpdate', result);
            $uibModalInstance.close(result);
        };

        $scope.save = function () {
            if ($scope.requirementSkeleton.id !== null) {
                RequirementSkeleton.update($scope.requirementSkeleton, onSaveFinished);
            } else {
                RequirementSkeleton.save($scope.requirementSkeleton, onSaveFinished);
            }
        };

        $scope.clear = function() {
            $uibModalInstance.dismiss('cancel');
        };
}]);
