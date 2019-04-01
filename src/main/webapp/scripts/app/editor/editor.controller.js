'use strict';

angular.module('sdlctoolApp')
.controller('EditorController', function ($scope, $uibModal, $location, sharedProperties, localStorageService, appConfig) {

	$scope.fileParams = '';
	$scope.detectedRestore = false;
	$scope.welcomeMessage = appConfig.welcomeMessage;

	$scope.initStarter = function() {
		$uibModal.open({
			size: 'lg',
			backdrop: 'static',
            templateUrl: 'scripts/app/editor/starter/starter.html',
            controller: 'StarterController',
            resolve:  {
            	system: function() {
            				return 'new';
            			}
        	}
		});
	};
	$scope.initImport = function() {
		var modalInstance = $uibModal.open({
			size: 'lg',
			backdrop:'static',
			templateUrl: 'scripts/app/editor/import/import-modal.html',
			controller: 'ImportController'
		});

		modalInstance.result.then(function() {
			$location.path('/requirements');
		});
	};

	$scope.restoreSession = function() {
		sharedProperties.setProperty(new String('RESTORE'));
		$scope.initImport();
	};
	
	$scope.deleteLocalStorage = function() {
		if(localStorageService.isSupported) {
			localStorageService.remove(appConfig.localStorageKey);
			$scope.detectedRestore = false;
		}
	};

	 //hotfix for old import feature
	 if($location.url().indexOf('import') >= 0) {
		 $scope.fileParams = $location.url().split('file=')[1];
		 sharedProperties.setProperty(new String($scope.fileParams));
		 $scope.initImport();
	 }
	 if ($location.$$search.file !== undefined) {
		 $scope.fileParams = $location.$$search.file;
		 sharedProperties.setProperty($scope.fileParams);
		 $scope.initImport();
	 } else if ($location.$$search.ticket !== undefined) {
		 $scope.fileParams = $location.$$search.ticket;
		 sharedProperties.setProperty($scope.fileParams);
		 $scope.initImport();
	 }

	 if(localStorageService.isSupported) {
		 if(localStorageService.length() > 0) {
			 $scope.detectedRestore = true;
		 }
	 }
});
