'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingRequirementsController', function ($scope, $rootScope, $stateParams, $filter, $http, entity, Training,
                                                            TrainingTreeNode, apiFactory ) {
        $scope.training = entity;
        var backUpValues = {
            selectedColls: [],
            selectedTypes: [],
            allRequirementsSelected: true
        };
        if ($scope.training.$promise != null) {
            $scope.training.$promise.then(function () {
                if ($scope.training.allRequirementsSelected) {
                    $("#filterBlock").hide();
                } else {
                    $("#filterBlock").show();
                }

                // restore selection from training
                $scope.training.collections.forEach(function(col) {
                    $scope.selectCollections(col, false);
                });
                $scope.training.projectTypes.forEach(function (prot) {
                    $scope.selectedProjectType.push(prot);
                });
                angular.copy($scope.training.collections, backUpValues.selectedColls);
                angular.copy($scope.training.projectTypes, backUpValues.selectedTypes);
                backUpValues.allRequirementsSelected = $scope.training.allRequirementsSelected;
            });
        } else {
            // this is a new training! Avoid undefined members.
            $scope.training.collections = [];
            $scope.training.projectTypes = [];
            $scope.training.allRequirementsSelected = true;
        }



        // Custom Scope Variables
        $scope.includeAll = true;
        $rootScope.requirementsSelected = 0;
        $scope.categoriesSelected = 0;
        $rootScope.allCollections = [];
        $rootScope.allProjectTypes = [];

        $scope.getSelectedCollectionsByCategory = function (category) {
            var result = [];
            $scope.training.collections.forEach(function (saved_col) {
                if (saved_col["collectionCategory"].id === category.id) {
                    // match! find the collectionInstance by it's id
                    category.collectionInstances.forEach(function (colInst) {
                        if (colInst.id === saved_col.id) {
                            result.push(colInst);
                            return;
                        }
                    });
                }
            });
            return result;
        };

        $rootScope.buildQueryParams = function () {
            var requestString = "";
            var selectedCollections = [];
            var selectedProjectTypes = [];

            // build the query to get the data (requirements, categories)
            if (!$scope.training.allRequirementsSelected) {
                $scope.training.collections.forEach(function (collection) {
                    selectedCollections.push(collection.id);
                });
                if ($scope.training.projectTypes.length > 0) {
                    $scope.training.projectTypes.forEach(function (projectType) {
                        selectedProjectTypes.push(projectType.id);
                    });
                } else if($scope.training.collections.length > 0) {
                    // in case no project type was selected, select all to get a project type independent result
                    // do this only when at least one collection was selected to avoid overwriting an empty selection ("0 req. selected")
                    selectedProjectTypes = $rootScope.allProjectTypes;
                }
            } else {
                // all requirements selected -> insert all selectors
                selectedCollections = $rootScope.allCollections;
                selectedProjectTypes = $rootScope.allProjectTypes;
            }

            if (selectedCollections.length > 0 || selectedProjectTypes.length > 0) {
                requestString += "collections=" + selectedCollections;
                requestString += "&";
                requestString += "projectTypes=" + selectedProjectTypes;
            } // if nothing is selected, return an empty string

            return requestString;
        };

        $scope.allRequirementsSwitched = function () {
            if (backUpValues.allRequirementsSelected === $scope.training.allRequirementsSelected) {
                $stateParams.isDirty = false;
            } else {
                $stateParams.isDirty = true;
            }
            $scope.showFilters();
            $rootScope.updateNumberOfRequirements();
        };

        $rootScope.updateNumberOfRequirements = function () {
            if (backUpValues.allRequirementsSelected === $scope.training.allRequirementsSelected &&
                backUpValues.selectedColls.length === $scope.training.collections.length &&
                backUpValues.selectedTypes.length === $scope.training.projectTypes.length) {
                $stateParams.isDirty = false;
                for (var i = 0; i < backUpValues.selectedTypes.length; i++) {
                    var element = backUpValues.selectedTypes[i];
                    if ($filter('filter')($scope.training.projectTypes, {
                            id: element.id
                        }).length === 0) {
                        $stateParams.isDirty = true;
                        break;
                    }
                }
                for (i = 0; i < backUpValues.selectedColls.length; i++) {
                    var element = backUpValues.selectedColls[i];
                    if ($filter('filter')($scope.training.collections, {
                            id: element.id
                        }).length === 0) {
                        $stateParams.isDirty = true;
                        break;
                    }
                }
            } else {
                $stateParams.isDirty = true;
            }

            if ($scope.training.allRequirementsSelected ||
                $scope.training.collections.length > 0 ||
                $scope.training.projectTypes.length > 0) {
                var requestString = $rootScope.buildQueryParams();
                $http({
                    url: "/frontend-api/numberOfRequirements/filter?" + requestString,
                    method: "GET"
                }).then(function(response) {
                    $rootScope.fetchNumberError = false;
                    $rootScope.requirementsSelected = response.data;
                }, function (exception) {
                    $rootScope.fetchNumberError = true;
                    $rootScope.requirementsSelected = "??";
                });
            } else {
                $rootScope.requirementsSelected = 0;
            }
        };

        $scope.showFilters = function () {
            $("#filterBlock").toggle();
        };

        $scope.load = function (id) {
            Training.get({
                id: id
            }, function (result) {
                $scope.training = result;
            });
        };
        $rootScope.$on('sdlctoolApp:trainingUpdate', function (event, result) {
            $scope.training = result;
        });

        // Vars from StarterController
        $scope.selectedCollection = [];
        $scope.selectedProjectType = [];
        $scope.projectTypeModel = {};

        // Api Calls & Functions from StarterController
        $scope.selectedCollectionSettings = {
            smartButtonMaxItems: 7,
            closeOnSelect: true,
            closeOnDeselect: true,
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'name',
            idProp: 'id',
            externalIdProp: ''
        };
        $scope.selectedProjectTypeSettings = $scope.selectedCollectionSettings;

        $scope.selectedCollectionEvents = {
            onItemSelect : function(item) {
                $scope.selectCollections(item, true);
            },
            onItemDeselect : function(item) {
                $scope.deselectCollections(item, true);
            }
        };
        $scope.selectedProjectTypeEvents = {
            onItemSelect : function(item) {
                $scope.selectProjectType(item, true);
            },
            onItemDeselect : function(item) {
                $scope.deselectProjectType(item, true);
            }
        };

        var queryPromises = [];
        var collectionPromise = apiFactory.getAll("collections");
        queryPromises.push(collectionPromise);
        collectionPromise.then(
            function (collections) {
                $scope.categories = collections;
                angular.forEach($scope.categories, function (category) {
                    //filters the collectionsInstances by showOrder.
                    category.collectionInstances = $filter('orderBy')(category.collectionInstances, 'showOrder');
                    angular.extend(category, {
                        selectedCollectionSets: $scope.getSelectedCollectionsByCategory(category)
                    });
                    category.collectionInstances.forEach(function (col) {
                        $rootScope.allCollections.push(col.id);
                    });
                });
                $scope.init();
            },
            function (exception) {

            });

        var projectTypePromise = apiFactory.getAll("projectTypes");
        queryPromises.push(projectTypePromise);
        projectTypePromise.then(
            function (projectTypes) {
                $scope.projectType = $filter('orderBy')(projectTypes, 'showOrder');
                $scope.projectType.forEach(function (prot) {
                    $rootScope.allProjectTypes.push(prot.id);
                });
            },
            function (exception) {

            });

        Promise.all(queryPromises).then(function() {
            $rootScope.updateNumberOfRequirements();
        });

        $scope.init = function () {
            $scope.projectTypeModel.name = 'Select';

            // restore the selection saved in the training (if any)
            if ($scope.training.collections != null && $scope.training.collections.length > 0)
                angular.copy($scope.training.collections, $scope.selectedCollection);
            if ($scope.training.projectType != null && $scope.training.projectType != null)
                angular.copy($scope.training.projectTypes, $scope.selectedProjectType);
        };

        $scope.selectProjectType = function(item, updateNumberOfSelectedReq) {
            $scope.projectTypeModel = item;

            var saved_in_training = false;
            $scope.training.projectTypes.forEach(function (saved_col) {
                if (saved_col.id === item.id) {
                    saved_in_training = true;
                    return;
                }
            });
            if (!saved_in_training) {
                $scope.training.projectTypes.push(item);
            }
            if(updateNumberOfSelectedReq)
                $rootScope.updateNumberOfRequirements();
        };

        $scope.deselectProjectType = function(item, updateNumberOfSelectedReq) {

            for (var i = 0; i < $scope.training.projectTypes.length; i++) {
                if ($scope.training.projectTypes[i].id === item.id) {
                    $scope.training.projectTypes.splice(i, 1);
                }
            }
            if(updateNumberOfSelectedReq)
                $rootScope.updateNumberOfRequirements();
        };

        $scope.selectCollections = function(item, updateNumberOfSelectedReq) {
            var categoryName = "";
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
                        collection.values.push({
                            collectionInstanceId: item.id,
                            type: item.name
                        });
                    }
                });
            } else {
                //new one
                var collection = {};
                var values = [];
                values.push({
                    collectionInstanceId: item.id,
                    type: item.name
                });
                angular.extend(collection, {
                    categoryName: categoryName,
                    values: values
                });
                $scope.selectedCollection.push(collection);
            }
            var saved_in_training = false;
            $scope.training.collections.forEach(function (saved_col) {
                if (saved_col.id === item.id) {
                    saved_in_training = true;
                    return;
                }
            });
            if (!saved_in_training) {
                $scope.training.collections.push(item);
            }
            if(updateNumberOfSelectedReq)
                $rootScope.updateNumberOfRequirements();
        };

        $scope.deselectCollections = function(item, updateNumberOfSelectedReq) {
            // remove the deselected item from the drop down lists selection
            for (var i = 0; i < $scope.selectedCollection.length; i++) {
                var collection = $scope.selectedCollection[i];
                if(collection.value != null) {
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
            }
            // remove the deselected item from the selection which stored in the training (and used for the queries)
            for (var k = 0; k < $scope.training.collections.length; k++) {
                if ($scope.training.collections[k].id === item.id) {
                    $scope.training.collections.splice(k, 1);
                }
            }
            if(updateNumberOfSelectedReq)
                $rootScope.updateNumberOfRequirements();
        };

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
    });
