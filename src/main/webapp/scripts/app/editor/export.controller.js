angular.module('sdlctoolApp')
	.controller('ExportController', function ($scope, apiFactory, sharedProperties, $uibModalStack, $uibModalInstance, $timeout, 
			appConfig, authenticatorService, $uibModal, $interval, $q, SDLCToolExceptionService, $filter, $confirm, $window) {
		$scope.jiraUrl = {};
		$scope.checks = {};
		$scope.extension = {};
//		$scope.pattern = {}
		$scope.fields = {};
		$scope.apiUrl = {};
		$scope.jiraAlternatives = {};
		$scope.exportProperty = {};
		$scope.jiraStatus = {};
		$scope.promise = {};
		$scope.issueLinkObject = {}
		$scope.selection = {file: false, jira:true, createTickets: false};
		$scope.ticketURL = '';
		$scope.backupUrl = "";
		$scope.label = {};
		$scope.ticketKeys = [];
		
		$scope.init = function() {
			$scope.manFilterObject = {};
			$scope.extension = 'yaml';
			$scope.exported = sharedProperties.getProperty();
			$scope.jiraAlternatives.issueTypes = [];
			$scope.jiraAlternatives.projects = [];
			$scope.jiraAlternatives.mandatoryFields = [];
			$scope.jiraStatus.allStatus = [];
			$scope.ticketURLs = [];
			angular.extend($scope.exportProperty, {fail: false, showSpinner: false, failed: ''});
			angular.extend($scope.checks, {isNotProject: false, issueKey: false, isQueue:false, isTicket:false});
			// only assigns the url when exporting to a jira ticket.
			if ($scope.exported.ticket.url !== undefined && !$scope.selection.createTickets) {
				$scope.jiraUrl.url = $scope.exported.ticket.url;
			}
		}
		//initial method for the create ticket use case.
		$scope.initcreateTicket = function()  {
			$scope.selection.jira = false;
			$scope.selection.createTickets = true;
			
			$scope.init();
		}
		
		$scope.removeLabel = function(label) {
			var index = $scope.fields.labels.indexOf(label); 
			if(index !== -1) {
				$scope.fields.labels.splice(index, 1);
			}
		}
		
		$scope.addLabel = function(labelValue) {
			if(labelValue !== "" && labelValue !== undefined)
				$scope.fields.labels.push($scope.removeSpace(labelValue));
			
			$scope.label.labelValue = "";
		}
		
		// Dirty Dirty Dirty Hack.
		$scope.initLabels = function() {
			$scope.fields.labels = [appConfig.filenamePrefix + "_REQUIREMENT", $scope.removeSpace($scope.exported.name)];
		} 
		// Dirty Dirty Dirty Hack.
		$scope.fillDefaultValues = function() {
			$scope.fields.summary = appConfig.filenamePrefix + " " + $scope.exported.name;
			$scope.fields.description = appConfig.ticketDescription;
		}
		
		$scope.dueDate = {
				opened : false
		};
			
		$scope.calDueDate = function($event) {
			$scope.dueDate.opened = true;
		};
		
		$scope.close = function() {
			// activate the column ticket status of the requirement when tickets were created.
			if($scope.selection.createTickets) {
				$uibModalInstance.close($scope.jiraStatus);
			} else {
				var obj = {ticket : $scope.exported.ticket}
				if(angular.isDefined($scope.checks.hasReqTicket) && !$scope.checks.hasReqTicket)
					obj.hasReqTicket = $scope.checks.hasReqTicket;
				
				$uibModalInstance.close(obj);
			}
		}
		
		$scope.cancel = function() {
			authenticatorService.cancelPromises($scope.promise);
			$scope.exportProperty.showSpinner = false;
			
			$uibModalStack.dismissAll("closing export");
			
		}
		//builds the URL object
		$scope.buildUrlObject = function(list) {
			$scope.apiUrl = {};
			$scope.apiUrl.ticketKey = [];
			var hostSet = false;
			for(var i = 0; i < list.length; i++) {
				if(angular.equals(list[i], "")) {
					list.splice(i, 1);
					i--;
				}
				else if(urlpattern.http.test(list[i])) {
				//else if((list[i].indexOf("https:") > -1) || (list[i].indexOf("http:") > -1)) {
					angular.extend($scope.apiUrl, {http: list[i]});
				}
				else if(urlpattern.host.test(list[i]) && !hostSet) {
				//else if(list[i].indexOf(".") > -1) 
					hostSet = true;
					angular.extend($scope.apiUrl, {host: list[i]});
				} else if(list[i].indexOf("-") > -1) {
					$scope.apiUrl.ticketKey.push(list[i]); 
//					angular.extend($scope.apiUrl, {ticketKey: list[i]});
				} 
			}
			if($scope.apiUrl.ticketKey.length === 1) {
				$scope.checks.isTicket = true;
			}
			//gets the project key.
			if(!angular.equals(list[list.length - 1], "browse") && angular.isUndefined($scope.apiUrl.projectKey)) {
				if(list[list.length - 1].indexOf("-") >= 0) {
					angular.extend($scope.apiUrl, {projectKey : list[list.length - 1].slice(0, list[list.length - 1].indexOf("-"))})
				} else {
					angular.extend($scope.apiUrl, {projectKey : list[list.length - 1]});
				}
			}
		}
		
		//build the url call need according to the distinguisher. 
		$scope.buildUrlCall = function(selector) {
			var baseJiraCall = $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraApiPrefix; 
			if(angular.equals(selector, "ticket")) {
				return  baseJiraCall;
			}else if(angular.equals(selector, "attachment")) {
				return baseJiraCall + "/" + $scope.apiUrl.ticketKey[0] + appConfig.jiraAttachment;
			}else if(angular.equals(selector, "comment")) {
				return baseJiraCall + "/" + $scope.apiUrl.ticketKey[0] + appConfig.jiraComment;
			} else if (angular.equals(selector, "issueType")) {
				return $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraApiIssueType;
			} else if(angular.equals(selector, "project")) {
				return $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraApiProject;
			} else if (angular.equals(selector, "issueKey")) {
				return  baseJiraCall + "/" + $scope.apiUrl.ticketKey[0];
			} else if(angular.equals(selector, "search")) {
				return  $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraRestApi + "/search";
			} else if (angular.equals(selector, "issueLink")) {
				return  $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraRestApi + "/issueLink";
			} else if (angular.equals(selector, "field")) {
				return  $scope.apiUrl.http + "//" + $scope.apiUrl.host + appConfig.jiraRestApi + "/field";
			}
		}
		
		//checks if the queue exist.
		$scope.checkQueue = function(projectKey, excludedFields, fatalFields) {
			var isProject = false;
			apiFactory.getJIRAInfo($scope.buildUrlCall("project")).then(function(response) {
					$scope.jiraAlternatives.projects = response;
					for(var i = 0; i < response.length; i++) {
						if(angular.equals(response[i].key, projectKey)) {
							$scope.manFilterObject.projectKey = projectKey;
							$scope.manFilterObject.issuetypeName = undefined;
							$scope.getMandatoryFields($scope.manFilterObject, excludedFields, fatalFields);
							//gets the issue types.
							$scope.getIssueTypes(projectKey);
							$scope.checks.isQueue = true;
							$scope.checks.isNotProject = false;
							isProject = true;
							$scope.fields.project = {};
							angular.extend($scope.fields.project, {key: projectKey});
							break;
						}
					}
					if(!isProject) {
						$scope.jiraUrl.url = $scope.apiUrl.http + "//" + $scope.apiUrl.host + "/browse";
						$scope.checks.isNotProject = true; 
						$scope.exportProperty.fail = true;
						$scope.exportProperty.failed = "You have entered a wrong queue. Please select a valid queue and click on Export again.";
						$scope.alertType = "danger"
					}
			});
		}
		
		//get the issue type of the given project Key.
		$scope.getIssueTypes = function(projectKey) {
			$scope.jiraAlternatives.issueTypes = [];
			var url = $scope.buildUrlCall("project") + "/" + projectKey;
			apiFactory.getJIRAInfo(url).then(function(projectData) {
				angular.forEach(projectData.issueTypes, function(issueType) {
					if(!issueType.subtask) {
						$scope.jiraAlternatives.issueTypes.push(issueType);
					}
				});
			}, function(){});
		}
		
		// checks if the given ticket exist
		$scope.checkTicket = function() {
			apiFactory.getJIRAInfo($scope.buildUrlCall("issueKey")).then(function(response) {
				$scope.checks.isTicket = true;
				$scope.ticketURL = $scope.apiUrl.http + "//" + $scope.apiUrl.host + "/browse/" + $scope.apiUrl.ticketKey[0];
				if(angular.isDefined($scope.exported.ticket.url)) {
					if(!angular.equals($scope.exported.ticket.url, $scope.ticketURL)) {
						$confirm({text: 'You have already exported this artifact in the ticket ' + $scope.exported.ticket.url + '. Are you sure you want to export into ' + $scope.ticketURL, title:'Confirm'
							, ok: "OK", cancel: "Cancel"}, {templateUrl: 'scripts/app/editor/confirm-modal.html'})
						.then(function() {
							$scope.checkForTicketInReqSet();
//							$scope.sendAttachment();
						})
					} else {
						$scope.sendAttachment();
					}
				} else {
					if (response.fields.attachment.length !== 0) {
						$confirm({text: 'This ticket already contains a Secure SDLC Artifact. Are you sure you want to export another one into ' + $scope.ticketURL + "?", title:'Confirm'
							, ok: "OK", cancel: "Cancel"}, {templateUrl: 'scripts/app/editor/confirm-modal.html'})
						.then(function() {
							$scope.sendAttachment();
						})
					} else {
						$scope.sendAttachment();
					}
				}
			}, function(exception) {
				if(exception.status == 404) {
					$scope.exportProperty.failed = "You have entered an invalid ticket. Please provide a valid one.";
					$scope.alertType = "danger";
					$scope.exportProperty.fail = true;
				}
			});
			
		}
		
		$scope.addIssueLinks = function(inwardKey, outwardKey) {
			var url = $scope.buildUrlCall("issueLink");
				var postData = {
						type: {
							name: "Relates"
						},
						inwardIssue: {
							key: inwardKey
						},
						outwardIssue: {
							key: outwardKey
						}
				};
				apiFactory.postExport(url, postData, {'X-Atlassian-Token': 'nocheck', 'Content-Type': 'application/json'}).then(function() {
					
				}, function(exception) {
					if(exception.status !== 500) {
						if(exception.errorException.opened.$$state.status === 0) {
							exception.errorException.opened.$$state.value = false;
							exception.errorException.opened.$$state.status = 1;
	                	}
						if(parseInt(exception.status) === 404) {
							var project = $scope.jiraUrl.url.split("/").pop();
							$scope.exportProperty.issuelink = "disabled";
							message = "The issues could not be linked. This can occur when the issue linking between " + $scope.exported.ticket.url + " and " +
							$scope.jiraUrl.url.slice(0, $scope.jiraUrl.url.indexOf(project)) + outwardKey + " is disabled.";
							SDLCToolExceptionService.showWarning('Issue link unsuccessful', message, SDLCToolExceptionService.DANGER);
						}
						else if(exception.status === 401) {
							$scope.exportProperty.issuelink = "permission";
							message = "The issues could not be linked. You do not have the permission to link issues.";
							SDLCToolExceptionService.showWarning('Issue link unsuccessful', message, SDLCToolExceptionService.DANGER);
						}
					}
				});
		}
		// get the mandory fields
		$scope.getMandatoryFields = function(filterObject, excludedFields, fatalFields) {
			$scope.jiraAlternatives.mandatoryFields = [];
			if($scope.jiraAlternatives.mandatoryFields.length === 0) {
				var requiredFields = ['summary', 'issuetype', 'project'];
				for(var i = 0; i < requiredFields.length; i++) {
					$scope.jiraAlternatives.mandatoryFields.push({
						key: requiredFields[i],
						name: requiredFields[i],
						type: "",
						itemType: "",
						values : undefined,
						mandatory: true,
						configurable: false,
					});
				}
			}
			// builds the url call.
			var url = $scope.buildUrlCall("ticket") + "/createmeta?projectKeys=" + filterObject.projectKey;
			if(angular.isDefined(filterObject.issuetypeName)) {
				url += "&issuetypeNames=" + filterObject.issuetypeName;
			}
			url += "&expand=projects.issuetypes.fields";
			apiFactory.getJIRAInfo(url).then(function(response) {
				console.log(response.projects[0].issuetypes[0].fields);
				angular.forEach(response.projects, function(project) {
					angular.forEach(project.issuetypes[0].fields, function(value, key) {
							var allowedValues = undefined;
							var itemType = "";
							var  sync = $q.defer();
	//							if(value.required) {
							// !(angular.equals(value.schema.type, "array") && value.operations.length == 1 && value.operations.indexOf("set") !== -1) remove status fields like Inprogress
							// 
									if((fatalFields.indexOf(key) === -1) && (excludedFields.indexOf(key) === -1)
											&& !(angular.equals(value.schema.type, "array") && (value.operations.length == 1) && value.operations.indexOf("set") !== -1)) {
	//									SDLCToolExceptionService.showWarning('Ticket creation failed', 'Cannot create ticket because <strong>' + encodeURIComponent(key) +'</strong> field is required. Please create ticket(s) manually.', SDLCToolExceptionService.DANGER);
	//								} else {
	//										if(angular.equals(value.schema.type, "string") || angular.equals(value.schema.type, "date") || angular.equals(value.schema.type, "timetracking")) {
	//											sync.resolve(true);
	//										}else{
	//											if(angular.isDefined(value.allowedValues)) {
	//												if(value.allowedValues.length > 0) {
	////													if(angular.equals(value.schema.type, "array")) {
	////														// this ensures the post data structure to create a ticket is respected.
	////														$scope.fields[key] = [];
	////													}
	//													values = value.allowedValues;
	//													itemType = value.schema.items;
	//												}
	//											}
	//											
	//										}
											if(angular.isDefined(value.allowedValues)) {
												if(value.allowedValues.length > 0)allowedValues = value.allowedValues;
												else sync.reject(false); // slice out field no values in allowedValues property.
												if(angular.equals(value.schema.type, "array")) {
													$scope.fields[key] = [];
												}
											}
											
											sync.resolve(true);
											//sync makes sure the array is updated when the datas are available.
											sync.promise.then(function() {
												$scope.jiraAlternatives.mandatoryFields.push({
													key: key,
													name: value.name,
													type: value.schema.type,
													itemType: angular.isDefined(value.schema.items) ? value.schema.items: "",
													values : allowedValues,
													configurable : !value.required,
													mandatory : value.required
												});
//											helperService.unique($scope.jiraAlternatives.mandatoryFields, key);
											});
									}
//							}
						});
					console.log($scope.jiraAlternatives.mandatoryFields);
				})
			});
			
		}
		
		// watch the issue type field and gets the mandatory fields depending on he issue type selected.
		$scope.$watch('fields.issuetype.name', function(newVal, oldVal, scope) {
			$scope.manFilterObject.projectKey = $scope.apiUrl.projectKey;
			$scope.manFilterObject.issuetypeName = newVal;
			var excludedFields = ['summary', 'issuetype', 'labels', 'reporter', 'project', 'description'];
			var fatalFields = ['attachment', 'issuelinks'];
			var tempFields = {};
			angular.extend(tempFields, $scope.fields);
			$scope.fields = {};
			angular.extend($scope.fields, {
				description: tempFields.description,
				summary: tempFields.summary,
				project: tempFields.project,
				issuetype: tempFields.issuetype,
				labels: tempFields.labels
			});
			if(angular.isDefined(newVal)) {
				$scope.getMandatoryFields($scope.manFilterObject, excludedFields, fatalFields);
			}
			
		})
		// Determines the height to use for the dropdown list of custom fields
		$scope.getHeight = function() {
//			var height = $(window).height() - ( + $("#dropdown-fields").height());
			var height = $(window).height() - ($("#dropdown-fields").offset().top - $( window).scrollTop()) - $("#dropdown-fields").height();
			$scope.maxHeight = height + "px";
		}
		
		$scope.$watch('fields.project.key', function(newVal, oldVal, scope) {
			if($scope.apiUrl.http !== undefined && newVal !== undefined) {
				$scope.apiUrl.projectkey = newVal;
				$scope.jiraUrl.url = $scope.apiUrl.http + "//" + $scope.apiUrl.host + "/browse/" + newVal;
				$scope.backupUrl = $scope.apiUrl.http + "//" + $scope.apiUrl.host + "/browse/" + newVal;
			}
		})
		// create a new ticket
		$scope.createTicket = function(fieldObject, withAttachment) {
			var derefer = $q.defer();
			var excludedFields = ['summary', 'issuetype', 'labels', 'reporter', 'project', 'description'];
			for(var i = 0; i < $scope.jiraAlternatives.mandatoryFields.length && $scope.jiraAlternatives.mandatoryFields.length > 0; i++) {
				if(!$scope.jiraAlternatives.mandatoryFields[i].mandatory) {
					delete fieldObject[$scope.jiraAlternatives.mandatoryFields[i].key];
				}
			}
			//Set the time time tracking parameter when this field is mandatory.
			if(angular.isDefined(fieldObject.timetracking)) {
				fieldObject.timetracking.remainingEstimate = $scope.fields.timetracking.originalEstimate; 
			}
			
			var postData = {};
			angular.extend(postData, {fields: fieldObject});
			apiFactory.postExport($scope.buildUrlCall("ticket"), postData, {'X-Atlassian-Token': 'nocheck', 'Content-Type': 'application/json'})
			.then(function(response){
				var postUrl = "";
				if(response != undefined) {
					$scope.apiUrl.ticketKey = [];
					$scope.apiUrl.ticketKey.push(response.key);
					derefer.resolve("creation terminated");
					$scope.ticketURL = $scope.apiUrl.http + "//" + $scope.apiUrl.host + "/browse/" + response.key;
					$scope.ticketURLs.push($scope.ticketURL);
					if(withAttachment) {
						$scope.commentForTicketImport();
						$scope.sendAttachment();
					}
				}
			}, function() {});
			
			return derefer.promise;
		}
		
		$scope.commentForTicketImport = function() {
			var appUrl  = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
			var commentBody = 'With the following link you can import your artifact directly into the Secure SDLC Tool and select the newest version.' +
			' You can also use this link to share it with others: ' + appUrl + '/?ticket=' + $scope.ticketURL;
			//get the attachment id and save in the current requirement.
			commentData = {
					"body": commentBody
			}
			//adds comment to ease import
			apiFactory.postExport($scope.buildUrlCall("comment"), commentData, {'X-Atlassian-Token': 'nocheck', 'Content-Type': 'application/json'}).then(function(){
			});
		}
		
		$scope.sendAttachment = function() {
			var file = $scope.buildYAMLFile();
//			console.log(file);
			try {
				for(var i = 0; i < $scope.ticketKeys.length; i++) {
					$scope.addIssueLinks($scope.apiUrl.ticketKey[0], $scope.ticketKeys[i]);
				}
				var doc = jsyaml.safeDump(file);
				var filename = appConfig.filenamePrefix + "_" + $scope.exported.name + "_" + $scope.getCurrentDate() + ".yml";
				var blob = new Blob([doc], {type:'application/x-yaml'})
				var data = new FormData();
				data.append('file', blob, filename);
				apiFactory.postExport($scope.buildUrlCall("attachment"), data, {'X-Atlassian-Token': 'nocheck', 'Content-Type':undefined})
				.then(function(response) {
					var commentBody = appConfig.ticketComment;
					commentBody = commentBody.replace('§artifact_name§', $scope.exported.name);
					commentBody = commentBody.replace('§import_link§', appConfig.importPrefix + encodeURIComponent(response[0].self) + ".\n");
					commentBody = commentBody.replace('§filename§', filename);
					
					//get the attachment id and save in the current requirement.
					$scope.sendComment(commentBody);
				}, function(error) {
					if(error.status === 403) {
						SDLCToolExceptionService.showWarning('Export unsuccessful', 'The YAML file could not be attached. Please check if ticket is not closed and that you have the permission to attach files.', SDLCToolExceptionService.DANGER);
					}
				});
			} catch(e) {
				SDLCToolExceptionService.showWarning('Export unsuccessful', "Yaml file could not be created for export please contact the developpers.", SDLCToolExceptionService.DANGER);
			}
			
		}
		//adds comment to issue with link to attachment.
		$scope.sendComment = function(body) {
			commentData = {
					"body": body
			}
			//adds comment to ease import
			apiFactory.postExport($scope.buildUrlCall("comment"), commentData, {'X-Atlassian-Token': 'nocheck', 'Content-Type': 'application/json'}).then(function(){
				//performs the export successful operation when adding a yaml attachment.
				if($scope.selection.jira) {
					$scope.close();
					SDLCToolExceptionService.showWarning('Export successful', 'The Secure SDLC artifact ' + $scope.exported.name + ' was successfully exported to:\n' + $scope.ticketURL, SDLCToolExceptionService.SUCCESS);
				}
			});
		}
		
		$scope.checkForTicketInReqSet = function() {
			var requirements = [];
			angular.forEach($scope.exported.requirements, function(requirement) {
				if(angular.isDefined(requirement.ticket) && requirement.ticket !== '' 
					&& requirement.ticket !== null) {
					requirements.push(requirement.shortName);
				}
			});
			if(requirements.length > 0) {
				var message = "The Requirements " + requirements.toString();
//				for(var i = 0; i < requirements.length; i++) {
//					message += requirements[i];
//					if(i < requirements.length - 1)
//						message += ', '
//				}
				message += ' have ticket associated to them. Should these tickets URL been taken along and linked to the new ticket or not?';
				$confirm({text: message, title:'Confirm', ok: "Yes", cancel: "No"}, {templateUrl: 'scripts/app/editor/confirm-modal.html'})
				.then(function() {
					angular.extend($scope.checks, { hasReqTicket: true});
					$scope.checks.isTicket ? $scope.sendAttachment() : $scope.createTicket($scope.fields, true).then();
				}, function() {
					angular.extend($scope.checks, { hasReqTicket: false});
					$scope.checks.isTicket ? $scope.sendAttachment() : $scope.createTicket($scope.fields, true).then();
				})
			} else {
				$scope.checks.isTicket ? $scope.sendAttachment() : $scope.createTicket($scope.fields, true).then();
			}
			
		}
		$scope.confirm = function() {
			$scope.exportProperty.fail = false;
			$scope.checks.isTicket = false;
			var fieldNotfulfilled = false;
			//console.log($scope.jiraUrl);
			if (($scope.selection.jira || $scope.selection.createTickets) && ($scope.jiraUrl.url == undefined)) {
				$scope.exportProperty.fail = true;
		    	$scope.exportProperty.failed = "Please specify the Jira URL";
		    	$scope.checks.isQueue = false;
			} else if (($scope.selection.jira || $scope.selection.createTickets) && !re_weburl.test($scope.jiraUrl.url)) {
				$scope.exportProperty.fail = true;
		    	$scope.exportProperty.failed = "Invalid Url. Please specify URL like https://www.example-jira.com/browse/DUMBQ";
		    	$scope.checks.isQueue = false;
			} else if ($scope.selection.jira || $scope.selection.createTickets){
				//export to JIRA
				var authenticatorProperty = {
						url: $scope.jiraUrl.url,
						message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
				}
				var urlSplit = $scope.jiraUrl.url.split("/");
				//console.log($scope.apiUrl);
				$scope.buildUrlObject(urlSplit);
				//console.log($scope.apiUrl);
				$scope.promise.derefer = $q.defer();
				authenticatorService.checkAuthentication($scope.buildUrlCall("issueType"), authenticatorProperty, $scope.exportProperty, $scope.promise).then(function(data) {
					if($scope.checks.isTicket && $scope.selection.jira) {
						$scope.checks.isQueue = false;
						$scope.fields = {};
						$scope.checkTicket();
					} else if($scope.checks.isTicket && $scope.selection.createTickets) {
						$scope.checks.isQueue = false;
						$scope.exportProperty.fail = true;
						$scope.exportProperty.failed = "You have entered a ticket. Please provide a queue.";
						
					} else if($scope.apiUrl.ticketKey.length > 1) {
						$scope.exportProperty.fail = true;
						$scope.alertType = "danger";
						$scope.exportProperty.failed = "You have entered a invalid ticket. Please provide a valid ticket.";
					}else {
//						console.log($scope.fields);
						var excludedFields = ['summary', 'issuetype', 'labels', 'reporter', 'project', 'description'];
						var fatalFields = ['attachment', 'issuelinks'];
						if(angular.isUndefined($scope.fields.summary) || angular.equals($scope.fields.summary, "")) {
							$scope.fields.summary = appConfig.filenamePrefix + " " + $scope.exported.name;
						}
						if(angular.isUndefined($scope.fields.description)) {
							$scope.fields.description = appConfig.ticketDescription;
						}
						//makes sure the other tests are run if the value of the URL is changed by the user. But doesn't executes if the URL was changed by the program.
						if(!angular.equals($scope.jiraUrl.url.trim(), $scope.backupUrl)) {
							$scope.backupUrl = $scope.jiraUrl.url.trim();
							$scope.fields = {};
						}
						//checks for the project key only once. 
						if(angular.isUndefined($scope.fields.project)) {
							$scope.checks.isQueue = false;
							$scope.exportProperty.failed = "A new ticket will be created.";
							$scope.alertType = "warning";
							$scope.checkQueue($scope.apiUrl.projectKey, excludedFields, fatalFields);
						} else {
							$scope.checks.isQueue = true;
							$scope.manFilterObject.projectKey = $scope.fields.project.key;
							$scope.manFilterObject.issuetypeName = undefined;
							// get the mandatory fields of the project selected
							if($scope.checks.isNotProject) {
								$scope.checks.isNotProject = false;
								$scope.getMandatoryFields($scope.manFilterObject, excludedFields, fatalFields);
								$scope.getIssueTypes($scope.fields.project.key);
								fieldNotfulfilled = true;
							} else {
								$scope.checks.isNotProject = false;
								//the following instructions are only run when mandatory fields apart from the excluded and the fatal fields.
								if($scope.jiraAlternatives.mandatoryFields.length == 0) {
									$scope.getMandatoryFields($scope.manFilterObject, excludedFields,fatalFields);
								}
								if($scope.jiraAlternatives.issueTypes.length == 0) {
									$scope.getIssueTypes($scope.fields.project.key);
								}
								//verifies that all mandatory fields have values.
								 for(var i = 0; i < $scope.jiraAlternatives.mandatoryFields.length; i++) {
									 if(!$scope.jiraAlternatives.mandatoryFields[i].mandatory) {
										delete $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key];
									 } else {
										 if(angular.isUndefined($scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key])) {
											fieldNotfulfilled = true;
											SDLCToolExceptionService.showWarning('Ticket creation failed', 'The field <strong>' + $scope.jiraAlternatives.mandatoryFields[i].name + '</strong> has no value. Please fill this out.', SDLCToolExceptionService.DANGER);
											break;
										 } else if(angular.isDefined($scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key]) 
												 && $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key].length <= 0) {
											 fieldNotfulfilled = true;
											 SDLCToolExceptionService.showWarning('Ticket creation failed', 'The field <strong>' + $scope.jiraAlternatives.mandatoryFields[i].name + '</strong> has no value. Please fill this out.', SDLCToolExceptionService.DANGER);
											 break;
										 }
										 console.log($scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key]);
										 // properly sets the data Structure for fields os schema type array in the scope.fields object.
										 if($scope.jiraAlternatives.mandatoryFields[i].type === "array" && !$scope.jiraAlternatives.mandatoryFields[i].values) {
											 var tempValue = $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key].split(',');
											 $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key] = [];
											 if($scope.jiraAlternatives.mandatoryFields[i].itemType === "string")$scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key] = tempValue;
											 else if($scope.jiraAlternatives.mandatoryFields[i].itemType === "user") {
												 for(var i = 0; i < tempValue.length; i++) {
													 $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key].push({
														 name: tempValue[i]
													 });
												 }
											 }
										 }
									 }
								 }
							}
							// create a ticket only when the required fields have been set.
							if(!fieldNotfulfilled) {
								if($scope.selection.jira) {
									$scope.fields.labels = [appConfig.filenamePrefix];
									if(angular.isDefined($scope.exported.ticket.url)) {
										$confirm({text: 'You have already exported this artifact in the ticket ' + $scope.exported.ticket.url + 
											'. Are you sure you want to export into a new ticket in the queue ' + $scope.jiraUrl.url, title:'Confirm'
											, ok: "OK", cancel: "Cancel"}, {templateUrl: 'scripts/app/editor/confirm-modal.html'})
										.then(function(data) {
											$scope.checkForTicketInReqSet();
//											$scope.createTicket($scope.fields, true).then();
										})
									} else if(angular.isUndefined($scope.exported.ticket.url) || angular.equals($scope.exported.ticket.url, "")){
										$scope.createTicket($scope.fields, true).then();
									}
									
								} else if($scope.selection.createTickets) {
									$scope.createReqTickets();
								}
							}
						}
						
					}
				});
			} else if ($scope.selection.file) {
				if ($scope.extension === 'yaml') {
					var file = $scope.buildYAMLFile();
					var mime = "data:application/x-yaml;charset=utf-8,";
					var ext = ".yml";
					var doc = jsyaml.safeDump(file);
					var a = document.createElement('a');
					if(angular.isDefined(a.download)) {
						a.href = mime + encodeURI(doc);
						a.download = appConfig.filenamePrefix + "_" + $scope.exported.name + "_" + $scope.getCurrentDate() + ext;
						a.target = "_blank";
						document.body.appendChild(a);
						$timeout(function() {
							a.click();
							$scope.close();
						});				
					}else {
						$scope.exportProperty.fail = true;
						$scope.exportProperty.failed = "Export not supported by this browser use Firefox or Chrome";
					}
				}
			}
		}
		
		// creates tickets for each selected requirement.
		$scope.createReqTickets = function() {
			var size = ($filter('filter')($scope.exported.requirements, {selected: true})).length;
			 angular.forEach($filter('orderBy')($filter('filter')($scope.exported.requirements, {selected: true}), ['categoryOrder','order']), function(requirement){
				var fieldObject = {}
				angular.extend(fieldObject, $scope.fields);
				var commentBody = "";
				var name = $scope.removeSpace($scope.exported.name);
				//console.log(name);
				fieldObject.description = "";
				fieldObject.summary = "";
				fieldObject.summary +=  requirement.shortName + " " + requirement.description;
				fieldObject.description += "Category:\n";
				fieldObject.description += requirement.category + "\n\n";
				fieldObject.description += "Short name:\n";
				fieldObject.description += requirement.shortName + "\n\n";
				fieldObject.description += "Requirement description:\n";
				fieldObject.description += requirement.description + "\n";
				angular.forEach($filter('orderBy')(requirement.optionColumns, 'showOrder'), function(optColumn) {
					fieldObject.description += "\n" + optColumn.name + ":\n";
					angular.forEach(optColumn.content, function(content) {
						fieldObject.description += $scope.removeMarkdown(content.content);
						fieldObject.description += "\n";
					}); 
				});
				//add comments to the description if these have been proviede.
				angular.forEach(requirement.statusColumns, function(statColumn) {
					angular.forEach($filter('orderBy')($scope.exported.statusColumns, 'showOrder'), function(stat) {
						if(stat.id === statColumn.id) {
							fieldObject.description += "\n" + stat.name +"\n";
							fieldObject.description += statColumn.value;
							fieldObject.description += "\n";
						}
					})
				});
				
				$scope.createTicket(fieldObject, false).then(function() {	
					requirement.ticket = $scope.ticketURL;
					//links the newly created ticket to the common ticket
					$scope.addIssueLinks($scope.exported.ticket.key, $scope.apiUrl.ticketKey[0]);
					// get the status of the newly created tickets and updates the filter.
					apiFactory.getJIRAInfo($scope.buildUrlCall("issueKey")).then(function(response) {
						size--;
						linkStatus = {
								iconUrl: response.fields.status.iconUrl,
								name: response.fields.status.name,
								summary: response.fields.summary,
						}
						angular.extend(requirement, {linkStatus : linkStatus});
						$scope.jiraStatus.allStatus.push(linkStatus);
						
						// shows the successful modal and updates the attachment.
						if(size === 0) {
							var urlSplit = $scope.exported.ticket.url.split("/");
							$scope.buildUrlObject(urlSplit);
							$scope.sendAttachment();
							var tickets = "\n";
							var message = "";
							for(var i = 0; i < $scope.ticketURLs.length; i++) {
								tickets += $scope.ticketURLs[i];
								tickets += "\r\n";
							}
							$scope.close();
							SDLCToolExceptionService.showWarning('Tickets creation successful', 
									'The following tickets were successfully created: ' + tickets, SDLCToolExceptionService.SUCCESS);
						}
					});
					
				});
			});
		}
		
		// remove space from string 
		// this method should be later on defined in a central file		
		$scope.removeSpace = function(str) {
			var strTemp = str.split(" ");
			str = "";
			for(var i = 0; i < strTemp.length; i++) {
				if(i > 0) {
					str += "_";
				}
				str += strTemp[i];
			}
			return str;
		}
		$scope.getTicketValue = function(req) {
			if(angular.isUndefined($scope.checks.hasReqTicket)) {
				return req.ticket;
			} else if(!$scope.checks.hasReqTicket) {
				req.ticket = "";
				return "";
			} else if ($scope.checks.hasReqTicket) {
				if(req.ticket !== '' && req.ticket !== null)
					$scope.ticketKeys.push(req.ticket.split('/').pop());
				return req.ticket;
			}
		}
		// removes markdowns from the given string parameter.
		$scope.removeMarkdown = function(changedContent) {
			changedContent = changedContent.replace(/(\*)/g, "");
			changedContent = changedContent.replace(/(\s+-\s)/g, "\n");
			changedContent = changedContent.replace(/(-\s)/g, "");
			changedContent = changedContent.replace(/(\s+1\.\s)/g, "\n");
			changedContent = changedContent.replace(/(1\.\s)/g, "");
			changedContent = changedContent.replace(/#/g, "");
			changedContent = changedContent.replace(/`/g, "");
			changedContent = changedContent.replace(/([\[]\S+[\]])/g, "");
			changedContent = changedContent.replace(/(mailto:)/g, "");
			changedContent = changedContent.replace(/([\n])+/g, "\n");
			
			return changedContent;
		}
		$scope.buildYAMLFile = function() {
			var yamlExport = {};
			var projectTypeIdValue = 0;
			var projectTypeNameValue = '';
			if (angular.isDefined($scope.exported.ticket.url) && $scope.ticketURL === '') {
				$scope.ticketURL = $scope.exported.ticket.url;
			} else if($scope.selection.jira && $scope.ticketURL !== ''){
				//$scope.exported.ticket is undefined and adding something to .url is not possible, so initialize it empty
				$scope.exported.ticket = {};
				$scope.exported.ticket.url = $scope.ticketURL;
				$scope.exported.ticket.key = $scope.apiUrl.ticketKey[0];
			}
			angular.forEach($scope.exported.projectType, function(projectType) {
				projectTypeIdValue = projectType.projectTypeId;
				projectTypeNameValue = projectType.name;
			});
			if(!$scope.selection.file) {
				angular.extend(yamlExport, {
					ticket: $scope.exported.ticket
				});
			}
			angular.extend(yamlExport, {
				name: $scope.exported.name.replace("#", ""),
				projectType: [{projectTypeId: projectTypeIdValue, projectTypeName: projectTypeNameValue}],
				collections: $scope.exported.collections,
				generatedOn: $scope.exported.generatedOn,
				lastChanged: $scope.exported.lastChanged,
				requirementCategories: []
			});
			angular.forEach($scope.exported.requirements, function(requirement) {
					//check if category is already inside
					if($scope.searchObjectbyValue(requirement.category, yamlExport.requirementCategories)) {
						angular.forEach(yamlExport.requirementCategories, function(requirementCategoryObject) {
							if(requirementCategoryObject.category === requirement.category) {
								requirementCategoryObject.requirements.push(
										{
											id: requirement.id,
											shortName : requirement.shortName,
											showOrder: requirement.order,
											universalId: requirement.universalId,
											description: requirement.description,
											ticket: $scope.getTicketValue(requirement),
											tagInstances: requirement.tagInstances,
											optColumns: requirement.optionColumns,
											statusColumns: requirement.statusColumns
										}
								);
							}
							
						});
							
					} else {
						//new category
						var requirementElement = [];
						requirementElement.push(
								{
									id: requirement.id,
									shortName : requirement.shortName,
									showOrder: requirement.order,
									universalId: requirement.universalId,
									description: requirement.description,
									ticket: $scope.getTicketValue(requirement),
									tagInstances: requirement.tagInstances,
									optColumns: requirement.optionColumns,
									statusColumns: requirement.statusColumns
								}
						);
						yamlExport.requirementCategories.push(
								{
									categoryId: requirement.categoryId,
									category: requirement.category,
									categoryOrder: requirement.categoryOrder,
									requirements: requirementElement
								}
						);
					}	
			});
//			console.log(yamlExport);
			return yamlExport;
		}
		
		$scope.getCurrentDate = function() {
			  var d = new Date();
			  var curr_hour = d.getHours();
			  var curr_min = d.getMinutes();
			  var curr_sec = d.getSeconds();
			  var curr_date = d.getDate();
			  var curr_month = d.getMonth() + 1; //Months are zero based
			  var curr_year = d.getFullYear();
			  //add a zero for hours less than 10.
			  if(curr_hour < 10) {
				  curr_hour = "0" + curr_hour.toString();
			  }
			  if(curr_min < 10) {
				  curr_min = "0" + curr_min.toString();
			  }
			  if(curr_sec < 10) {
				  curr_sec = "0" + curr_sec.toString();
			  }
			  return curr_date + "-" + curr_month + "-" + curr_year + "_" + curr_hour + curr_min + curr_sec;
		  }
		
		$scope.searchObjectbyValue = function(search, object) {
			  var bool = false;
			  angular.forEach(object, function(obj) {
				  angular.forEach(obj, function(value, key) {
					    if(value === search){
					      bool = true;
					    }
				  });
			  });
			  return bool;
		 }
});
