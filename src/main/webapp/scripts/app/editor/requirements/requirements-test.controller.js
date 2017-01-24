'use strict'

angular.module('sdlctoolApp')
		.controller('TestRequirements', function(entity, $scope, $uibModalInstance, $filter, appConfig, $window, testAutomation, $q, authenticatorService, $uibModalStack, $timeout) {
	$scope.entity = entity;
	$scope.testObject = {};
	$scope.authentication = {};
	$scope.urlPattern = urlpattern.javascriptStringRegex;
	$scope.displayProperties = {
		show: true,
		showTypes: 'Show selected requirements',
		myglyphicon: "glyphicon glyphicon-plus",
		showCloseButton: true
	}
	$scope.authenticationProperties = {
		spinnerProperty : {
			fail: false,
			showSpinner: false,
			failed: ''
		},
		displayProperty : {
				url: appConfig.securityCAT,
				message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
		},
		checkerUrl : "/api/account",
		authenticatorpromise : {}
	}

	$scope.error = {
		message: "",
		class: ""
	}
	$scope.templates = [
		{name: 'info', url: 'scripts/app/editor/requirements/testRequirementsTemplates/infoTemplate.html'},
		{name: 'loading', url: 'scripts/app/editor/requirements/testRequirementsTemplates/loadingTemplate.html'},
		{name: 'result', url: 'scripts/app/editor/requirements/testRequirementsTemplates/resultTemplate.html'},
		{name: 'error', url: 'scripts/app/editor/requirements/testRequirementsTemplates/errorTemplate.html'}
	]
	$scope.actualTemplate = 'scripts/app/editor/requirements/testRequirementsTemplates/infoTemplate.html';

	$scope.toggleShowHide = function() {
  	$scope.displayProperties.show = !$scope.displayProperties.show;
  	if($scope.displayProperties.show) {
  		$scope.displayProperties.showTypes = 'Show selected requirements';
  		$scope.displayProperties.myglyphicon = "glyphicon glyphicon-plus";
  	} else {
  		$scope.displayProperties.showTypes = 'Hide selected requirements';
  		$scope.displayProperties.myglyphicon = "glyphicon glyphicon-minus";
  	}
  }

	$scope.parseEntity = function() {
		$scope.testObject.reqs = [];
		angular.forEach($scope.entity, function(req) {
			$scope.testObject.reqs.push(req.shortName);
		})
	}

	function configureDisplay(actualTemplateName, showCloseButton, errorAlertType, errorMessage) {
		$scope.displayProperties.showCloseButton = showCloseButton;
		var template = $filter('filter')($scope.templates, {name: actualTemplateName})
		$scope.actualTemplate = template.pop().url;
		$scope.error.class = errorAlertType;
		$scope.error.message = errorMessage;
	}

	function checkState(location) {
		// start the a promise and get the queue Id of the test in case the test is stopped.
		$scope.checkStatePromise = $q.defer();
		$scope.testId = location.split('/').pop();
		testAutomation.checkState(location, $scope.checkStatePromise).then(function(resourceURI) {
			testAutomation.fetchResult(resourceURI).then(function(testResults) {
				$scope.displayProperties.showCloseButton = true;
				$scope.testResults = testResults.requirements;
				angular.forEach($scope.testResults, function(result) {
					var req = $filter('filter')(entity, {shortName: result.shortName}).pop();
					result.description = req.description;
					result.showOrder = req.showOrder;
				})
				configureDisplay('result', true, $scope.error.class, $scope.error.message)
			})
		}, function(response) {
				if(response.status === 400 && response.data.state === "NONEXISTENT"){
					$timeout(function(){$uibModalStack.dismissAll();})
					//configureDisplay('error', true, "alert alert-success", "The test automation was successfully cancelled")
				}
		})
	}

	$scope.startTest = function() {
		$scope.authenticationProperties.authenticatorpromise.derefer = $q.defer();
		testAutomation.checkAuthentication($scope.authenticationProperties.checkerUrl, $scope.authenticationProperties.displayProperty,
					$scope.authenticationProperties.spinnerProperty, $scope.authenticationProperties.authenticatorpromise).then(function(response) {
						configureDisplay('loading', false, $scope.error.class, $scope.error.message)
						$scope.animation = 'slide-animate'

						// start the test automation
						testAutomation.startTest($scope.testObject).then(function(checkURI){
				checkState(checkURI);
			}, function(exception) {
				configureDisplay('error', true, "alert alert-danger", "An error occured when executing the test.")
			})
		},function(exception) { // onRejected checker function
			var errorMessage = "The authentication to the securityCAT tool was unsucessful."
			if(exception === "CORS") {
				errorMessage = "Communication with the SecurrityCAT Server was not possible due to Cross origin policy."
			}
			configureDisplay('error', true, "alert alert-danger", errorMessage)
		})
	}

	$scope.stopTest = function() {
		testAutomation.stopTest($scope.checkStatePromise, $scope.testId).then(function() {
			console.log("stopped")
			configureDisplay('error', true, "alert alert-success", "The test automation was successfully cancelled")
		},function(){})

	}

	$scope.getProgressbarType = function(value) {
		var type = '';
		if (value < 50) {
		 type = 'danger';
	 	} else if (value < 80) {
			type = 'warning';
		} else if (value <= 100) {
			type = 'success';
		}
		return type;
	}
	$scope.clear = function() {
		authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
		$scope.authenticationProperties.spinnerProperty.showSpinner = false;
		$uibModalInstance.dismiss();
	}

});
