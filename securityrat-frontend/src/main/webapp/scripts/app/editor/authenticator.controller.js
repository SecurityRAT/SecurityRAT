angular.module('sdlctoolApp')
	.controller('AuthenticatorController', function ($scope, $uibModalInstance, $timeout,jira) {
		$scope.jira = jira;
		
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		}
		
		$scope.close = function() {
			$uibModalInstance.close('closed');
		}
	});