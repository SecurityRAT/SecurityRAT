'use strict';

/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:feedbackController
 * @description
 * # feedbackController
 * Controller of the sdlcFrontendApp
 */
angular.module('sdlctoolApp')
  .controller('FeedbackController', function ($scope, apiFactory, sharedProperties, $filter, appConfig, authenticatorService, 
		  $uibModalInstance, $q, SDLCToolExceptionService, Helper, checkAuthentication) {
	  $scope.requirement = {};
	  $scope.requirement = sharedProperties.getProperty();
	  $scope.fields = {};
	  $scope.feedbackProperty = {showSpinner: false};
	  $scope.promise = {};
	  $scope.comment = '';
	  
	  $scope.init = function() {
		//   var derefer = $q.defer();
		  
		  angular.extend($scope.fields, {
			  project: { key: appConfig.reportJIRAQueue }, 
			  summary: appConfig.summaryForSuggestion, 
			  issuetype: { name: appConfig.reportJIRAIssueType }
//			  labels: ["SSDLC_FEEDBACK", $scope.requirement.shortName]
		  });
		  
	  };
	  
	  $scope.cancel = function() {
		  $uibModalInstance.dismiss('cancel');
		  authenticatorService.cancelPromises($scope.promise);
	  };
	  
	  $scope.close = function() {
		  var apiCall = appConfig.reportJIRAHost + appConfig.jiraApiIssueType;
		  var authenticatorProperty = {
				  url: appConfig.reportJIRAHost + '/' + appConfig.jiraBrowseUrlPathName + '/' + appConfig.reportJIRAQueue,
				  message : 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
		  };
		  var url = appConfig.reportJIRAHost + appConfig.jiraApiPrefix;  
		  var fieldObject = 'Short name:\n';
		  fieldObject += $scope.requirement.shortName + '\n\n';
		  fieldObject += 'Requirement description:\n';
		  fieldObject += $scope.requirement.description + '\n';
		  angular.forEach($filter('orderBy')($scope.requirement.optionColumns, 'showOrder'), function(optColumn) {
			  fieldObject += '\n' + optColumn.name + ':\n';
			  angular.forEach(optColumn.content, function(content) {
				  fieldObject += Helper.removeMarkdown(content.content, 'feedback');
				  fieldObject += '\n';
			  }); 
		  });
		  fieldObject += '\nSuggestion\n';
		  fieldObject += $scope.comment;
		  
		  $scope.fields.description = fieldObject;
		  
		  var postData = {
				  fields: $scope.fields
		  };
		  $scope.promise.derefer = $q.defer();
		  checkAuthentication.jiraAuth(apiCall, authenticatorProperty, $scope.feedbackProperty, $scope.promise).then(function() { 
			  apiFactory.postExport(url, postData, {'X-Atlassian-Token': 'no-check', 'Content-Type': 'application/json'}).then(function(response) {
				  $uibModalInstance.close();
				  var ticketUrl = appConfig.reportJIRAHost + '/browse/' + response.key;
				  SDLCToolExceptionService.showWarning('Submit successful', 'Your suggestion was send. You can check your suggestion here:\n ' + ticketUrl, SDLCToolExceptionService.SUCCESS);
			  });
		  });
		  
	  };
  });