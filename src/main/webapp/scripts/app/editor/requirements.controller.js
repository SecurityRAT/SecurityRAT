'use strict';

/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:RequirementsCtrl
 * @description
 * # RequirementsCtrl
 * Controller of the sdlcFrontendApp
 */
angular.module('sdlctoolApp')
  .controller('RequirementsController',function ($scope, apiFactory, sharedProperties, $httpParamSerializer, $interval, 
		  $timeout, $uibModal, $filter, getRequirementsFromImport, $confirm, $location, localStorageService, appConfig, $sce, SDLCToolExceptionService) {
	  $scope.failed = "";
	  $scope.fail = false;
	  $scope.endProgressbar = true;
	  $scope.barValue = 0;
	  $scope.showRequirements = false;
	  $scope.outputStatus = "";
	  $scope.generatedOn;
	  $scope.lastChanged;
	  $scope.ticket = {};
	  $scope.customRequirements = [];
	  $scope.newRequirementParam = {index:1, id:10000};
	  $scope.optToHide = [];
	  $scope.showSpinner = false;	
	  $scope.systemSettings = sharedProperties.getProperty();
	  $scope.requirements = [];
	  $scope.requirementsSettings = {};
	  $scope.search = '';
	  $scope.tags = [];
	  $scope.filterCategory = [];
	  $scope.selectedCategory = [];
	  $scope.tableArray = []; // excel table array
	  $scope.selectedAlternativeSets = [];
	  $scope.requirementProperties = {requirementsEdited: true, selectedOptColumns: {ids: [], counts: 0}, exported: false, statColumnChanged: false, crCounts : 0};
	  $scope.selectOptCompare = {ids: [], counts: 0};
	  $scope.categoryLabelText = {buttonDefaultText: 'Category'};
	  $scope.tableSpan = {row: 0, col: 0};
	  $scope.updatedReqs = false;
	  $scope.updatesCounter = 0;
	  $scope.updatesAvailable = false;
	  //extra settings for the model for selecting categories
	  $scope.selectedCategorySettings = {
			  smartButtonMaxItems: 3,
			  showCheckAll: false, showUncheckAll: false,
			  displayProp: 'label', idProp: 'label', externalIdProp: 'category'
	  };
	  $scope.selectedStatusSettings = {
			  smartButtonMaxItems: 3,
			  showCheckAll: false, showUncheckAll: false,
			  displayProp: 'name', idProp: 'id', externalIdProp: ''
	  };
	  $scope.selectedJiraStatusSettings = {
			  smartButtonMaxItems: 3,
			  showCheckAll: false, showUncheckAll: false,
			  displayProp: 'name', idProp: 'name', externalIdProp: ''
	  }
	  $scope.filteredRequirementsByTags = [];
	  $scope.selectedTags = [];
	  $scope.alternativeSets = [];
	  $scope.tempString = "";
	  $scope.selectedStatus = [];
	  $scope.jiraStatus = {};
	  $scope.htmlTooltips = {optColumnTooltips: [], statusColumnTooltips: []};
	  $scope.promiseForStorage;
	  $scope.selectedAlternativeSettings = {
			  smartButtonMaxItems: 3,
			  closeOnSelect: true, closeOnDeselect: true,
			  showCheckAll: false, showUncheckAll: false,
			  displayProp: 'name', idProp: 'id', externalIdProp: ''
	  };
	  $scope.selectedAlternativeEvents = { 
			  onItemSelect : function(item) {
				  $scope.selectAlternatives(item); 
			  },
			  onItemDeselect : function(item) {
				  $scope.deselectAlternatives(item); 
			  }
	  };
	  
	  //display a modal if the user hasn't exported the system and wants to close the tab
	  window.onbeforeunload = function(e) {
		  if($scope.requirementProperties.requirementsEdited) {
			  var confirmationMessage = "You have unsaved changes!";
			  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
			  return confirmationMessage;                            //Webkit, Safari, Chrome  
		  }
	  }; 
	  
	  $scope.init = function() {
		  $scope.hasIssueLinks = false;
		  $scope.onRouteChangeOff = $scope.$on('$locationChangeStart', $scope.routeChange);
		  // initialise the jiraStatus object;
		  angular.extend($scope.jiraStatus, {allStatus : [], selectedStatus: [], jiraStatusLabelText: {buttonDefaultText: "Status"}});
		  var imports = getRequirementsFromImport.getProperty();
		  if ($scope.systemSettings !== undefined) {
			  if($scope.systemSettings.ticket !== undefined) {
				  $scope.ticket = $scope.systemSettings.ticket;
			  }
			  $scope.generatedOn = $scope.systemSettings.generatedOn;
			  $scope.lastChanged = $scope.systemSettings.lastChanged;
			  if(imports.requirement !== undefined) {
				  if($location.$$search.file !== undefined || $location.$$search.ticket !== undefined) {
					 $location.search('');
				  }
				  $scope.hasIssueLinks = imports.hasIssueLinks;
				  $scope.requirements = imports.requirement;
				  $scope.requirementProperties.selectedOptColumns.counts  = imports.selectedAlternativeSets.length;
				  $scope.selectOptCompare.counts = imports.selectedAlternativeSets.length;
				  $scope.filterCategory = imports.filterCategory;
				  $scope.filterCategory = $filter('orderBy')($scope.filterCategory, 'showOrder');
				  $scope.selectedAlternativeSets = imports.selectedAlternativeSets;
				  $scope.jiraStatus.allStatus = imports.jiraStatus.allStatus;
//				  $scope.newRequirementParam.id = imports.lastId++; // gets the id of the last Custom requirements save
				  $scope.getAlternativeSets();
				  $scope.getCustomRequirements();
				  $scope.showRequirements = true;
				  $scope.requirementProperties.exported = true;
				  $scope.requirementProperties.requirementsEdited = false;
				  $scope.buildSettings();
				  //do a initial localBackup
				  $scope.onTimeout();
				  $scope.promiseForStorage = $interval($scope.onTimeout, 60000);
				  $scope.updateRequirements();
			  } else {
				  $scope.generatedOn = $scope.getCurrentDate();
				  $scope.startProgressbar();
				  $scope.buildSettings();  
				  $scope.getRequirements();
				  //if($scope.systemSettings.oldRequirements === undefined) {
				  //	  $scope.getAlternativeSets();
				  //} else {
				  $scope.getAlternativeSets();
				  $scope.alternativeSets = $scope.systemSettings.alternativeSets;
				  $scope.hasIssueLinks = $scope.systemSettings.hasIssueLinks;
				  //}			  
			  }
			  $scope.getOptandStatusColumns();
			  $scope.getTagCategories();
		  }
//		  console.log($scope.customRequirements);
//		  console.log($scope.requirements);
	  }
	  
	  $scope.hideColumn = function(id) {
		  var index = $scope.optToHide.indexOf(id);
		  if(index !== -1) {
			  $scope.optToHide.splice(index, 1);
		  } else  {
			  $scope.optToHide.push(id);
		  }
	  }
	  
	  $scope.openFeedback = function(requirement) {
		  //console.log(requirement);
		  sharedProperties.setProperty(requirement);
		  var modalInstance = $uibModal.open({
			  size: 'lg',
			  backdrop: 'static',
	          templateUrl: 'scripts/app/editor/feedback.html',
	          controller: 'FeedbackController'
		  });
		  
		  modalInstance.result.then();
	  }
	  
	  $scope.getCustomRequirements = function() {
		  $scope.customRequirements = [];
		  var cusSmallId = [];
		  angular.forEach($scope.requirements, function(requirement) {
			  if(requirement.shortName.indexOf(appConfig.customRequirement) >= 0) {
				  $scope.requirementProperties.crCounts++;
				  $scope.newRequirementParam.index++;
				  $scope.customRequirements.push(requirement);
				  if(requirement.id >= $scope.newRequirementParam.id) {
					  $scope.newRequirementParam.id = requirement.id;
				  } else {
					  cusSmallId.push(requirement);
				  }
			  }
			  
		  })
		  // gets the custom requirements with id less than $scope.newRequirementParam.id and updates them
		  angular.forEach($filter('orderBy')(cusSmallId, 'id'), function(cusr) {
				  cusr.id = $scope.newRequirementParam.id;
				  $scope.newRequirementParam.id++;
				  
		  })
	  }
	  
	  $scope.changeSettings = function() {
		  var oldSettings = {};
		  angular.extend(oldSettings,
				  {
			  			name : $scope.systemSettings.name,
			  			colls : $scope.systemSettings.colls,
			  			project : $scope.systemSettings.project,
			  			ticket : $scope.systemSettings.ticket,
			  			alternativeSets : $scope.alternativeSets,
			  			hasIssueLinks : $scope.hasIssueLinks,
			  			requirements : $scope.requirements
				  }
		  );
		  sharedProperties.setProperty(oldSettings);
		  var modalInstance = $uibModal.open({
				size: 'lg',
				backdrop: 'static',
	            templateUrl: 'scripts/app/editor/starter.html',
	            controller: 'StarterController',
	            resolve: {
	            	system: function(){
	            		return "old";
	            	}
	            }
			});
	  }

	  $scope.$watch('customRequirements.length', function(newVal, oldVal, scope) {
		  if(newVal != $scope.requirementProperties.crCounts) {
			  $scope.enableSave(false);
		  } else if (newVal == $scope.requirementProperties.crCounts){
			  $scope.disableSave(false);
		  }
	  });
	  
	  
	  $scope.$watch('selectOptCompare.counts', function(newVal, oldVal, scope) {
		  if(newVal != $scope.requirementProperties.selectedOptColumns.counts) {
			  $scope.enableSave(false);
		  } else if (newVal == $scope.requirementProperties.selectedOptColumns.counts){
			  var notFoundId;
			  for(var i = 0; i < $scope.selectOptCompare.ids.length;i++){
				  if($scope.requirementProperties.selectedOptColumns.ids.indexOf($scope.selectOptCompare.ids[i]) === -1){var notFoundId = true;}
			  }
			  if(!notFoundId)$scope.disableSave(false);
			  else $scope.enableSave(false);
		  }
		  //console.log("watch");
		  //console.log($scope.selectOptCompare);
		  //console.log($scope.requirementProperties.selectedOptColumns);
	  });
	  
	  $scope.startProgressbar = function() {
			$scope.endProgressbar = false;
			$scope.showRequirements = false;
			$scope.promise = $interval(function() {$scope.barValue += 1;}, 300, 95);	
		}

	  $scope.finishProgressbar = function(){
			$interval.cancel($scope.promise);
			$scope.barValue = 100;
			$timeout(function(){
				$scope.barValue = 0;
				$scope.endProgressbar = true;
				$scope.showRequirements = true;		
			}, 2500);
		}

	  $scope.getRequirements = function() {
		  var requestString = '';
		  angular.forEach($scope.requirementsSettings, function(value, key) {
				  requestString += key + '=' + value + '&';
		  });
		  //Remove trailing &
		  requestString = requestString.slice(0,-1);
		  apiFactory.getByQuery("categoriesWithRequirements", "filter", requestString).then(
		  	function(categoriesWithRequirements) {
	          $scope.requirementSkeletons = categoriesWithRequirements;
	          $scope.buildRequirements();
		  	},
		  	function(exception) {
		  	});
	  }
	  
	  $scope.getOptandStatusColumns = function() {
		 angular.forEach($scope.systemSettings, function(object) {
			 angular.forEach(object, function(obj) {
				 angular.forEach(obj, function(value, key) {
					 if (key === 'optsColumn') {
						 $scope.optColumns = value;
						 angular.forEach($scope.optColumns, function(column) {
							angular.extend(column, {optColumnLabelText: {buttonDefaultText: column.name}}); 
						 });
					 } else if (key === 'statsColumn') {
						 angular.forEach(value, function (statusColumn) {
							 if(statusColumn.isEnum) {
								 statusColumn.values = $filter('orderBy')(statusColumn.values, 'showOrder');
							 }
						 });
						 $scope.statusColumns = value;
						 angular.forEach($scope.statusColumns, function(status) {
							 var statColumnTooltip = '<p class="myTooltip"><span style="color:yellow;">Possible values:</span><BR>';
							 if(status.isEnum) {
								 angular.forEach(status.values, function(value) {
									 statColumnTooltip += '<span><b style="font-size:13px;color:#cc6600;">' + value.name + ':</b> ' + value.description + '<BR></span>';
								 });
								 statColumnTooltip += '</p>';
								 $scope.htmlTooltips.statusColumnTooltips.push({
									 statId: status.id,
									 tooltip: $sce.trustAsHtml(statColumnTooltip)
								 });
							 }
								angular.extend(status, {statColumnLabelText: {buttonDefaultText: status.name}}); 
						 });
					 }
				 });
			 });
		 }); 
	  }
	  
	  $scope.getTagCategories = function() {
		  apiFactory.getAll("tags").then(
		  function(tags) {
			  $scope.tags = tags;
		  },
		  function(exception) {
		  });
	  }
	  
	  $scope.getAlternativeSets = function() {
		  apiFactory.getAll("optionColumnsWithAlternativeSets").then(
		  function(optionColumnsWithAlternativeSets) {
			  var selectedAltSets = [];
			  $scope.alternativeSets = optionColumnsWithAlternativeSets;
			  angular.forEach($scope.optColumns, function(optColumn) {
				  var optColumnTooltip = '<p class="myTooltip"><span style="color:yellow;">You can add different informations to this column by selecting alternatives with the Dropdown.</span><BR>';
				  
				  angular.forEach($scope.alternativeSets, function(alternativeSet) {
						 if(alternativeSet.id === optColumn.id) {
							 var tempSelectedAltSet = []
							 //we have to add the optColumnId to every alternativeSet as we need it later if the user selected one
							 angular.forEach(alternativeSet.alternativeSets, function(set) {
								 optColumnTooltip += '<span><b style="font-size:13px;color:#cc6600;">' + set.name + ':</b> ' + set.description + '<BR></span>';
								 angular.extend(set, {"optColumnId" : optColumn.id});
								//add the selected list of alternative sets.
								 if($scope.selectedAlternativeSets.length > 0) {
									 for(var i = 0; i < $scope.selectedAlternativeSets.length; i++) {
										 if(set.id == $scope.selectedAlternativeSets[i]){
											 $scope.requirementProperties.selectedOptColumns.ids.push(set.id);
											 $scope.selectOptCompare.ids.push(set.id);
											 //copies the set, changes it and adds it to the select alternatives.
											 var tempSet = (JSON.parse(JSON.stringify(set)));
											 tempSet.import = true;
											 selectedAltSets.push(tempSet);
											 tempSelectedAltSet.push(tempSet);
										 }
									 }
								 }
							 });
							 angular.extend(optColumn, 
									 {"alternativeSets" : alternativeSet.alternativeSets, selectedAlternativeSets : tempSelectedAltSet}
							 );
							 optColumnTooltip += '</p>';
							 $scope.htmlTooltips.optColumnTooltips.push({
								 optId: optColumn.id,
								 tooltip: $sce.trustAsHtml(optColumnTooltip)
							 });
						 }
					  }); 
				  //orders the alternativeSets by showOrder
				  optColumn.alternativeSets = $filter('orderBy')(optColumn.alternativeSets, 'showOrder');
			  });
//			  console.log($scope.optColumns);
			  angular.forEach(selectedAltSets, function(altSet) {
				  $scope.selectAlternatives(altSet);
			  });
		  },
		  function(exception) {
		  });
	  }
	  
	  $scope.selectTags = function(id, name, tagCategory) {
		  //same tagCategory
		  if ($scope.searchArrayByValue(tagCategory, $scope.selectedTags)) {
			  angular.forEach($scope.selectedTags, function(object) {
				 if(object.tagCategory === tagCategory) {
					 //tagInstance is already inside, so this is a deselect. delete the item from the array
					 if($scope.searchObjectbyValue(id, object.tagInstances)) {
						 var idx = object.tagInstances.indexOf(id);
						 object.tagInstances.splice(idx, 1);
						 //tagInstances array is empty so we can delete the whole object
						 if(object.tagInstances.length === 0) {
							 var idx = $scope.selectedTags.indexOf(object);
							 $scope.selectedTags.splice(idx, 1);
						 }
					 } else {
						 //new tagInstance, so add it to the array
						 object.tagInstances.push(id);
						 object.tagName.push(name);
					 }			 
				 }
			  });
		  } else {
			  //new tagCategory and new tagInstance
			  var instances = [];
			  var names = [];
		      names.push(name);
			  instances.push(id);
			  $scope.selectedTags.push(
						 {
							 tagCategory: tagCategory,
							 tagName: names,
							 tagInstances: instances
						 }
				  );
		  }	  
		  
		  //if $scope.selectedTags.length === 0 then this is a whole deselect and we can skip searching for requirements and speed this up
		  if($scope.selectedTags.length !== 0) {
			  $scope.showSpinner = true;
			  var filteredRequirements = [];
			  //get the requirements based on the tags
			  angular.forEach($scope.selectedTags, function(categorySelection) { 
				  angular.forEach($scope.requirements, function(requirement) {
					  angular.forEach(requirement.tagInstances, function(tagInstanceRequirement) {
							angular.forEach(categorySelection.tagInstances, function(tagInstanceSelection) {
								//our tagInstance is in a requirement
								if(tagInstanceSelection === tagInstanceRequirement) {
										//check if this tagCategory is already inside and therefor selected before
										if ($scope.searchArrayByValue(categorySelection.tagCategory, filteredRequirements)) {
											angular.forEach(filteredRequirements, function(object) {
												if(categorySelection.tagCategory === object.tagCategory && (!$scope.searchArrayByValue(requirement.shortName, object.requirement))) {
													object.requirement.push(requirement);
												}
											});
										} else {
											//new category and new requirement
											var reqs = [];
											reqs.push(requirement);
											filteredRequirements.push(
													{
														tagCategory: categorySelection.tagCategory,
														requirement: reqs
													}
											);
										}
								}
							});  
					  });
				  });
			  })
			  //console.log(filteredRequirements);
			  $scope.filteredRequirementsByTags = [];
			  //only one category selected, so we don't need to merge any arrays
			  if (filteredRequirements.length === 1) {
				  angular.forEach(filteredRequirements, function(object) {
					  $scope.filteredRequirementsByTags = object.requirement;
				  });
				  $scope.showSpinner = false;
			  } else {
				  //now merge the filteredRerquirements ANDwise foreach category
				  angular.forEach(filteredRequirements, function(object) {
					 angular.forEach(object.requirement, function(requirement) {
						 //save it and delete it from the array
						 var ret = requirement;
						 var count = 1;
						 var idx = object.requirement.indexOf(requirement);
						 object.requirement.splice(idx, 1);
						 angular.forEach(filteredRequirements, function(searchRequirements) {
							 if($scope.searchArrayByValue(ret, searchRequirements)) {
								 count++;
							 }
						 });
						 if(count  === filteredRequirements.length) {
							 $scope.filteredRequirementsByTags.push(ret);
						 }
					  });
				  });
				  $scope.showSpinner = false;
			  }	
			  $scope.filteredRequirementsByTags = $filter('orderBy')($scope.filteredRequirementsByTags, 'order');
			  //all selections did not match any requirement
			  if($scope.filteredRequirementsByTags.length === 0 && $scope.selectedTags.length !== 0) {
				  $scope.filteredRequirementsByTags = ["ERROR"];
			  } 
			  //console.log($scope.filteredRequirementsByTags);
		  } else {
			  $scope.filteredRequirementsByTags = [];
		  }
		  	
		 
	  }
	  
	  //adds a custom requirement
	  $scope.addRequirement = function() {
		  $scope.crdropdown = false;
		  var crObject = {};
		  angular.extend(crObject, {
			  statusColumns : $scope.statusColumns, 
			  optionColumns: $scope.optColumns,
			  filterCategory: $scope.filterCategory,
			  shortnameIndex: $scope.newRequirementParam.index
		  });
		  sharedProperties.setProperty(crObject);
		  var modalInstance = $uibModal.open({
			  size: 'lg',
			  backdrop: 'static',
	          templateUrl: 'scripts/app/editor/customRequirement.html',
	          controller: 'customRequirementController'
		  });
		  //adds the categoryOrder, id of the item and updates the filterCategory library for the filter nach category.
		  modalInstance.result.then(function(item) {
//			  console.log(item);
			  item.requirement.id = $scope.newRequirementParam.id;
			  //update the order of the last element in the category filter.
			  $scope.newRequirementParam.id++;
			  $scope.filterCategory[item.categoryIndex].lastElemOrder = item.requirement.order;
			  item.requirement.universalId = "";
			  item.requirement.ticket = "";
			  $scope.newRequirementParam.index++;
			  angular.forEach(item.requirement.optionColumns, function(optColumn) {
				  angular.forEach(optColumn.content, function(content) {
					  content.content = content.content;
				  })
			  })
			  $scope.customRequirements.push(item.requirement);
			  $scope.requirements.push(item.requirement);
//			  $scope.exported = false;
		  });
	  }
	  // edit custom requirement.
	  $scope.editRequirement = function() {
		  $scope.crdropdown = false;
		  var crObject = {};
		  angular.extend(crObject, {
			  requirements: $scope.customRequirements,
			  statusColumns : $scope.statusColumns, 
			  optionColumns: $scope.optColumns,
			  filterCategory: $scope.filterCategory,
			  });
		  sharedProperties.setProperty(crObject);
		  var modalInstance = $uibModal.open({
			  size: 'lg',
			  backdrop: 'static',
	          templateUrl: 'scripts/app/editor/customRequirement.html',
	          controller: 'customRequirementController'
		  });
		  //adds the categoryOrder, id of the item and updates the filterCategory library for the filter nach category.
		  modalInstance.result.then(function(item) {
			  angular.forEach($scope.requirements, function(requirement) {
				  if(requirement.id === item.id) {
					  requirement = item;
				  }
			  })
		  });
//		  
	  }
	  //removes a custom requirement
	  $scope.removeRequirement = function() {
		  $scope.crdropdown = false;
		  var modalInstance = $uibModal.open({
			  size: 'lg',
			  backdrop: 'static',
	          templateUrl: 'scripts/app/editor/remove-customRequirement.html',
	          controller: 'removeRequirementController',
	          resolve: {
	        	  customRequirements: function() {
	        		  return $scope.customRequirements;
	        	  }
	          }
		  });
		  
		  modalInstance.result.then(function(itemToRemove) {
			  $scope.deleteObjFromArrayByValue(itemToRemove.shortName, $scope.customRequirements);
			  $scope.deleteObjFromArrayByValue(itemToRemove.shortName, $scope.requirements) 
		  });
	  }
	  // the objectValue must be unique in the array
	  $scope.deleteObjFromArrayByValue = function(objectValue, givenArray) {
		  for(var i = 0; i < givenArray.length; i++) {
			  angular.forEach(givenArray[i], function(value, key) {
				    if(value === objectValue){
				    	givenArray.splice(i, 1);
				    }
			  });
		  };
	  }
	  
	  $scope.selectAlternatives = function(item) {
		  //console.log(item);
		  apiFactory.getByQuery("alternativeInstances", "filter", "alternativeSet=" + item.id).then(
		  function(alternativeInstances) {
			  var alternativeInstance = alternativeInstances;
			  //we need to push the instance also in the alternativeSet structure, as we need them for the deselect later
			  angular.forEach($scope.alternativeSets, function(sets) {
				  angular.forEach(sets.alternativeSets, function(set) {
					 if(item.id === set.id) {
						 angular.extend(set,
								 {
									 alternativeInstances: alternativeInstances
								 }	 
						 );
					 } 
				  });
			  });
			  if(!item.import) {
				  //push the alternativeInstance into the corresponding requirements
				  angular.forEach(alternativeInstance, function(instance) {
					  angular.forEach($scope.requirements, function(requirement) {
						  if(instance.requirementId === requirement.id) {
							  angular.forEach(requirement.optionColumns, function(optColumn) {
								  
								  if(optColumn.showOrder === item.optColumnId) {
									  optColumn.content.push(
											  {
												  id: instance.id,
												  setId : item.id,
												  content: '**' + item.name + '**\n\n' + instance.content,
											  }
									  );
								  }
							  });
						  }
					  });
				  });
				  $scope.selectOptCompare.ids.push(item.id);
				  $scope.selectOptCompare.counts++;
			  }
		  },
		  function(exception) {
		  });
	  }
	  
	  $scope.deselectAlternatives = function(item) {
		  
		  angular.forEach($scope.alternativeSets, function(sets) {
			  angular.forEach(sets.alternativeSets, function(set) {
				  if(item.id === set.id) {
					  angular.forEach($scope.requirements, function(requirement) {
						  angular.forEach(requirement.optionColumns, function(optColumn) {
							  angular.forEach(set.alternativeInstances, function(instance) {
								  angular.forEach(optColumn.content, function(content) {
									  if(instance.id === content.id) {
										  var idx = optColumn.content.indexOf(content);
										  optColumn.content.splice(idx, 1);
									  } 
								  });
								  
							  });
						  });
					  });
				  }
			  });
		  });
		  var idIndex = $scope.selectOptCompare.ids.indexOf(item.id);
		  if(idIndex >= 0){$scope.selectOptCompare.ids.splice(idIndex, 1);}
		  $scope.selectOptCompare.counts--;
//		  console.log("deselect");
//		  console.log($scope.selectOptCompare);
//		  console.log($scope.requirementProperties.selectedOptColumns);
	  }
	  
	  $scope.enableSave = function(withStatColumn) {
		  $scope.requirementProperties.requirementsEdited = true;
		  if(withStatColumn) $scope.requirementProperties.statColumnChanged = true;
	  }
	  
	  $scope.disableSave = function(forceZero) {	  
		  if($scope.requirementProperties.exported && !$scope.requirementProperties.statColumnChanged) {
			  $scope.requirementProperties.requirementsEdited = false;
		  } else if(forceZero) {
			  $scope.requirementProperties.selectedOptColumns = {};
			  $scope.requirementProperties.selectedOptColumns = (JSON.parse(JSON.stringify($scope.selectOptCompare)));
			  $scope.requirementProperties.requirementsEdited = false;
			  $scope.requirementProperties.exported = true;
//			  console.log($scope.selectOptCompare);
//			  console.log($scope.requirementProperties.selectedOptColumns);
		  }
	  }
	  
	  $scope.getStatusValue = function(requirementId, statusColumnId) {
		  var returnValue = "";
		  angular.forEach($scope.requirements, function(requirement) {
				 //found the requirement, so update the statusColumn Value 
				 if(requirementId === requirement.id) {
					 angular.forEach(requirement.statusColumns, function(statusColumn) {
						 if(statusColumnId === statusColumn.id) {
							 returnValue = statusColumn.value;
						 }
					 });
				 } 
		  });  
		  return returnValue;
	  }
	  
	  $scope.selectStatusValue = function(requirementId, statusColumnId, value) {
		  angular.forEach($scope.requirements, function(requirement) {
			 //found the requirement, so update the statusColumn Value 
			 if(requirementId === requirement.id) {
				 angular.forEach(requirement.statusColumns, function(statusColumn) {
					 if(statusColumnId === statusColumn.id) {
						 statusColumn.value = value.name;
						 statusColumn.valueId = value.id;
//						 $scope.exported = false;
					 }
				 });
			 } 
		  });
		  $scope.enableSave(true);
	  }
	  
	  $scope.buildRequirements = function() {
		  angular.forEach($scope.requirementSkeletons, function(requirementCategory) {
			  var lastElementOrder = 0;
			  angular.forEach(requirementCategory.requirements, function(requirement) {
				  var values = [];
				  angular.forEach(requirement.optionColumnContents, function(optColumn) {
					  values.push(  
								{								
									content: [{id: 0, content: optColumn.content}],
									name: optColumn.optionColumnName,
									showOrder: optColumn.optionColumnId
								}
					  ); 
				  });
				  var statusColumnsValues = [];
				  angular.forEach($filter('orderBy')($scope.statusColumns, 'showOrder'), function(statusColumn) {
					 //check if statusColumn isEnum or not
					 if(statusColumn.isEnum) {
						 var showOrder = 1000;
						 var name;
						 var valueId;
						 //initialise with the one also displayed in the UI as first element
						 angular.forEach(statusColumn.values, function(value) {
							 if(value.showOrder < showOrder) {
								 showOrder = value.showOrder;
								 name = value.name;
								 valueId = value.id
							 } 
							 
						 });
						 statusColumnsValues.push(
									{
										id: statusColumn.id,
										value: name,
										valueId: valueId,
										isEnum: statusColumn.isEnum
									}
						  );
					 } else {
						 statusColumnsValues.push(
									{
										id: statusColumn.id,
										value: "",
										isEnum: statusColumn.isEnum
									}
						  );
					 }
					 
				  });
				  $scope.fillEmptyOpts(values, $scope.optColumns);
				  $scope.requirements.push(  
							{								
									id: requirement.id,
									category: requirementCategory.name,
									categoryId: requirementCategory.id,
									shortName: requirement.shortName,
									universalId: requirement.universalId,
									description: requirement.description,
									categoryOrder: requirementCategory.showOrder,
									order: requirement.showOrder,
									tagInstances: requirement.tagInstanceIds,
									optionColumns: values,
									ticket:'',
									statusColumns: statusColumnsValues,
									selected: false
							}
				  );	
				  
				  $scope.filterCategory.push(
						  {
							  id: requirementCategory.id,
							  showOrder: requirementCategory.showOrder,
							  label: requirementCategory.name
						  }
				  );
				  $scope.filterCategory = $scope.unique($scope.filterCategory);
				  if(requirement.showOrder > lastElementOrder) {
					  lastElementOrder = requirement.showOrder;
				  }
			  });	
			  //set a lastElemOrder property. Which is the biggest order of the requirements in this category.
			  if($scope.filterCategory.length > 0) {
				  var lastObject = $scope.filterCategory.pop();
				  lastObject.lastElemOrder = lastElementOrder;
				  $scope.filterCategory.push(lastObject);
			  }
		  }); 
		  
		  $scope.filterCategory = $filter('orderBy')($scope.filterCategory, 'showOrder');
		  
		  if($scope.systemSettings.oldRequirements !== undefined) {
			  //$scope.mergeOldAndNewRequirements();
			  var retOld = $scope.systemSettings.oldRequirements;
			  var retNew = $scope.requirements;
			  $scope.requirements = retOld;
			  $scope.mergeUpdatedRequirements(retNew, true, false);
			  //$scope.mergeOldAndNewRequirements();
			  $scope.finishProgressbar();
		  } else {
			  $scope.finishProgressbar();
		  }
		  //do a initial localBackup
		  $scope.onTimeout();
		  $scope.promiseForStorage = $interval($scope.onTimeout, 60000);
	  }
	  
	  $scope.mergeOldAndNewRequirements = function() {
		  var custReq = [];
		  angular.forEach($scope.systemSettings.oldRequirements, function(oldRequirement) {
			 angular.forEach($scope.requirements, function(newRequirement) {
				 if(oldRequirement.id === newRequirement.id) {
					 newRequirement.optionColumns = oldRequirement.optionColumns;
					 newRequirement.statusColumns = oldRequirement.statusColumns;
					 newRequirement.ticket = oldRequirement.ticket;
				 }
			 });
			 if ((oldRequirement.shortName.indexOf(appConfig.customRequirement) >= 0) && (oldRequirement.id >= 10000)) {
				 custReq.push(oldRequirement);
			 }
			 angular.forEach(oldRequirement.optionColumns, function (optColumn) {
				 angular.forEach(optColumn.content, function(content) {
					 if(content.setId != undefined) {							 
						 if($scope.selectedAlternativeSets.indexOf(content.setId) == -1) {
							 $scope.selectedAlternativeSets.push(content.setId);
						 }
					 }
				 }); 
			 });
		  });
		  //check if a new requirement was added and an alternativeSet is selected. Add the alternativeSet text to the optColumn
		  angular.forEach($scope.requirements, function(newRequirement) {
				 if(!$scope.searchRequirementInArray(newRequirement, $scope.systemSettings.oldRequirements)) {
					 angular.forEach($scope.alternativeSets, function(sets) {
						  angular.forEach(sets.alternativeSets, function(set) {
							  angular.forEach(set.alternativeInstances, function(instance) {
								  if(instance.requirementId === newRequirement.id) {
									  angular.forEach($scope.selectedAlternativeSets, function(selectedAlternative) {
										  if(selectedAlternative === set.id) {
											  angular.forEach(newRequirement.optionColumns, function(optColumn) {			  
												  if(optColumn.showOrder === set.optColumnId) {
													  optColumn.content.push(
															  {
																  id: instance.id,
																  setId : set.id,
																  content: '**' + set.name + '**\n\n' + instance.content,
															  }
													  );
												  }
											  });  
										  }
									  });
								  }
							   });
						    });
					  });
			 	 } 
		  });
		  
		  if(custReq.length != 0 ){
			  angular.forEach(custReq, function(customRequirement) {
				  $scope.requirements.push(customRequirement);
			  });
			  $scope.getCustomRequirements();
		  }
		  $scope.getAlternativeSets();
	  }

	  $scope.unique = function (objectsArray){
		  var newarr = [];
		  var unique = {};
		  angular.forEach(objectsArray, function(item) {
			  if (!unique[item.label]) {
			        newarr.push(item);
			        unique[item.label] = item;
			    }
		  });
		  return newarr;
	 }
	  
	  $scope.searchObjectKey = function(search, object) {
		  var bool = false;
		  angular.forEach(object, function(obj) {
			 if (obj.hasOwnProperty(search)) {	 
				 bool = true;
			 } 
		  });
		  return bool;
	  }
	  
	  $scope.searchArrayByValue = function(search, object) {
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
	  
	  $scope.searchObjectbyValue = function(search, object) {
		  var bool = false;
		  angular.forEach(object, function(value, key) {
			    if(value === search){
			      bool = true;
			    }
		  });
		  return bool;
	  }
	  
	  $scope.searchRequirementInArray = function(requirement, array) {
		  var bool = false;
		  angular.forEach(array, function(req) {
			 if(req.id === requirement.id) {
				 bool = true;
			 } 
		  });
		  return bool;
	  }
	  
	  $scope.fillEmptyOpts = function(searchObj, object) {
		  var id = null;
		  var name = null;
		  angular.forEach(object, function(obj) {
			  angular.forEach(obj, function(value, key) {
				    if (key === 'id') {
				    	id = value;
				    }
				    if (key === 'name') {
				    	if ((!$scope.searchArrayByValue(value, searchObj))) {
					    	searchObj.push({content: [{id: 0, content: " "}], name: value, "showOrder": id}); 
					    }
				    }
			  });
		  });
	  }
	  
	  $scope.buildSettings = function() {
		  var collections = [];
		  var projecttypes = [];
		  angular.forEach($scope.systemSettings.colls, function(collection) {
			  angular.forEach(collection.values, function(value) {
				  collections.push(value.collectionInstanceId);
			  });
		  });
		  
		  angular.forEach($scope.systemSettings.project, function(project) {
			  projecttypes.push(project.projectTypeId);
		  });
		  angular.extend($scope.requirementsSettings,
				  {
			  			collections: collections,
			  			projectTypes: projecttypes
				  }
		  );
	  }
	  $scope.selectAllReqs = function() {
		  angular.forEach($scope.filterRequirements(), function(requirement) {
			  requirement.selected = true;
		  });
	  }
	  $scope.filterRequirements = function() {
		  return $filter('filterByStatus')(
				  $filter('filterByCategories')(
						  $filter('filterByTags')(
								  $filter('filter')($scope.requirements, $scope.search)
								  , $scope.filteredRequirementsByTags)
						  ,$scope.selectedCategory)
				  ,$scope.selectedStatus);
	  }
	  $scope.deselectAllReqs = function() {
		  angular.forEach($scope.filterRequirements(), function(requirement) {
			  requirement.selected = false;
		  });
	  }
	  
	  $scope.updateRequirements = function() {
		  var requestString = '';
		  angular.forEach($scope.requirementsSettings, function(value, key) {
				  requestString += key + '=' + value + '&';
		  });
		  //Remove trailing &
		  requestString = requestString.slice(0,-1);
		  apiFactory.getByQuery("categoriesWithRequirements", "filter", requestString).then(
		  	function(categoriesWithRequirements) {
	          $scope.buildUpdatedRequirements(categoriesWithRequirements);
		  	},
		  	function(exception) {
		  	});
	  }
	  
	  $scope.buildUpdatedRequirements = function(skeletons) {
		  var updatedRequirements = [];
		  angular.forEach(skeletons, function(requirementCategory) {
			  var lastElementOrder = 0;
			  angular.forEach(requirementCategory.requirements, function(requirement) {
				  var values = [];
				  angular.forEach(requirement.optionColumnContents, function(optColumn) {
					  values.push(  
								{								
									content: [{id: 0, content: optColumn.content}],
									name: optColumn.optionColumnName,
									showOrder: optColumn.optionColumnId
								}
					  ); 
				  });
				  var statusColumnsValues = [];
				  angular.forEach($filter('orderBy')($scope.statusColumns, 'showOrder'), function(statusColumn) {
					 //check if statusColumn isEnum or not
					 if(statusColumn.isEnum) {
						 var showOrder = 1000;
						 var name;
						 var valueId;
						 //initialise with the one also displayed in the UI as first element
						 angular.forEach(statusColumn.values, function(value) {
							 if(value.showOrder < showOrder) {
								 showOrder = value.showOrder;
								 name = value.name;
								 valueId = value.id
							 } 
							 
						 });
						 statusColumnsValues.push(
									{
										id: statusColumn.id,
										value: name,
										valueId: valueId,
										isEnum: statusColumn.isEnum
									}
						  );
					 } else {
						 statusColumnsValues.push(
									{
										id: statusColumn.id,
										value: "",
										isEnum: statusColumn.isEnum
									}
						  );
					 }
					 
				  });
				  $scope.fillEmptyOpts(values, $scope.optColumns);
				  updatedRequirements.push(  
							{								
									id: requirement.id,
									category: requirementCategory.name,
									categoryId: requirementCategory.id,
									shortName: requirement.shortName,
									universalId: requirement.universalId,
									description: requirement.description,
									categoryOrder: requirementCategory.showOrder,
									order: requirement.showOrder,
									tagInstances: requirement.tagInstanceIds,
									optionColumns: values,
									ticket:'',
									statusColumns: statusColumnsValues,
									selected: false,
									isNew: false,
									isOld: false,
									applyUpdate: ' '
							}
				  );	

			  });	
			  
		  }); 
		  $scope.mergeUpdatedRequirements(updatedRequirements, false, true);
	  }
	  
	  $scope.mergeUpdatedRequirements = function(updatedRequirements, changedSettings, afterImport) {
		  $scope.updateCounter = 0;
		  $scope.newCounter = 0;
		  $scope.deletedCounter = 0;
		  $scope.newRequirements = [];
		  $scope.oldRequirements = [];
		  angular.forEach(updatedRequirements, function(newRequirement) {
			 var requirementToInsert = {};
			 var foundOne = false; 
			 angular.forEach($scope.requirements, function(oldRequirement) {
				 // search for new changes in description
				 if((newRequirement.description.replace(/[^\x20-\x7E]|\s+/gmi, "") !== oldRequirement.description.replace(/[^\x20-\x7E]|\s+/gmi, "")) && (newRequirement.id === oldRequirement.id)) {
					 requirementToInsert = newRequirement;
					 angular.extend(requirementToInsert, {isNew: true, isOld: false, needsUpdate:true});
					 angular.extend(oldRequirement, {needsUpdate:true});
					 requirementToInsert.statusColumns = oldRequirement.statusColumns;
					 requirementToInsert.ticket = oldRequirement.ticket;
					 requirementToInsert.linkStatus = oldRequirement.linkStatus;
					 $scope.updatesCounter++; 
					 $scope.updateCounter++; 
					 foundOne = true;
					 if(afterImport) {
						$scope.updatesAvailable = true;
						$scope.oldRequirements.push(oldRequirement);
					 } else if (changedSettings) {
						 $scope.updatedReqs = true;
						 oldRequirement.isOld = true;
					 }
				 }
				 //search for new changes in optionColumns
				 if(newRequirement.id === oldRequirement.id) {
					 angular.forEach(newRequirement.optionColumns, function(newRequirementOptColumns) {
								 angular.forEach(oldRequirement.optionColumns, function(oldRequirementOptColumns) {
									 if (newRequirementOptColumns.showOrder === oldRequirementOptColumns.showOrder) {
										 angular.forEach(newRequirementOptColumns.content, function(newRequirementContent) {
											 angular.forEach(oldRequirementOptColumns.content, function(oldRequirementContent) {
												 	//var newRequirementcontentmodified =
												 	if((newRequirementContent.content.replace(/[^\x20-\x7E]|\s+/gmi, "") !== oldRequirementContent.content.replace(/[^\x20-\x7E]|\s+/gmi, "")) && (newRequirementContent.id === oldRequirementContent.id)) {
												 		if (foundOne) {
												 			angular.forEach(requirementToInsert.optionColumns, function(requirementToInsertOptColumn) {
												 				angular.forEach(requirementToInsertOptColumn.content, function(requirementToInsertContent) {
												 					if(requirementToInsertContent.content !== oldRequirementContent.content && requirementToInsertContent.id === oldRequirementContent.id) {
												 						requirementToInsertContent.content = oldRequirementContent.content;
												 					}
												 				});
												 			});
												 		} else {
														    requirementToInsert = newRequirement;
												 			angular.extend(requirementToInsert, {isNew: true, isOld: false, needsUpdate:true});
												 			angular.extend(oldRequirement, {needsUpdate:true});
												 			requirementToInsert.statusColumns = oldRequirement.statusColumns;
												 			requirementToInsert.ticket = oldRequirement.ticket;
												 			requirementToInsert.linkStatus = oldRequirement.linkStatus;
												 			$scope.updatesCounter++; 
												 			$scope.updateCounter++;
														    foundOne = true;
														    if(afterImport) {
																$scope.updatesAvailable = true;
																$scope.oldRequirements.push(oldRequirement);
															 } else if (changedSettings) {
																 $scope.updatedReqs = true;
																 oldRequirement.isOld = true;
															 }
												 		}
												 		//the old requirement has alternative Sets, so we need to push them into the new one
												 		if(oldRequirementOptColumns.content.length > 1) {
												 			angular.forEach(requirementToInsert.optionColumns, function(requirementToInsertOptColumns) {
													 			angular.forEach(oldRequirementOptColumns.content, function(oldRequirementOptColumnsContent) {
													 						 if (oldRequirementOptColumnsContent.id > 0 && (requirementToInsertOptColumns.showOrder == oldRequirementOptColumns.showOrder)) {
													 							requirementToInsertOptColumns.content.push(oldRequirementOptColumnsContent);
													 						 } 
												 			  	  });
												 			  });
												 		}
												 	}
											 }); 
										 });
									 } 
								 });
					 });
				 }
			 }); 
			 if (foundOne && !afterImport) {
				 $scope.requirements.push(requirementToInsert);
			 } else if (foundOne && afterImport){
				 $scope.newRequirements.push(requirementToInsert);
			 }
			 //a new requirement was added
			 if(!$scope.searchRequirementInArray(newRequirement, $scope.requirements)) {
				 //if the user changed the settings we do not need to let him apply the updates for new requirements
				 if (changedSettings) {
					 angular.extend(newRequirement, {isNew: false, isOld: false});
					 $scope.requirements.push(newRequirement);
					 $scope.newCounter++;
				 } else if (afterImport) {
					 angular.extend(newRequirement, {isNew: true, isOld: false, needsUpdate:true});
					 $scope.newRequirements.push(newRequirement);
					 $scope.updatesAvailable = true;
					 $scope.newCounter++;
					 $scope.updatesCounter++;
					 //console.log("a new requirement was added");
				 }
			 }
		  });
		  //check if an old requirement was removed, so we need to reiterate through the new requirements
		  $scope.deletedReqs = [];
		  angular.forEach($scope.requirements, function(oldRequirement) {
			 if(!$scope.searchRequirementInArray(oldRequirement, updatedRequirements) && oldRequirement.id < 10000) {
				 $scope.deletedReqs.push(oldRequirement);
				 if(changedSettings) {
					 var idx = $scope.requirements.indexOf(oldRequirement);
					 $scope.requirements.splice(idx, 1);
				 } else {
					 $scope.updatesAvailable = true;
				 }
				 $scope.deletedCounter++;
			 }
		  });
		  
		  if(changedSettings) {
			  if ($scope.updateCounter === 0 && $scope.newCounter === 0 && $scope.deletedCounter === 0) {
				  var message = "No Updates were found. All your requirements are up to date.";
				  SDLCToolExceptionService.showWarning('Change settings and update requirements successful', message, SDLCToolExceptionService.SUCCESS);
			  } else if ($scope.updateCounter === 0) {
				  var message = "Summary:<ul><li>" + $scope.updateCounter + " requirement(s) were updated</li><li> " + $scope.newCounter + " new requirement(s) were added</li><li>" + $scope.deletedCounter + " requirement(s) were removed</li></ul>";
				  if($scope.deletedReqs.length > 0) {
					  message += "<BR>The following requirement(s) were removed:<BR><BR><table class='table table-responsive'><tr><th>Short Name</th><th>Description</th></tr>";
					  angular.forEach($scope.deletedReqs, function(req) {
						 message += "<tr><td>" +  req.shortName + "</td><td>" + req.description + "</td></tr>";
					  });
					  message += "</table>";
				  }
				  SDLCToolExceptionService.showWarning('Change settings and update requirements successful', message, SDLCToolExceptionService.INFO);
			  } else if ($scope.updateCounter > 0) {
				  var message = "Summary:<ul><li>" + $scope.updateCounter + " requirement(s) were updated</li><li> " + $scope.newCounter + " new requirement(s) were added</li><li>" + $scope.deletedCounter + " requirement(s) were removed</li></ul><BR>You can now review the updates. " +
				  	"The old requirement is marked in <font color='red'>red</font> and the new requirement in <font color='green'>green</font>. Please accept the change by clicking on the <button class='btn btn-success'>" +
					"<span class='glyphicon glyphicon-ok'></span></button> button to keep the new requirement or by clicking on the <button class='btn btn-danger'><span class='glyphicon glyphicon-remove'></span></button> " +
					"to keep the old requirement.";
				  if($scope.deletedReqs.length > 0) {
					  message += "<BR>The following requirement(s) were removed:<BR><BR><table class='table table-responsive'><tr><th>Short Name</th><th>Description</th></tr>";
					  angular.forEach($scope.deletedReqs, function(req) {
						 message += "<tr><td>" +  req.shortName + "</td><td>" + req.description + "</td></tr>";
					  });
					  message += "</table>";
				  }
				  SDLCToolExceptionService.showWarning('Change settings and update requirements successful', message, SDLCToolExceptionService.INFO);
			  } 
		  } 
	  }
	  
	  $scope.updatesAvailableClicked = function() {
		  //add the new requirements to the main array
		  if($scope.newRequirements.length > 0) {
			  angular.forEach($scope.newRequirements, function(newRequirement) {
					 $scope.requirements.push(newRequirement); 
			  });
			  $scope.updatedReqs = true;
		  }
		  
		  if($scope.oldRequirements.length > 0) {
			  angular.forEach($scope.oldRequirements, function(oldRequirement) {
				  	oldRequirement.isOld = true;
			  });
		  }
		  
		  //delete the requirements from the main array
		  if($scope.deletedReqs.length > 0) {
			 angular.forEach($scope.deletedReqs, function(deleteRequirement) {
				   var idx = $scope.requirements.indexOf(deleteRequirement);
			 	   $scope.requirements.splice(idx, 1);
		     });
	      }
		  if ($scope.updatesCounter === 0 && $scope.newCounter === 0 && $scope.deletedCounter === 0) {
			  var message = "No Updates were found. All your requirements are up to date.";
			  SDLCToolExceptionService.showWarning('Update requirements successful', message, SDLCToolExceptionService.SUCCESS);
		  } else if ($scope.updateCounter === 0 && $scope.newCounter === 0) {
			  var message = "Summary:<ul><li>" + $scope.updateCounter + " requirement(s) were updated</li><li> " + $scope.newCounter + " new requirement(s) were added</li><li>" + $scope.deletedCounter + " requirement(s) were removed</li></ul>";
			  if($scope.deletedReqs.length > 0) {
				  message += "<BR>The following requirement(s) were removed:<BR><BR><table class='table table-responsive'><tr><th>Short Name</th><th>Description</th></tr>";
				  angular.forEach($scope.deletedReqs, function(req) {
					 message += "<tr><td>" +  req.shortName + "</td><td>" + req.description + "</td></tr>";
				  });
				  message += "</table>";
			  }
			  SDLCToolExceptionService.showWarning('Update requirements successful', message, SDLCToolExceptionService.INFO);
			  $scope.updatesAvailable = false;
		  } else if ($scope.updateCounter > 0) {
			  var message = "Summary:<ul><li>" + $scope.updatesCounter + " requirement(s) were updated</li><li> " + $scope.newCounter + " new requirement(s) were added</li><li>" + $scope.deletedCounter + " requirement(s) were removed</li></ul><BR>You can now review the updates. " +
			  	"The old requirement is marked in <font color='red'>red</font> and the new requirement in <font color='green'>green</font>. Please accept the change by clicking on the <button class='btn btn-success'>" +
				"<span class='glyphicon glyphicon-ok'></span></button> button to keep the new requirement or by clicking on the <button class='btn btn-danger'><span class='glyphicon glyphicon-remove'></span></button> " +
				"to keep the old requirement.";
			  if($scope.deletedReqs.length > 0) {
				  message += "<BR>The following requirement(s) were removed:<BR><BR><table class='table table-responsive'><tr><th>Short Name</th><th>Description</th></tr>";
				  angular.forEach($scope.deletedReqs, function(req) {
					 message += "<tr><td>" +  req.shortName + "</td><td>" + req.description + "</td></tr>";
				  });
				  message += "</table>";
			  }
			  SDLCToolExceptionService.showWarning('Update requirements successful', message, SDLCToolExceptionService.INFO);
		  } 
	  }
	  
	  $scope.applyChanges = function(reqId, keepNewOne) {
		  var decisionMade = false;
		  angular.forEach($scope.requirements, function(requirement) {
			 //keep new one 
			 if(requirement.id === reqId && keepNewOne && !requirement.isNew) {
				 var idx = $scope.requirements.indexOf(requirement);
				 $scope.requirements.splice(idx, 1);
				 $scope.updatesCounter--;
				 $scope.requirementProperties.requirementsEdited = true;
				 decisionMade = true;
			 //keep old one
			 } else if (requirement.id === reqId && !keepNewOne && requirement.isNew) {
				 var idx = $scope.requirements.indexOf(requirement);
				 $scope.requirements.splice(idx, 1);
				 $scope.updatesCounter--;
				 decisionMade = true;
			 //remove green background from new one
			 } else if ((requirement.id === reqId) && (keepNewOne) && (requirement.isNew)) {
				 requirement.isNew = false;
				 requirement.needsUpdate = false;
				 requirement.applyUpdate = ' ';
				 if(!decisionMade) {
					 $scope.requirementProperties.requirementsEdited = true;
					 $scope.updatesCounter--;
				 }
			 //remove red background from old one
			 } else if (requirement.id === reqId && !keepNewOne && !requirement.isNew) {
				 requirement.isOld = false;
				 requirement.needsUpdate = false;
			 } 
		  });
		  //Dirty hack for the weird case if ticket column is available, the green color is not removed by the code above
		  angular.forEach($scope.requirements, function(requirement) {
			 if ((requirement.isNew) && (requirement.id === reqId)) {
				 requirement.isNew = false;
				 requirement.needsUpdate = false;
				 requirement.applyUpdate = ' ';
				 if(!decisionMade) {
					 $scope.requirementProperties.requirementsEdited = true;
					 $scope.updatesCounter--;
				 }
			 } 
		  });
		  
		  if($scope.updatesCounter === 0) {
			  $scope.updatedReqs = false;
			  $scope.updatesAvailable = false;
		  }
	  }
	  
	  $scope.exportExcel = function() {
		  $scope.withselectedDropdown.isopen = false;
		  var ws_name = $scope.systemSettings.name;
		  var ws_name1 = "dropdown";
		  var dropdownList =  [];
		  var statusCounter = 0;
		  for(var i = 0; i < $scope.statusColumns.length; i++) {
			  if($scope.statusColumns[i].isEnum){
				  dropdownList[statusCounter] = {};
				  dropdownList[statusCounter].values = [];
				  dropdownList[statusCounter].values = $scope.statusColumns[i].values;
				  dropdownList[statusCounter].statusname = $scope.statusColumns[i].name;
				  statusCounter++;
			  }
		  }
		  var colspan = $scope.optColumns.length + $scope.statusColumns.length + 3;
		  var ws = $scope.buildExcelFile(colspan);
		  var wscols = [{wch:20},// width of column category
		                {wch:12},// width of column Short name
		                {wch:45}]// width of column description
//		  var wsrows = [{}]
		  angular.forEach($scope.optColumns, function(optColumn) {
			  wscols.push({wch:50});
		  });
		  angular.forEach($scope.statusColumns, function(statColumn) {
			  wscols.push({wch:10});
		  });
		  var wb = new Workbook();
		  wb.SheetNames.push(ws_name);
		  wb.Sheets[ws_name] = ws;
		  wb.SheetNames.push(ws_name1);
		  wb.Sheets[ws_name1] = $scope.buildDropdownList(dropdownList);
		  //sets the columns width.
		  ws['!cols'] = wscols;
		  var wbopts = { bookType:'xlsx', bookSST:false, type:'binary' };
		  var wbout = XLSX.write(wb,wbopts);
		  saveAs(new Blob([s2ab(wbout)], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet ;charset=utf-8"})
		  , appConfig.filenamePrefix + "_" + $scope.systemSettings.name + "_" + $scope.getCurrentDate() + ".xlsx");
	  }
		function s2ab(s) {
			  var buf = new ArrayBuffer(s.length);
			  var view = new Uint8Array(buf);
			  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
			  return buf;
		}
		// workbook object
		function Workbook(){
			if(!(this instanceof Workbook)) return new Workbook();
			this.SheetNames = [];
			this.Sheets = {};
		}
		//builds the array with the requirement values for the excel export.
		$scope.reproduceTable = function() {
			var titleSelector = ['category', 'shortName', 'description'];
			var requirements = $filter('orderBy')($filter('filter')($scope.requirements, {selected:true}), ['categoryOrder','order']);
			var counter = 0;
			var format = {fontId: 1, xfinnertags :[{ alignment: {horizontal: "center"}, name : 'alignment'}]};
			$scope.tableArray[counter] = [];
			$scope.tableArray[counter] = [ {
				value:$scope.systemSettings.name,
				format: {fontId:2}}, {value:null}, {value:null}, {value:$scope.getCurrentDate(), format: {fontId:2, xfinnertags :[{ alignment: {horizontal: "right"}, name : 'alignment'}]}}];
			counter++;
			$scope.tableArray[counter] = [];
			counter++;
			$scope.tableArray[counter] = [];
			['Category', 'Short name', 'Description'].forEach(function(element) {
				if(angular.equals(element, 'Description')) {
					$scope.tableArray[counter].push( {
						value: element,
						format: {fontId: 1, xfinnertags :[{ alignment: {wrapText: "1"}, name : 'alignment'}]}
					});
				} else {
					$scope.tableArray[counter].push( {
						value: element,
						format: format});
				}
			})
			angular.forEach($filter('orderBy')($scope.optColumns, ['showOrder']), function(optColumn) {
				$scope.tableArray[counter].push( {
					value: optColumn.name,
					format: format
				});
			});
			angular.forEach($filter('orderBy')($scope.statusColumns, ['showOrder']), function(statColumn) {
				if(statColumn.isEnum) {
					$scope.tableArray[counter].push( {
						value: statColumn.name,
						comment: "statusColumn",
						format: format
					});
				} else {
					$scope.tableArray[counter].push( {
						value: statColumn.name,
						format: format
					});
				}
			});
			
			angular.forEach(requirements, function(requirement){
				counter++;
				$scope.tableArray[counter] = [];
				for(var i = 0; i < titleSelector.length; i++) {
					$scope.tableArray[counter].push({
							value: requirement[titleSelector[i]],
							format:{ fontId: 0} 
					});
				}
				angular.forEach(requirement.optionColumns, function(optColumn) {
					var contentValue = "";
					angular.forEach(optColumn.content, function(content) {
						contentValue += content.content;
					})
					$scope.tableArray[counter].push({
							value: $scope.removeMarkdown(contentValue),
							format : {fontId: 0, xfinnertags :[{ alignment: {wrapText: "1"}, name : 'alignment'}]}
					});
				});
				angular.forEach(requirement.statusColumns, function(statColumn) {
					$scope.tableArray[counter].push({
						value: statColumn.value,
//						value: "",
						format: {fontId: 0}
					});
				});
			});
			counter++;
			return counter; 
		}
		$scope.removeMarkdown = function(changedContent) {
			changedContent = changedContent.replace(/(\*)/g, "");
			changedContent = changedContent.replace(/(1\.\s)/g, "- ");
			changedContent = changedContent.replace(/#/g, "");
			changedContent = changedContent.replace(/`/g, "");
			changedContent = changedContent.replace(/(\s{3,})/g, "\n");
			changedContent = changedContent.replace(/([\[]\S+[\]])/g, "");
			changedContent = changedContent.replace(/(mailto:)/g, "");
			
			return changedContent;
		}
		//creates the dropdowm list worksheet.
		$scope.buildDropdownList = function(table) {
			var excelFile = {};
			var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
			for(var R = 0; R < table.length; R++) {
				for(var C = 0; C < table[R].values.length; C++) {
					if(range.s.r > C) range.s.r = C;
					if(range.s.c > R) range.s.c = R;
					if(range.e.r < C) range.e.r = C;
					if(range.e.c < R) range.e.c = R;
					var cell = {};
					if(C === 0) {
						angular.extend(cell, {
							c: "statusColumn " + table[R].statusname, 
						});
					}
					
					//formats the title row.
					angular.extend(cell, {
						v: table[R].values[C].name, 
					});
					if(cell.v == null) continue;
					var cell_ref = XLSX.utils.encode_cell({c:R,r:C});
			
					if(typeof cell.v === 'number') cell.t = 'n';
					else if(typeof cell.v === 'boolean') cell.t = 'b';
					else cell.t = 's';
					
					excelFile[cell_ref] = cell;
				}
			}
			if(range.s.c < 10000000) excelFile['!ref'] = XLSX.utils.encode_range(range);
			return excelFile;
		}
		//creates the requirement worksheet.
		$scope.buildExcelFile = function(colspan) {
			var row = $scope.reproduceTable();
			var excelFile = {};
			var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
			for(var R = 0; R != row; ++R) {
				for(var C = 0; C < colspan; C++) {
					if(range.s.r > R) range.s.r = R;
					if(range.s.c > C) range.s.c = C;
					if(range.e.r < R) range.e.r = R;
					if(range.e.c < C) range.e.c = C;
					var cell = {};
					if(angular.isUndefined($scope.tableArray[R][C])) continue;
					//formats the title row.
					angular.extend(cell, {
						v: $scope.tableArray[R][C].value, 
					});
					if(cell.v == null) continue;
					angular.extend(cell, $scope.tableArray[R][C].format);
					if(angular.isDefined($scope.tableArray[R][C].comment)){
						angular.extend(cell, {
							c: $scope.tableArray[R][C].comment, 
						});
					}
					var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
			
					if(typeof cell.v === 'number') cell.t = 'n';
					else if(typeof cell.v === 'boolean') cell.t = 'b';
					else cell.t = 's';
					
					excelFile[cell_ref] = cell;
				}
			}
			if(range.s.c < 10000000) excelFile['!ref'] = XLSX.utils.encode_range(range);
			return excelFile;
		}
		
	  $scope.createTicketReqs = function() {
		  var exportRequirements = {};
		  $scope.withselectedDropdown.isopen = false;
		  angular.extend(exportRequirements, 
				  {
					  name: $scope.systemSettings.name,
					  ticket: $scope.ticket,
					  projectType: $scope.systemSettings.project,
					  collections: $scope.systemSettings.colls,
					  generatedOn: $scope.generatedOn,
					  lastChanged: $scope.getCurrentDate(),
					  requirements: $scope.requirements,
					  statusColumns: $scope.statusColumns
				  }
		  );
		  sharedProperties.setProperty(exportRequirements);
		  var modalInstance = $uibModal.open({
				size: 'lg',
				backdrop: 'static',
	            templateUrl: 'scripts/app/editor/createTicket.html',
	            controller: 'ExportController' 
		  });
		  modalInstance.result.then(function(jiraStatus) {
			  if($scope.jiraStatus.allStatus.length > 0) {
				  angular.forEach(jiraStatus.allStatus, function(newStatus) {
					  for(var i = 0; i < $scope.jiraStatus.allStatus.length; i++) {
						  var oldStatus = $scope.jiraStatus.allStatus[i];
						  if(angular.equals(oldStatus.name, newStatus.name)) {
							  continue;
						  } else {
							  $scope.jiraStatus.allStatus.push(newStatus);
						  }
					  }
				  })
			  } else {
				  $scope.jiraStatus.allStatus.push(jiraStatus.allStatus[0]);
			  }
			  $scope.disableSave(true)
			  $scope.hasIssueLinks = true;
		  });
	  }
	  $scope.checkExistingTickets = function() {
		  var exist = false;
		  $scope.existingTickets = "";
		  angular.forEach($filter('filter')($scope.requirements, {selected:true}), function(requirement) {
			  if(angular.isDefined(requirement.ticket) && !angular.equals(requirement.ticket, '')) {
				  if(!angular.equals($scope.existingTickets, "")) {
					  $scope.existingTickets += ", ";
				  }
				  $scope.existingTickets += requirement.shortName;
				  exist = true;
			  }
		  });
		  return exist;
	  }

	  $scope.exportSystem = function() {
		  var exportRequirements = {};
		  angular.extend(exportRequirements, 
				  {
					  name: $scope.systemSettings.name,
					  ticket: $scope.ticket,
					  projectType: $scope.systemSettings.project,
					  collections: $scope.systemSettings.colls,
					  generatedOn: $scope.generatedOn,
					  lastChanged: $scope.getCurrentDate(),
					  requirements: $scope.requirements
				  }
		  );
		  sharedProperties.setProperty(exportRequirements);
		  var modalInstance = $uibModal.open({
					size: 'lg',
					backdrop: 'static',
		            templateUrl: 'scripts/app/editor/export.html',
		            controller: 'ExportController' 
		  });
		  modalInstance.result.then(function(obj){
			  if(angular.isDefined(obj.ticket)) {
				  $scope.ticket.url = obj.ticket.url;
				  $scope.ticket.key = obj.ticket.key;
			  }
			  if(angular.isDefined(obj.hasReqTicket) && !obj.hasReqTicket)
				  $scope.hasIssueLinks = false;
			  $scope.disableSave(true);
			  if (localStorageService.isSupported) {
				  localStorageService.remove(appConfig.localStorageKey);
			  }
		  });
	  }
	  
	  $scope.getCurrentDate = function() {
		  var d = new Date();
		  var curr_date = d.getDate();
		  var curr_month = d.getMonth() + 1; //Months are zero based
		  var curr_year = d.getFullYear();
		  if(curr_month < 10) curr_month = "0" + curr_month;
		  if(curr_date < 10) curr_date = "0" + curr_date;
		  return curr_date + "-" + curr_month + "-" + curr_year;
	  }
	  
	  $scope.onTimeout = function() {
		  if (localStorageService.isSupported && $scope.requirementProperties.requirementsEdited) {
			  var exportRequirements = $scope.buildYAMLFile();
			  var doc = jsyaml.safeDump(exportRequirements);
			  localStorageService.set(appConfig.localStorageKey, doc);
		  }
	  }
	  
	  $scope.buildYAMLFile = function() {
			var yamlExport = {};
			var projectTypeIdValue = 0;
			var projectTypeNameValue = '';
			angular.forEach($scope.systemSettings.project, function(projectType) {
				projectTypeIdValue = projectType.projectTypeId;
				projectTypeNameValue = projectType.name;
			});
			angular.extend(yamlExport, {
				name: $scope.systemSettings.name,
				ticket: $scope.ticket,
				projectType: [{projectTypeId: projectTypeIdValue, projectTypeName: projectTypeNameValue}],
				collections: $scope.systemSettings.colls,
				generatedOn: $scope.generatedOn,
				lastChanged: $scope.getCurrentDate(),
				requirementCategories: []
			});
			angular.forEach($scope.requirements, function(requirement) {
					//check if category is already inside
					if($scope.searchArrayByValue(requirement.category, yamlExport.requirementCategories)) {
						angular.forEach(yamlExport.requirementCategories, function(requirementCategoryObject) {
							if(requirementCategoryObject.category === requirement.category) {
								requirementCategoryObject.requirements.push(
										{
											id: requirement.id,
											shortName : requirement.shortName,
											showOrder: requirement.order,
											universalId: requirement.universalId,
											description: requirement.description,
											ticket: requirement.ticket,
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
									ticket: requirement.ticket,
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
			return yamlExport;
		}
	  
	  // setting fixed position for ng-style
	  $scope.setFixedPosition = function() {
		  return {position: "fixed", top: $scope.mouseY+5, left: $scope.mouseX-10};
	  }
	  
	  $scope.pushCoordinates = function(event) {
		  $scope.mouseX = event.clientX;
		  $scope.mouseY = event.clientY;
	  }
	  
	  $scope.routeChange = function(event, newUrl, oldUrl) {
		    //Navigate to newUrl if the form isn't dirty
		    if (!$scope.requirementProperties.requirementsEdited) { 
		    	return;
		    }

		  	$confirm({text: 'You have unsaved data. Are you sure you want to leave the page without saving?', title:'Confirm'
				, ok: "Ignore Changes", cancel: "Cancel"}, {templateUrl: 'scripts/app/editor/confirm-modal.html'})
			.then(function(result) {
				 $scope.onRouteChangeOff = '';
				 $scope.requirementProperties.requirementsEdited = false;
				 window.onbeforeunload = function(e) {}
				 window.location.href = $location.url(newUrl).hash();	
			})

		    //prevent navigation by default since we'll handle it
		    //once the user selects a dialog option
		    event.preventDefault();
		    return;
	  }
	  
	  $scope.$on('$destroy', function () { 
		  $interval.cancel($scope.promiseForStorage);
		  $scope.requirementProperties.requirementsEdited = false;
		  $scope.onRouteChangeOff = '';
	  }); 
  });
