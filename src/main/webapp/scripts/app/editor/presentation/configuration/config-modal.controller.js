angular.module('sdlctoolApp')
	.controller('EditPresentation', function ($scope, $uibModalInstance, $rootScope, $state, requirements, localStorageService) {
		var params = {};
		params.requirements = requirements;
		$scope.config = {};
		
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		}
		
		$scope.confirm = function() {
			params.config = $scope.config;
			if (localStorageService.isSupported) {
				localStorageService.set('myRevealjs', JSON.stringify(params));
				window.open($state.href('presentation'), '_blank');
			}
			$uibModalInstance.close('closed');
		}
	});