'use strict';

/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:StarterCtrl
 * @description
 * # StarterCtrl
 * Controller of the sdlcFrontendApp
 */
angular.module('sdlctoolApp')
  .controller('ImportController', function ($scope, $location, $uibModalStack, sharedProperties, getRequirementsFromImport,
		  					apiFactory, $filter, authenticatorService, $interval, SDLCToolExceptionService, $timeout, appConfig, $q,$uibModal, localStorageService) {
	  $scope.status = {file: false, jira:false};
	  $scope.importObject = {};
	  $scope.uploadFail = false;
	  $scope.failMessage = "";
	  $scope.selectedAlternativeSets = [];
	  $scope.requirements = [];
	  $scope.lastRequirementId = 0;
	  $scope.optionColumns = [];
	  $scope.promise = {};
	  $scope.filterCategory = []
	  $scope.statusColumns = [];
	  $scope.jiraLink = {};
	  $scope.apiUrl = {};
	  $scope.isTicket = false;
	  $scope.name = '';
	  $scope.promise = {};
	  $scope.importProperty = {};
	  $scope.attachmentProperties = {}



	//builds the URL object
	$scope.buildUrlObject = function(list) {
		$scope.apiUrl = {};
		$scope.apiUrl.ticketKey = []
		for(var i = 0; i < list.length; i++) {
			if(angular.equals(list[i], "")) {
				list.splice(i, 1);
			}
			if(list[i].indexOf("https:") > -1) {
				angular.extend($scope.apiUrl, {http: list[i]});
			}
			else if(list[i].indexOf(".") > -1) {
				angular.extend($scope.apiUrl, {host: list[i]});
			} else if(list[i].indexOf("-") > -1) {
				$scope.apiUrl.ticketKey.push(list[i]);
//				angular.extend($scope.apiUrl, {ticketKey: list[i]});
				$scope.isTicket = true;
			}
		}
		//gets the project key.
		if(!angular.equals(list[list.length - 1], "browse") && (list[list.length - 1].indexOf("-") < 0) && angular.isUndefined($scope.apiUrl.projectKey)) {
			angular.extend($scope.apiUrl, {projectKey : list[list.length - 1]});
		}
	}
	  $scope.init = function() {
		  function onSuccess(attachment) {
			  var modalInstance;
			  if(attachment.self !== undefined) {
				  $scope.importProperty.showSpinner = false;
				//cancels the promises if they are defined to prevent use of resources.
				  authenticatorService.cancelPromises($scope.promise);
				  apiFactory.getJIRAInfo(attachment.content).then(function(yamlFile) {
//					  if(modalInstance !== undefined){modalInstance.cancel('');}
					  var blob = new Blob([yamlFile], {type: attachment.mimeType});
					  $scope.readYamlFile(blob);
				  }, function(exception){
				  });
			  } else {
				  SDLCToolExceptionService.showWarning('Import unsuccessful', "Invalid url in query parameter file. Please enter a valid JIRA ticket with an attachment.", SDLCToolExceptionService.DANGER);
			  }
		  }
		  $scope.pattern = new RegExp('(https:\/\/){1}'+ // protocol
			    '(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}'+ // domain name
			    '(\:\d+)?(\/[-a-z\d%_.~+]*)*' // port and path
			    ,'i');
		  var url = sharedProperties.getProperty();
		  angular.extend($scope.attachmentProperties, {attachments: [], hasAttachments: false, selectedAttachment: ""});
		  angular.extend($scope.jiraLink, {url: "", backupUrl: ""});
		  var fileParam = undefined;
		  if(url instanceof String) {
			  fileParam = url;
		  }
		  if(fileParam == "RESTORE") {
			  angular.extend($scope.importProperty, {showSpinner: false});

			  apiFactory.getAll("projectTypes").then(
					  	function(projectTypes) {
					  		$scope.projectTypes = $filter('orderBy')(projectTypes, 'showOrder');
					  		var yamlFile = localStorageService.get(appConfig.localStorageKey);
					  		var blob = new Blob([yamlFile]);
					  		$scope.readYamlFileFromLocalStorage(blob);
					  	},
					   	function(exception) {
		   	   });
		  } else {
			  angular.extend($scope.importProperty, {showSpinner: false});
			  apiFactory.getAll("projectTypes").then(
					  	function(projectTypes) {
						   $scope.projectTypes = $filter('orderBy')(projectTypes, 'showOrder');
						   if (($location.search().file != undefined || fileParam !== undefined) && ($location.search().ticket == undefined)) {
								  var fileUrl;
								  if (fileParam !== undefined) {
									  fileUrl = decodeURIComponent(fileParam.toString());
								  } else {
									  fileUrl = decodeURIComponent($location.search().file);
								  }
								  if($scope.pattern.test(fileUrl)) {
									  
									  apiFactory.getJIRAInfo(fileUrl).then(
											  function(attachment) {
												  onSuccess(attachment);
											  },
											  function(exception) {
												  if(exception.status == 403) {
													  $uibModalStack.dismissAll('close exception modal');
													  var urlSplit = fileUrl.split("/");
													  $scope.buildUrlObject(urlSplit);
													  $scope.promise.derefer = $q.defer();
													  $scope.authenticationrunningModal($scope.promise);
													  var authenticatorProperty = {
															  url : $scope.apiUrl.http + "//" + $scope.apiUrl.host,
															  message : 'Attachment could not be imported because you are not authenticated.' +
															  'Please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
													  }
													  authenticatorService.checkAuthentication(fileUrl, authenticatorProperty, $scope.importProperty, $scope.promise)
													  .then(function(attachment) {
														  onSuccess(attachment);
													  });
												  } else if(exception.status === 404) {
//													  $uibModalStack.dismissAll('cancel');
													  SDLCToolExceptionService.showWarning('Import unsuccessful', "No attachment with this id was found.", SDLCToolExceptionService.DANGER);
												  }
											  });
								  } else {
//									  $uibModalStack.dismissAll('cancel');
									  SDLCToolExceptionService.showWarning('Import unsuccessful', "Invalid url in query parameter file.", SDLCToolExceptionService.DANGER);
								  }
							  } else {
								  if($location.search().ticket !== undefined) {
									  $scope.jiraLink.url = $location.search().ticket;
									  $scope.status.jira = true;
									  $scope.uploadJira();
								  }
								  $scope.status.jira = true;
							  }
					   	},
					   	function(exception) {
					   	});
		  }

	  }
	  // adds the authenticator moddal to the promise
	  $scope.authenticationrunningModal = function(promise) {
		  angular.extend(promise, {runningModalPromise : function() {
			  var modalInstance = $uibModal.open({
					template : '<div class="modal-body"><div id="UsSpinner1" class=" text-center col-sm-1" id="UsSpinner" spinner-on="true" us-spinner=' +
						'"{radius:6, width:4, length:6, lines:9}"></div><br/><h4 class="text-center">Authentication running...</h4></div>',
					controller : function(){},
					size: 'sm',
					backdrop: false
				});
			  return modalInstance;
		  }});
	  }
	// remove space from string
	  $scope.removeSpace = function(str) {
		  var strTemp = str.split(" ");
		  str = "";
		  for(var i = 0; i < strTemp.length; i++) {
			  str += strTemp[i];
		  }
		  return str;
	  }

	  $scope.upload = function() {
		  $scope.uploadFail = false;
		  if ($scope.status.file) {
			  $scope.uploadFile();
		  } else if ($scope.status.jira) {
			  $scope.uploadJira();
		  }
	  }

	  $scope.uploadJira = function() {
		  if ($scope.jiraLink.url == undefined) {
			  $scope.uploadFail = true;
		      $scope.failMessage = "Please specify the Jira URL";
		  } else {
			  if($scope.pattern.test($scope.jiraLink.url.trim())) {
				  var urlSplit = $scope.jiraLink.url.split("/");
				  $scope.buildUrlObject(urlSplit);
				  var apiCall = $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraApiIssueType;
				  $scope.promise.derefer = $q.defer();
				  if($scope.apiUrl.ticketKey.length !== 1) {
					  $scope.uploadFail = true;
					  $scope.failMessage = "You have entered a queue instead of a ticket. Please provide a ticket.";
				  } else {
					  var authenticatorProperty = {
								url: $scope.jiraLink.url,
								message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
						}
					  authenticatorService.checkAuthentication(apiCall, authenticatorProperty, $scope.importProperty, $scope.promise).then(function() {
						  if(!angular.equals($scope.jiraLink.backupUrl, $scope.jiraLink.url)) {
							  $scope.attachmentProperties = {};
							  angular.extend($scope.attachmentProperties, {attachments: [], hasAttachments: false, selectedAttachment: ""});
							  $scope.jiraLink.backupUrl = $scope.jiraLink.url.trim();
						  }
						  $scope.checkTicket();
					  });
				  }
			  }else {
				  $scope.uploadFail = true;
			      $scope.failMessage = "The entered URL is invalid. Please provide a valid URL";
			  }
		  }
	  }

	    //checks if the given ticket exist
		$scope.checkTicket = function() {
			var downloadUrl = "";
			if($scope.attachmentProperties.attachments.length === 0) {
				var urlCall = $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraApiPrefix + "/" + $scope.apiUrl.ticketKey[0];
				apiFactory.getJIRAInfo(urlCall).then(function(response) {
						if(response.fields.attachment.length === 0) {
							SDLCToolExceptionService.showWarning('Import unsuccessful', "There were no attachments found in this ticket.", SDLCToolExceptionService.DANGER);
						} else if(response.fields.attachment.length > 0) {
							$scope.isTicket = true;
	//						$scope.getNewestAttachment(response.fields.attachment);
							$scope.attachmentProperties.attachments = $filter('orderBy')($scope.buildAttachmentsArray(response.fields.attachment), 'showOrder', true);
	//						console.log($scope.attachmentProperties.attachments);
							if($scope.attachmentProperties.attachments.length === 1){
								$scope.getAttachment($scope.attachmentProperties.attachments[0].downloadUrl);
							} else if($scope.attachmentProperties.attachments.length > 1) {
								$scope.attachmentProperties.selectedAttachment = $scope.attachmentProperties.attachments[0].downloadUrl;
								$scope.attachmentProperties.hasAttachments = true;
							} else if($scope.attachmentProperties.attachments.length === 0) {
								SDLCToolExceptionService.showWarning('Import unsuccessful', "There were no valid yaml attachments found in this ticket.", SDLCToolExceptionService.DANGER);
							}
						}
				},
				function(exception) {
					if(exception.status === 404) {
						$scope.uploadFail = true;
					    $scope.failMessage = "The entered ticket is invalid. Please provide a valid ticket";
					}
				});
			} else if($scope.attachmentProperties.attachments.length > 1) {
				$scope.getAttachment($scope.attachmentProperties.selectedAttachment);
			}
		}

		// get the attachment from jira.
		$scope.getAttachment = function(downloadUrl) {
			if (downloadUrl !== "") {
				var fileUrl = decodeURIComponent(downloadUrl);
				  apiFactory.getJIRAInfo(fileUrl).then(function(yamlFile) {
						var blob = new Blob([yamlFile], {type: "application/x-yaml"});
						$scope.readYamlFile(blob);
					}, function(exception){
						if(exception.status === 404) {
							SDLCToolExceptionService.showWarning('Import unsuccessful', "No attachment with this id was found.", SDLCToolExceptionService.DANGER);
						}
					});
			}
		}

		$scope.buildAttachmentsArray = function(attachments) {
			var attachmentArray = [];
			angular.forEach(attachments, function(attachment) {
//				attachment.mimeType === 'application/x-yaml' && 
				if((attachment.size <= 5000000)) {
					var date = $filter('date')((new Date(attachment.created)).getTime(), 'medium');
					var names = attachment.filename.split("_");
					var name = names[(names).indexOf(appConfig.filenamePrefix) + 1];

					attachmentArray.push({
						label: name + " created on: " + date,
						downloadUrl: attachment.content,
						showOrder: (new Date(attachment.created)).getTime()
					})
				}
			})
			return attachmentArray;
		}

	  $scope.uploadFile = function() {
		  $scope.uploadFail = false;
		  var fileTag = document.getElementById("fileUpload");
		  if(fileTag.files.length === 0) {
			  $scope.failMessage = "Please select a File.";
			  $scope.uploadFail = true;
		  } else if(fileTag.files.length > 1) {
			  $scope.failMessage = "You can only upload one File."
				  $scope.uploadFail = true;
		  } else {
			  var yamlFile = fileTag.files[0];
			  $scope.readYamlFile(yamlFile);

		  }
	  }

	  //reads the yaml file and builds the systemsettings and the requirements. Takes a file or a blob.
	  $scope.readYamlFile = function(file) {
		  var yamlData = "";
		  var r = new FileReader();
//		  console.log(file.type);
		  if(file.size > 5000000) {
			  $scope.failMessage = "File limit 5MB exceeded.";
			  $scope.uploadFail = true;
//			  if(status.file && status.jira){SDLCToolExceptionService.showWarning('Import unsuccessful', "File limit was exceeded.", SDLCToolExceptionService.DANGER);}
		  } 
//		  else if(!angular.equals(file.type, "application/x-yaml")){
//			  $scope.failMessage = "Wrong file format. Only  *.yml  are allowed.";
//			  $scope.uploadFail = true;
//			  SDLCToolExceptionService.showWarning('Import unsuccessful', "Wrong file format. Only  *.yml  are allowed.", SDLCToolExceptionService.DANGER);
//		  }
		  else {
				//executes this function once the file is successfully read.
				  r.onload = function(event) {
					  yamlData = event.target.result;
					  try {
						  var doc = jsyaml.safeLoad(yamlData, {filename:file.name});
						  $scope.buildSystemSettings(doc);
						  $scope.buildRequirement(doc.requirementCategories);
					  }catch(e) {
						  SDLCToolExceptionService.showWarning('Import unsuccessful', "Yaml file could not be read please contact the developpers.", SDLCToolExceptionService.DANGER);
					  }
				  }
				  r.readAsText(file);
			  }
	  }

	  //reads the yaml file from the LocalStorage and builds the systemsettings and the requirements. Takes a file or a blob.
	  $scope.readYamlFileFromLocalStorage = function(file) {
		  var yamlData = "";
		  var r = new FileReader();
		  if(file.size > 5000000) {
			  $scope.failMessage = "File limit exceeded.";
			  $scope.uploadFail = true;
//			  if(status.file && status.jira){SDLCToolExceptionService.showWarning('Import unsuccessful', "File limit was exceeded.", SDLCToolExceptionService.DANGER);}
		  } else {
				  //executes this function once the file is successfully read.
				  r.onload = function(event) {
					  yamlData = event.target.result;
					  try {
						  var doc = jsyaml.safeLoad(yamlData, {filename:file.name});
						  $scope.buildSystemSettings(doc);
						  $scope.buildRequirement(doc.requirementCategories);
					  }catch(e) {
						  SDLCToolExceptionService.showWarning('Restore unsuccessful', "Something wrent wrong restoring your session. Please import a valid one from Jira or create a new artifact.", SDLCToolExceptionService.DANGER);
					  }
				  }
				  r.readAsText(file);
			  }
	  }
	  
	  $scope.updateLinkStatus = function(response, jiraStatus, requirement, category, values, statusColumnsValues, linkStatus) {
		  linkStatus = {
					 iconUrl: response.fields.status.iconUrl,
					 name: response.fields.status.name,
					 summary: response.fields.summary,
			 }
			 jiraStatus.allStatus.push(linkStatus);
			  var unique = {};
			  for(var i = 0; i < jiraStatus.allStatus.length; i++) {
				  if (!unique[jiraStatus.allStatus[i].name]) {
				        unique[jiraStatus.allStatus[i].name] = jiraStatus.allStatus[i];
				  } else{
					  jiraStatus.allStatus.splice(i, 1);
				  }
			  };
			 //this is done due to the longer time for the response to come.
			 $scope.requirements.push ({
				 id: requirement.id,
				 category: category.category,
				 categoryId: category.categoryId,
				 shortName: requirement.shortName,
				 universalId: requirement.universalId,
				 ticket: requirement.ticket,
				 description: requirement.description,
				 categoryOrder: category.categoryOrder,
				 order: requirement.showOrder,
				 optionColumns: values,
				 statusColumns: statusColumnsValues,
				 tagInstances: requirement.tagInstances,
				 selected: false,
				 linkStatus: linkStatus,
				 isNew: false,
				 isOld: false,
				 applyUpdate: ' '
			 });
	  }
	  $scope.buildRequirement = function(requirementCategories) {
		  var setIds = [];
		  var jiraStatus = {};
		  var hosts = [];
		  jiraStatus.allStatus = []
		  var hasIssueLinks = false;
		  
		 angular.forEach(requirementCategories, function(category) {
			  var lastElementOrder = 0;
			 angular.forEach(category.requirements, function(requirement) {
				 var values = [];
				 var linkStatus = {};
				 angular.forEach(requirement.optColumns, function(optColumn) {
					 angular.forEach(optColumn.content, function(content) {
						 if(content.setId != undefined) {
							 if($scope.selectedAlternativeSets.indexOf(content.setId) == -1) {
								 $scope.selectedAlternativeSets.push(content.setId);
							 }
						 }
					 });
					values.push({ content:optColumn.content,
						name: optColumn.name,
						showOrder: optColumn.showOrder
					});
				 });
				 var statusColumnsValues = []
				 angular.forEach(requirement.statusColumns, function(statusColumn) {
					 if(statusColumn.isEnum && angular.isDefined(statusColumn.valueId)) {
						 statusColumnsValues.push({
							 id: statusColumn.id,
							 isEnum: statusColumn.isEnum,
							 value: statusColumn.value,
							 valueId: statusColumn.valueId
						 });
					 } else if(statusColumn.isEnum && angular.isUndefined(statusColumn.valueId)) {
						 angular.forEach($scope.statusColumns, function(newStatusColumn) {
							 angular.forEach(newStatusColumn.values, function(value) {
								 if(angular.equals(value.name, statusColumn.value)) {
									 statusColumnsValues.push({
										 id: statusColumn.id,
										 isEnum: statusColumn.isEnum,
										 value: statusColumn.value,
										 valueId: value.id
									 });
								 }
							 });
						 });

					 }else if(!statusColumn.isEnum) {
						 statusColumnsValues.push({
							 id: statusColumn.id,
							 isEnum: statusColumn.isEnum,
							 value: statusColumn.value
						 });
					 }

				 });
				 //get status of the ticket:
				 if(angular.isDefined(requirement.ticket) && !angular.equals(requirement.ticket, '')) {
					 var urlSplit = requirement.ticket.split("/");
					 $scope.buildUrlObject(urlSplit);
					 hasIssueLinks = true;
					 var urlCall = $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraApiPrefix + "/" + $scope.apiUrl.ticketKey[0];
					 var jiraLink = $scope.apiUrl.http + "//" + $scope.apiUrl.host + '/browse/' + $scope.apiUrl.ticketKey[0];
					 apiFactory.getJIRAInfo(urlCall).then(function(response) {
						 $scope.updateLinkStatus(response, jiraStatus, requirement, category, values, statusColumnsValues, linkStatus);
					 }, function(error) {
						 if(error.status === 401) {
							 $scope[$scope.apiUrl.ticketKey[0]] = {};
							 $scope[$scope.apiUrl.ticketKey[0]].derefer = $q.defer();
							 var authenticatorProperty = {
										url: hosts.indexOf($scope.apiUrl.host) === -1 ? jiraLink: "",
										message: 'The status of issue linked in your requirement set could not be determined because you are not authenticated.'+
										'Please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
							}
							 if(hosts.indexOf($scope.apiUrl.host) === -1){
								 hosts.push($scope.apiUrl.host);
								 $scope.authenticationrunningModal($scope[$scope.apiUrl.ticketKey[0]]);
							 }
							 authenticatorService.checkAuthentication(urlCall, authenticatorProperty, $scope.importProperty, $scope[$scope.apiUrl.ticketKey[0]]).then(function(data) {
								 $scope.updateLinkStatus(data, jiraStatus, requirement, category, values, statusColumnsValues);
//								 if($scope.promise.runningModalPromise !== undefined) {$scope.promise.runningModalPromise.close();}
							  }, function(error) {
								  if(error.status === 403) 
									  SDLCToolExceptionService.showWarning('Issue call failed', "You do not have the permission to view the ticket "+ jiraLink, SDLCToolExceptionService.DANGER);
								  else if(error.status === 500)
									  SDLCToolExceptionService.showWarning('Internal Server Error', 'The server encountered an unexpected condition which prevented it from fulfilling the request.', SDLCToolExceptionService.DANGER);
							  });
						 } else if (error.status === 403) {
							 SDLCToolExceptionService.showWarning('Issue call failed', "You do not have the permission to view the ticket "+ jiraLink, SDLCToolExceptionService.DANGER);
						 } else if(error.status === 404) {
							 if(error.errorException.opened.$$state.status === 0) {
								 error.errorException.opened.$$state.value = false;
								 error.errorException.opened.$$state.status = 1;
			                	}
							 SDLCToolExceptionService.showWarning('Issue call failed', "The issue " + jiraLink + " linked to your requirement set does not exist.", SDLCToolExceptionService.DANGER);
						 }
					 });
				 }else {
					 $scope.requirements.push ({
						 id: requirement.id,
						 category: category.category,
						 categoryId: category.categoryId,
						 shortName: requirement.shortName,
						 universalId: requirement.universalId,
						 ticket: requirement.ticket,
						 description: requirement.description,
						 categoryOrder: category.categoryOrder,
						 order: requirement.showOrder,
						 optionColumns: values,
						 statusColumns: statusColumnsValues,
						 tagInstances: requirement.tagInstances,
						 selected: false,
						 linkStatus: linkStatus,
						 isNew: false,
						 isOld: false,
						 applyUpdate: ' '
					 });
				 }
				 if(requirement.showOrder > lastElementOrder) {
					  lastElementOrder = requirement.showOrder;
				  }
				 if(requirement.id > $scope.lastRequirementId) {
					 $scope.lastRequirementId = requirement.id;
				 }
			 });
			 $scope.filterCategory.push(
					  {
						  id: category.categoryId,
						  showOrder: category.categoryOrder,
						  label: category.category,
						  lastElemOrder: lastElementOrder
					  }
			  );
		  });
		  angular.extend($scope.importObject, {
			  requirement: $scope.requirements,
			  filterCategory: $scope.filterCategory,
			  selectedAlternativeSets: $scope.selectedAlternativeSets,
			  lastId: $scope.lastRequirementId,
			  hasIssueLinks: hasIssueLinks,
			  jiraStatus : jiraStatus
			  });
		  getRequirementsFromImport.setProperty($scope.importObject).then(function(data){
			  $scope.close();
		  });
	  }
	  $scope.buildSystemSettings = function(system) {
		  $scope.name = system.name;
		  var projecttypes = [];
		  var collections = [];
		  angular.forEach(system.collections, function(collection) {
			  var collValues = [];
			  angular.forEach(collection.values, function(instance) {
				  collValues.push({
					  type:instance.type,
					  collectionInstanceId: instance.collectionInstanceId
				  });
			  });
			  collections.push({
				  categoryName: collection.categoryName,
				  values: collValues
			  });
		  });
		  // fill the system settings with the project Type and its corresponding optsColumn und statsColumn
		  angular.forEach(system.projectType, function(projectType) {
			  var optsColumn = [];
			  var statsColumn = [];
			 angular.forEach($scope.projectTypes, function(type) {
				 if(projectType.projectTypeId === type.id) {
					 optsColumn = type.optionColumns;
					 statsColumn = type.statusColumns;
					 $scope.statusColumns = type.statusColumns;
				 }
			 });
			 $scope.optionColumns = optsColumn;
			 projecttypes.push({
				 projectTypeId:projectType.projectTypeId,
				 name: projectType.projectTypeName,
				 optsColumn : optsColumn,
				 statsColumn : statsColumn
			 });
		  });
		  var systemSetting = {
				  name: system.name,
				  ticket: system.ticket,
				  generatedOn: system.generatedOn,
				  lastChanged: system.lastChanged,
				  project: projecttypes,
				  colls: collections
		  }
		  sharedProperties.setProperty(systemSetting);
	  }

	  $scope.cancel = function() {
		  $scope.importProperty.showSpinner = false;
		  authenticatorService.cancelPromises($scope.promise);
		  $uibModalStack.dismissAll("cancel");
	  }
	   $scope.close = function() {
		   $location.path('/requirements');
		   SDLCToolExceptionService.showWarning('Import successful', 'The Secure SDLC artifact ' + $scope.name + ' was successfully imported.', SDLCToolExceptionService.SUCCESS);
		   $scope.cancel();
	  }
 });
