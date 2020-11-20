'use strict';

/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:removeRequirementCtrl
 * @description
 * # removeRequirementCtrl
 * Controller of the sdlcFrontendApp
 */
angular.module('sdlctoolApp')
  .controller('removeRequirementController', function ($scope, customRequirements, $uibModalInstance) {
	  $scope.customRequirements = customRequirements;
	  
	  $scope.init = function() {
		  $scope.itemToRemove = $scope.customRequirements[0];
	  }
	  
	  $scope.selectRequirement = function(item) {
		  $scope.itemToRemove = item;
	  }
	  
	  $scope.cancel = function() {
		  $uibModalInstance.dismiss('cancel');
	  }
	  
	  $scope.close = function() {
		  $uibModalInstance.close($scope.itemToRemove);
	  }
  });