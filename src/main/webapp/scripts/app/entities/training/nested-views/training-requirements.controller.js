'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingRequirementsController', function ($scope, $rootScope, $stateParams, entity, Training, User, TrainingTreeNode, apiFactory, sharedProperties, $filter) {
        var system = "old";
        $scope.training = entity;
        if($scope.training.allRequirementsSelected == null)
            $scope.training.allRequirementsSelected = true;

        // Custom Scope Variables
        $scope.includeAll = true;
        $scope.requirementsSelected = 0;
        $scope.categoriesSelected = 0;

        $scope.showFilters = function() {
            $("#filterBlock").toggle();
        };

        $scope.load = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
            });
        };
        $rootScope.$on('sdlctoolApp:trainingUpdate', function(event, result) {
            $scope.training = result;
        });

        // Vars from StarterController
        $scope.selectedCollection = [];
        $scope.selectedProjectType = [];
        $scope.projectTypeModel = {};

        // Api Calls & Functions from StarterController

        $scope.selectedCollectionSettings = {
            smartButtonMaxItems: 7,
            closeOnSelect: true, closeOnDeselect: true,
            showCheckAll: false, showUncheckAll: false,
            displayProp: 'name', idProp: 'id', externalIdProp: ''
        };
        $scope.selectedCollectionEvents = {
            onItemSelect : function(item) {
                $scope.selectCollections(item);
            },
            onItemDeselect : function(item) {
                $scope.deselectCollections(item);
            }
        };

        apiFactory.getAll("collections").then(
            function(collections) {
                $scope.categories = collections;
                angular.forEach($scope.categories, function(category) {
                    //filters the collectionsInstances by showOrder.
                    category.collectionInstances = $filter('orderBy')(category.collectionInstances, 'showOrder');
                    angular.extend(category,{selectedCollectionSets: []});
                });
                $scope.init();
            },
            function(exception) {

            });

        apiFactory.getAll("projectTypes").then(
            function(projectTypes) {
                $scope.projectType = $filter('orderBy')(projectTypes, 'showOrder');
                if($scope.selectedProjectType.length > 0) {
                    $scope.selectOldProjectTypeSettings();
                }
            },
            function(exception) {

            });

        $scope.init = function() {
            $scope.projectTypeModel.name = 'Select';
            $scope.oldSettings = sharedProperties.getProperty();
            if($scope.oldSettings != undefined && angular.equals(system, "old")) {
                $scope.disabled = true;
//                $scope.starterForm.name = $scope.oldSettings.name;
                $scope.selectedCollection = $scope.oldSettings.colls;
                $scope.selectedProjectType = $scope.oldSettings.project;
                $scope.ticket = $scope.oldSettings.ticket;
                $scope.oldAlternativeSets = $scope.oldSettings.alternativeSets;
                $scope.oldHasIssueLinks = $scope.oldSettings.hasIssueLinks;
                $scope.oldRequirements = $scope.oldSettings.requirements;
                $scope.selectOldCategorySettings();
            }
        };

        $scope.selectOldCategorySettings = function() {
            angular.forEach($scope.selectedCollection, function(collection) {
                $scope.getCategoryObject(collection);
            });

        };

        $scope.selectOldProjectTypeSettings = function() {
            angular.forEach($scope.selectedProjectType, function(oldProjectType) {
                angular.forEach($scope.projectType, function(newProjectType) {
                    if(newProjectType.id === oldProjectType.projectTypeId) {
                        $scope.projectTypeModel = newProjectType;
                    }
                });
            });
        }
        $scope.getCategoryObject = function(collection) {
            angular.forEach($scope.categories, function(category) {
                if(angular.equals(category.name, collection.categoryName)) {
                    angular.forEach(category.collectionInstances, function(instance) {
                        angular.forEach(collection.values, function(oldValue) {
                            if(instance.id === oldValue.collectionInstanceId) {
                                category.selectedCollectionSets.push(instance);
                            }
                        });
                    });
                }
            });
        }
        $scope.selectProject = function(item) {
            $scope.projectTypeModel = item;
            var optsColumn = [];
            var statsColumn = [];
            angular.forEach($scope.projectType, function(type) {
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

        $scope.selectCollections = function(item) {
            var categoryName = "";
            angular.forEach($scope.categories, function(category) {
                angular.forEach(category.collectionInstances, function(instance) {
                    if(instance.id === item.id) {
                        categoryName = category.name;
                    }
                });
            });
            //one item of the category is already selected
            if($scope.searchObjectbyValue(categoryName, $scope.selectedCollection)) {
                angular.forEach($scope.selectedCollection, function(collection) {
                    if(categoryName === collection.categoryName) {
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

        $scope.deselectCollections = function(item) {
            angular.forEach($scope.selectedCollection, function(collection) {
                angular.forEach(collection.values, function(instance) {
                    if(instance.collectionInstanceId === item.id) {
                        var idx = collection.values.indexOf(instance);
                        collection.values.splice(idx,1);
                        if(collection.values.length === 0) {
                            var idx = $scope.selectedCollection.indexOf(collection);
                            $scope.selectedCollection.splice(idx,1);
                        }
                    }
                });
            });
        };

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
        };
    });
