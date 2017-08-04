'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingRequirementsController', function ($scope, $rootScope, $stateParams, $filter, entity, Training,
                                                            TrainingTreeNode, apiFactory, sharedProperties ) {
        var system = "old";
        $scope.training = entity;

        if($scope.training.$promise != null) {
            $scope.training.$promise.then(function() {
                if($scope.training.allRequirementsSelected) {
                    $("#filterBlock").hide();
                } else {
                    $("#filterBlock").show();
                }
                // restore selection from training
                $scope.training.collections.forEach(function(col) {
                    $scope.selectCollections(col);
                });
                $scope.training.projectTypes.forEach(function(prot) {
                    $scope.selectedProjectType.push(prot);
                });
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

        $scope.getSelectedCollectionsByCategory = function(category) {
            var result = [];
            $scope.training.collections.forEach(function(saved_col) {
                if(saved_col["collectionCategory"].id === category.id) {
                    // match! find the collectionInstance by it's id
                    category.collectionInstances.forEach(function(colInst) {
                        if(colInst.id === saved_col.id) {
                            result.push(colInst);
                            return;
                        }
                    });
                }
            });
            return result;
        };

        $rootScope.buildQueryParams = function() {
            var requestString = "";
            var selectedCollections = [];
            var selectedProjectTypes = [];

            // build the query to get the data (requirements, categories)
            if(!$scope.training.allRequirementsSelected) {
                $scope.training.collections.forEach(function(collection) {
                    selectedCollections.push(collection.id);
                });
                $scope.training.projectTypes.forEach(function(projectType) {
                    selectedProjectTypes.push(projectType.id);
                });
            } else {
                selectedCollections = $rootScope.allCollections;
                selectedProjectTypes = $rootScope.allProjectTypes;
            }

            var hasCollectionsSelected = selectedCollections.length > 0;
            var hasProjectTypesSelected = selectedProjectTypes.length > 0;

            if(hasCollectionsSelected || hasProjectTypesSelected) {
                if (hasCollectionsSelected) {
                    requestString += "collections=" + selectedCollections;
                    if (selectedProjectTypes.length > 0) requestString += "&";
                }
                if (hasProjectTypesSelected)
                    requestString += "projectTypes=" + selectedProjectTypes;
            }
            return requestString;
        };

        $scope.allRequirementsSwitched = function() {
            $scope.showFilters();
            $scope.updateNumberOfRequirements();
        };

        $scope.updateNumberOfRequirements = function() {
            if($scope.training.allRequirementsSelected
                || $scope.training.collections.length > 0
                || $scope.training.projectTypes.length > 0) {
                var requestString = $rootScope.buildQueryParams();
                console.log("requestString", requestString);
                apiFactory.getByQuery("numberOfRequirements", "filter", requestString).then(
                    function (numberOfRequirements) {
                        $rootScope.requirementsSelected = numberOfRequirements;
                        console.log("$rootScope.requirementsSelected", $rootScope.requirementsSelected);
                    });
            } else {
                $rootScope.requirementsSelected = 0;
            }
        };

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
        $scope.selectedProjectTypeSettings = $scope.selectedCollectionSettings;

        $scope.selectedCollectionEvents = {
            onItemSelect : function(item) {
                $scope.selectCollections(item);
            },
            onItemDeselect : function(item) {
                $scope.deselectCollections(item);
            }
        };
        $scope.selectedProjectTypeEvents = {
            onItemSelect : function(item) {
                $scope.selectProjectType(item);
            },
            onItemDeselect : function(item) {
                $scope.deselectProjectType(item);
            }
        };

        var queryPromises = [];
        var collectionPromise = apiFactory.getAll("collections");
        queryPromises.push(collectionPromise);
        collectionPromise.then(
            function(collections) {
                $scope.categories = collections;
                angular.forEach($scope.categories, function(category) {
                    //filters the collectionsInstances by showOrder.
                    category.collectionInstances = $filter('orderBy')(category.collectionInstances, 'showOrder');
                    angular.extend(category,{selectedCollectionSets: $scope.getSelectedCollectionsByCategory(category)});
                    category.collectionInstances.forEach(function(col) {
                        $rootScope.allCollections.push(col.id);
                    });
                });
                $scope.init();
            },
            function(exception) {

            });

        var projectTypePromise = apiFactory.getAll("projectTypes");
        queryPromises.push(projectTypePromise);
        projectTypePromise.then(
            function(projectTypes) {
                $scope.projectType = $filter('orderBy')(projectTypes, 'showOrder');
                $scope.projectType.forEach(function(prot) {
                    $rootScope.allProjectTypes.push(prot.id);
                });
                if($scope.selectedProjectType.length > 0) {
                    $scope.selectOldProjectTypeSettings();
                }
            },
            function(exception) {

            });

        Promise.all(queryPromises).then(function() {
            $scope.updateNumberOfRequirements();
        });

        $scope.init = function() {
            $scope.projectTypeModel.name = 'Select';
            $scope.oldSettings = sharedProperties.getProperty();
            if($scope.oldSettings != undefined && angular.equals(system, "old")) {
                $scope.disabled = true;
                if($scope.training.collections != null)
                    $scope.selectedCollection = $scope.training.collections;
                else {
                    $scope.selectedCollection = $scope.oldSettings.colls;
                }
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
        };
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
        };
        $scope.selectProjectType = function(item) {
            console.log("BEFORE $scope.selectedProjectType", $scope.selectedProjectType);
            $scope.projectTypeModel = item;

            var saved_in_training = false;
            $scope.training.projectTypes.forEach(function(saved_col) {
                if(saved_col.id === item.id) {
                    saved_in_training = true;
                    return;
                }
            });
            if(!saved_in_training) {
                $scope.training.projectTypes.push(item);
            }
            $scope.updateNumberOfRequirements();
        };

        $scope.deselectProjectType = function(item) {
            var id = $scope.training.projectTypes.indexOf(item);
            $scope.training.projectTypes.splice(id,1);
            $scope.updateNumberOfRequirements();
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
            var saved_in_training = false;
            $scope.training.collections.forEach(function(saved_col) {
               if(saved_col.id === item.id) {
                   saved_in_training = true;
                   return;
               }
            });
            if(!saved_in_training) {
                $scope.training.collections.push(item);
            }
            $scope.updateNumberOfRequirements();
        };

        $scope.deselectCollections = function(item) {
            angular.forEach($scope.selectedCollection, function(collection) {
                angular.forEach(collection.values, function(instance) {
                    if(instance.collectionInstanceId === item.id) {
                        var idx = collection.values.indexOf(instance);
                        collection.values.splice(idx,1);
                        if(collection.values.length === 0) {
                            var id = $scope.selectedCollection.indexOf(collection);
                            $scope.selectedCollection.splice(id,1);
                        }
                    }
                });
                var id = $scope.training.collections.indexOf(item);
                $scope.training.collections.splice(id,1);
            });
            $scope.updateNumberOfRequirements();
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
