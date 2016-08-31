angular.module('sdlctoolApp')
	.controller('EditExcel', function ($scope, $uibModalInstance) {
		$scope.config = {};
		$scope.config.statusValues = true;
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		}
		
		$scope.confirm = function() {
			$uibModalInstance.close($scope.config);
		}
	});