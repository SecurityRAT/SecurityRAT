'use strict';

/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:StarterCtrl
 * @description
 * # StarterCtrl
 * Controller of the sdlcFrontendApp
 */
/* jshint undef: true */
/* globals _ */
angular.module('sdlctoolApp')
    .controller('customRequirementController', function ($scope, $location, $uibModalInstance, crObject, $filter, appConfig) {
		$scope.crObject = crObject;
        $scope.requirement = {};
        $scope.categories = $filter('orderBy')($scope.crObject.filterCategory, 'showOrder');
        $scope.requirement.optionColumns = [];
        $scope.requirement.tagInstances = [];
        $scope.statValue = {};
        $scope.status = {
            add: false,
            edit: false
		};
		
        $scope.setOptionColumns = function () {
            angular.forEach($scope.crObject.optionColumns, function (optColumn) {
                $scope.value = {
                    content: [{
                        id: 0,
                        content: ''
                    }],
                    name: optColumn.name,
                    showOrder: optColumn.id
                };
                $scope.requirement.optionColumns.push($scope.value);
            });
        };

        $scope.setShortName = function () {
            if ($scope.crObject.shortnameIndex >= 0 && $scope.crObject.shortnameIndex < 10) {
                $scope.requirement.shortName = appConfig.customRequirement + '0' + $scope.crObject.shortnameIndex.toString();
            } else if ($scope.crObject.shortnameIndex >= 10 && $scope.crObject.shortnameIndex < 100) {
                $scope.requirement.shortName = appConfig.customRequirement + $scope.crObject.shortnameIndex.toString();
            }
        };

        $scope.setStatusColumn = function () {
            var statusColumnsValues = [];
            angular.forEach($scope.crObject.statusColumns, function (statusColumn) {

                if (statusColumn.isEnum) {
                    var showOrder = 1000;
                    var name;
                    var valueId;
                    //initialise with the one also displayed in the UI as first element
                    angular.forEach(statusColumn.values, function (value) {
                        if (value.showOrder < showOrder) {
                            showOrder = value.showOrder;
                            name = value.name;
                            valueId = value.id;
                            $scope.statValue.value = value;
                        }

                    });
                    statusColumnsValues.push({
                        id: statusColumn.id,
                        value: name,
                        isEnum: statusColumn.isEnum,
                        valueId: valueId
                    });
                } else {
                    statusColumnsValues.push({
                        id: statusColumn.id,
                        value: '',
                        isEnum: statusColumn.isEnum
                    });
                }
            });
            $scope.requirement.statusColumns = statusColumnsValues;
        };

        $scope.init = function () {
            if (angular.isUndefined($scope.crObject.requirements)) {
                $scope.setStatusColumn();
                $scope.setOptionColumns();
                $scope.setShortName();
                $scope.requirement.categoryId = $scope.categories[0].id;
                $scope.status.add = true;
            } else {
                $scope.status.edit = true;
                $scope.requirement = {};
                $scope.req = {};
                angular.extend($scope.requirement, $scope.crObject.requirements[0]);
				angular.extend($scope.req, $scope.crObject.requirements[0]);
                $scope.getStatusColumn();
            }
        };

        $scope.getStatusColumn = function () {
            angular.forEach($scope.requirement.statusColumns, function (statColumn) {
                if (statColumn.isEnum) {
                    angular.forEach($scope.crObject.statusColumns, function (newStatColumn) {
                        if (newStatColumn.isEnum && statColumn.id === newStatColumn.id) {
                            angular.forEach(newStatColumn.values, function (value) {
                                if (statColumn.valueId === value.id) {
                                    $scope.statValue.value = value;
                                }
                            });
                        }
                    });
                }
            });
        };
        $scope.selectRequirement = function (id) {
            angular.forEach($scope.crObject.requirements, function (req) {
				
                if (req.id === id) {
                    angular.extend($scope.requirement, req);
                    $scope.getStatusColumn();
                }
            });
        };

        $scope.selectStatusValue = function (statusColumnId, value) {
            angular.forEach($scope.requirement.statusColumns, function (statusColumn) {
                if (statusColumn.id === statusColumnId) {
                    statusColumn.value = value.name;
                    statusColumn.valueId = value.id;
                }
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.updateOptColumns = function () {
            angular.forEach($scope.requirement.optionColumns, function (optColumn) {
                angular.forEach(optColumn.content, function (content) {
                    if (content.content.indexOf('>') !== -1 || content.content.indexOf('<') !== -1) {
						content.content = _.escape(content.content);
					}
                });
            });
        };

        $scope.close = function () {
            var item = {};
            var index = -1;
            var categoryIndex = 0;
            console.log($scope.requirement);
            angular.forEach($scope.categories, function (category) {
                index++;
                if (category.id === $scope.requirement.categoryId) {
                    $scope.requirement.categoryOrder = category.showOrder;
                    $scope.requirement.category = category.label;
                    $scope.requirement.order = category.lastElemOrder + 10;
                    categoryIndex = index;
                }
            });
            item = {
                requirement: $scope.requirement,
                categoryIndex: categoryIndex
            };
            $uibModalInstance.close(item);
        };
    });
