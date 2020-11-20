'use strict';

/* jshint undef: true */
/* globals XRegExp */
/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:StarterCtrl
 * @description
 * # StarterCtrl
 * Controller of the sdlcFrontendApp
 */
angular.module('sdlctoolApp')
	.controller('StarterController', function ($scope, $http, apiFactory, sharedProperties, $location, $uibModalInstance, $state, $filter, system, getRequirementsFromImport) {
		$scope.starterForm = {};
		$scope.failed = '';
		$scope.fail = false;
		$scope.selectedCollection = [];
		$scope.selectedProjectType = [];
		$scope.projectTypeModel = {};
		$scope.ticket = {};
		$scope.oldRequirements = {};
		$scope.oldAlternativeSets = [];
		$scope.oldHasIssueLinks = false;
		$scope.disabled = false;
		$scope.regex = new XRegExp('^[\\p{Latin}\\pN+\\s\\-\\.\\:\\+\\(\\)\\[\\]\\,\\!\\#\\$\\%\\\'\\*\\=\\?\\^\\`\\{\\}\\|\\~\\;\\@\\&]+$');
		getRequirementsFromImport.setProperty({});
		$scope.selectedCollectionSettings = {
			smartButtonMaxItems: 3, styleActive: true,
			closeOnSelect: true, closeOnDeselect: true,
			showCheckAll: false, showUncheckAll: false,
			displayProp: 'name', idProp: 'id', externalIdProp: ''
		};
		$scope.selectedCollectionEvents = {
			onItemSelect: function (item) {
				$scope.selectCollections(item);
			},
			onItemDeselect: function (item) {
				$scope.deselectCollections(item);
			}
		};

		apiFactory.getAll('collections').then(
			function (collections) {
				$scope.categories = collections;
				angular.forEach($scope.categories, function (category) {
					//filters the collectionsInstances by showOrder.
					category.collectionInstances = $filter('orderBy')(category.collectionInstances, 'showOrder');
					angular.extend(category, { selectedCollectionSets: [] });
				});
				$scope.init();
			},
			function () {

			});

		apiFactory.getAll('projectTypes').then(
			function (projectTypes) {
				$scope.projectType = $filter('orderBy')(projectTypes, 'showOrder');
				if (!angular.equals(system, 'old')) {
					$scope.selectProject($scope.projectType[0])
				}
				if ($scope.projectType.length == 1) {
					$scope.disabled = true;
				}
				if ($scope.selectedProjectType.length > 0) {
					$scope.selectOldProjectTypeSettings();
				}
			},
			function () {

			});

		$scope.init = function () {
			//			$scope.projectTypeModel.name = 'Select';
			$scope.oldSettings = sharedProperties.getProperty();
			if ($scope.oldSettings !== undefined && angular.equals(system, 'old')) {
				$scope.disabled = true;
				$scope.starterForm.name = $scope.oldSettings.name;
				$scope.selectedCollection = $scope.oldSettings.colls;
				$scope.selectedProjectType = $scope.oldSettings.project;
				$scope.ticket = $scope.oldSettings.ticket;
				$scope.oldAlternativeSets = $scope.oldSettings.alternativeSets;
				$scope.oldHasIssueLinks = $scope.oldSettings.hasIssueLinks;
				$scope.oldRequirements = $scope.oldSettings.requirements;
				$scope.selectOldCategorySettings();
			}
		};

		$scope.selectOldCategorySettings = function () {
			angular.forEach($scope.selectedCollection, function (collection) {
				$scope.getCategoryObject(collection);
			});

		};

		$scope.selectOldProjectTypeSettings = function () {
			angular.forEach($scope.selectedProjectType, function (oldProjectType) {
				angular.forEach($scope.projectType, function (newProjectType) {
					if (newProjectType.id === oldProjectType.projectTypeId) {
						$scope.projectTypeModel = newProjectType;
					}
				});
			});
		};

		$scope.getCategoryObject = function (collection) {
			angular.forEach($scope.categories, function (category) {
				if (angular.equals(category.name, collection.categoryName)) {
					angular.forEach(category.collectionInstances, function (instance) {
						angular.forEach(collection.values, function (oldValue) {
							if (instance.id === oldValue.collectionInstanceId) {
								category.selectedCollectionSets.push(instance);
							}
						});
					});
				}
			});
		};

		$scope.selectProject = function (item) {
			$scope.projectTypeModel = item;
			var optsColumn = [];
			var statsColumn = [];
			angular.forEach($scope.projectType, function (type) {
				if (item.id === type.id) {
					optsColumn = type.optionColumns;
					statsColumn = type.statusColumns;
				}
			});
			$scope.selectedProjectType = [{
				projectTypeId: item.id,
				name: item.name,
				optsColumn: optsColumn,
				statsColumn: statsColumn
			}];
		};

		$scope.selectCollections = function (item) {
			var categoryName = '';
			angular.forEach($scope.categories, function (category) {
				angular.forEach(category.collectionInstances, function (instance) {
					if (instance.id === item.id) {
						categoryName = category.name;
					}
				});
			});
			//one item of the category is already selected
			if ($scope.searchObjectbyValue(categoryName, $scope.selectedCollection)) {
				angular.forEach($scope.selectedCollection, function (collection) {
					if (categoryName === collection.categoryName) {
						collection.values.push(
							{
								collectionInstanceId: item.id,
								type: item.name
							}
						);
					}
				});
			} else {
				//new one
				var collection = {};
				var values = [];
				values.push(
					{
						collectionInstanceId: item.id,
						type: item.name
					}
				);
				angular.extend(collection,
					{
						categoryName: categoryName,
						values: values
					}
				);
				$scope.selectedCollection.push(collection);
			}
		};

		$scope.deselectCollections = function (item) {
			for (var i = 0; i < $scope.selectedCollection.length; i++) {
				var collection = $scope.selectedCollection[i];
				for (var j = 0; j < collection.values.length; j++) {
					var instance = collection.values[j];
					if (instance.collectionInstanceId === item.id) {
						collection.values.splice(j, 1);
						if (collection.values.length === 0) {
							$scope.selectedCollection.splice(i, 1);
						}
					}
				}
			}
		};

		/* jshint unused: false */
		$scope.searchObjectbyValue = function (search, object) {
			var bool = false;
			angular.forEach(object, function (obj) {
				angular.forEach(obj, function (value, key) {
					if (value === search) {
						bool = true;
					}
				});
			});
			return bool;
		};

		$scope.finish = function () {
			if ($scope.starterForm.name === undefined) {
				$scope.fail = true;
				$scope.failed = 'Please specify the name of the System';
			} else if ($scope.selectedProjectType.length === 0) {
				$scope.fail = true;
				$scope.failed = 'Please select who is developing the System';
			} else {
				$scope.starterForm.colls = $scope.selectedCollection;
				$scope.starterForm.project = $scope.selectedProjectType;
				$scope.starterForm.ticket = $scope.ticket;
				if (angular.equals(system, 'old')) {
					$scope.starterForm.alternativeSets = $scope.oldAlternativeSets;
					$scope.starterForm.hasIssueLinks = $scope.oldHasIssueLinks;
					$scope.starterForm.oldRequirements = $scope.oldRequirements;
				}
				sharedProperties.setProperty($scope.starterForm);
				$scope.cancel();
				if ($location.path() === '/requirements') {
					$state.forceReload();
					$location.path('/requirements');
				} else {
					$location.path('/requirements');
				}
			}

		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('closing');
		};
		$scope.close = function () {
			$uibModalInstance.close();
		};
	});
