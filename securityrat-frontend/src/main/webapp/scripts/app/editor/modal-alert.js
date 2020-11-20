'use strict';

angular.module('sdlctoolApp')
  .controller('ModalAlertController', [ '$scope', '$uibModalInstance', '$window', 'headerText', 'message', 'type',function($scope, $uibModalInstance, $window, $headerText, $message, $type) {
	$scope.confirm = function() {
		$uibModalInstance.close('confirm');
	};
	$scope.modalInstance = $uibModalInstance;

	/* jshint unused: false */
	$scope.$watch('modalInstance.opened.$$state.value', function(newVal, oldVal, scope) {
		if(!newVal) {
			$scope.confirm();
		}
	})
	$scope.reload = function() {
		$window.location.reload();
	};

	(function() {
		$scope.headerText = $headerText;
		$scope.message = $message;
		$scope.type = $type;
	})();
} ]);