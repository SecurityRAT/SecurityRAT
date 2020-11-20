'use strict';

/* jshint undef: true, unused: true */
/* globals urlpattern, window, diffString2, XLSX, navigator, Blob, saveAs, jsyaml */

/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:RequirementsCtrl
 * @description
 * # RequirementsCtrl
 * Controller of the sdlcFrontendApp
 */
angular.module('sdlctoolApp')
    .controller('RequirementsController', function ($scope, apiFactory, sharedProperties, $interval, $uibModal, $filter,
        getRequirementsFromImport, $confirm, $location, localStorageService, appConfig, $sce, SDLCToolExceptionService, Helper,
        checkAuthentication, JiraService, $q, $uibModalStack, ProgressBar, $window, authenticatorService) {
        $scope.failed = '';
        $scope.fail = false;
        $scope.checks = {
            urlPattern: urlpattern.javascriptStringRegex,
            errorMessage: 'Invalid url. Please specify URL like https://www.example-queue.com/browse/DUMBQ-21'
        };
        $scope.progressbar = {
            hide: true,
            barValue: 0,
            intervalPromise: undefined,
            showContent: false
        };

        $scope.manageTicketProperty = {
            spinnerProperty: {
                showSpinner: false
            },
            promise: {},
            authenticatorProperty: {},
            jhError: {},
            error: false,
            defaultJIRAHost: appConfig.defaultJIRAHost
        };
        // saves the alternative instances to be able to make panels out of them.
        $scope.newStyleAlternativeInstances = {};
        // $scope.showRequirements = false;
        $scope.withselectedDropdown = {
            toggleExcel: false,
            testAutomation: appConfig.securityCAT !== undefined && appConfig.securityCAT !== '' ? true : false
        };
        $scope.outputStatus = '';
        $scope.generatedOn = '';
        $scope.lastChanged = '';
        $scope.ticket = {};
        $scope.customRequirements = [];
        $scope.newRequirementParam = {
            index: 1,
            id: 20000
        };
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
        $scope.textFilters = {
            optColumns: {},
            statusColumns: {}
        };
        $scope.requirementProperties = {
            hasIssueLinks: false,
            requirementsEdited: true,
            selectedOptColumns: {
                ids: [],
                counts: 0
            },
            exported: false,
            statColumnChanged: false, // indicates whether a status column value has been changed.
            crCounts: 0,
            defaultLabelFilterObject: {
                buttonDefaultText: 'Filter'
            },
            newColumn: {
                present: false,
                alertMessages: []
            }
        };
        $scope.selectOptCompare = {
            ids: [],
            counts: 0
        };
        $scope.categoryLabelText = {
            buttonDefaultText: 'Category'
        };
        $scope.tableSpan = {
            row: 0,
            col: 0
        };
        $scope.updateProperties = {
            updatedReqs: false,
            updatesCounter: 0,
            updatesAvailable: false,
            tooltipText: 'Please apply the updates first.'
        };
        // $scope.updatedReqs = false;
        // $scope.updatesCounter = 0;
        // $scope.updatesAvailable = false;
        $scope.infiniteScroll = {
            numberToDisplay: 15,
            length: 1000
        };
        //extra settings for the model for selecting categories
        $scope.selectedCategorySettings = {
            smartButtonMaxItems: 3,
            keyboardControls: true,
            styleActive: true,
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'label',
            idProp: 'label',
            externalIdProp: 'category'
        };

        $scope.selectedStatusSettings = {
            smartButtonMaxItems: 4,
            keyboardControls: true,
            styleActive: true,
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'name',
            idProp: 'id',
            externalIdProp: ''
        };
        $scope.selectedJiraStatusSettings = {
            template: '<span data-ng-style="option.name==\'No ticket\' && {\'font-style\': \'italic\'}">{{option.name}}</span>',
            smartButtonMaxItems: 3,
            keyboardControls: true,
            styleActive: true,
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'name',
            idProp: 'name',
            externalIdProp: ''
        };
        $scope.filteredRequirementsByTags = [];
        $scope.selectedTags = [];
        $scope.alternativeSets = [];
        $scope.tempString = '';
        $scope.selectedStatusColumn = {};

        $scope.jiraStatus = {
            addTicketTemplateUrl: 'scripts/app/editor/requirements/manageTicketsTemplates/add-ticket.html',
            removeTicketTemplateUrl: 'scripts/app/editor/requirements/manageTicketsTemplates/remove-ticket.html',
            displayStatusTemplateUrl: 'scripts/app/editor/requirements/manageTicketsTemplates/display-status.html'
        };

        $scope.htmlTooltips = {
            optColumnTooltips: [],
            statusColumnTooltips: []
        };
        $scope.selectedAlternativeSettings = {
            smartButtonMaxItems: 3,
            keyboardControls: true,
            styleActive: true,
            closeOnSelect: true,
            closeOnDeselect: true,
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'name',
            idProp: 'id',
            externalIdProp: ''
        };
        $scope.selectedAlternativeEvents = {
            onItemSelect: function (item) {
                $scope.selectAlternatives(item);
            },
            onItemDeselect: function (item) {
                $scope.deselectAlternatives(item);
            }
        };

        function selectAllReqs() {
            angular.forEach($scope.filterRequirements(), function (requirement) {
                requirement.selected = true;
            });
        }

        function deselectAllReqs() {
            angular.forEach($scope.filterRequirements(), function (requirement) {
                requirement.selected = false;
            });
        }

        $scope.performSelection = function (selectionValue) {
            if (selectionValue) {
                selectAllReqs();
            } else {
                deselectAllReqs();
            }
        };

        //display a modal if the user hasn't exported the system and wants to close the tab
        window.onbeforeunload = function (e) {
            if ($scope.requirementProperties.requirementsEdited) {
                var confirmationMessage = 'You have unsaved changes!';
                (e || window.event).returnValue = confirmationMessage; //Gecko + IE
                return confirmationMessage; //Webkit, Safari, Chrome
            }
        };

        $scope.startProgressbar = function () {
            ProgressBar.startProgressbar($scope.progressbar);
        };

        $scope.finishProgressbar = function () {
            ProgressBar.finishProgressbar($scope.progressbar);
        };

        $scope.closeNewColumAlert = function (index) {
            $scope.requirementProperties.newColumn.alertMessages.splice(index, 1);
        };

        $scope.init = function () {
            $scope.onRouteChangeOff = $scope.$on('$locationChangeStart', $scope.routeChange);
            // initialise the jiraStatus object;
            angular.extend($scope.jiraStatus, {
                allStatus: [],
                selectedStatus: [],
                jiraStatusLabelText: {
                    buttonDefaultText: 'Status'
                }
            });
            var imports = getRequirementsFromImport.getProperty();
            if (angular.isDefined($scope.systemSettings.name)) {
                $window.document.title = $scope.systemSettings.name;
            }
            if ($scope.systemSettings.ticket !== undefined) {
                $scope.ticket = $scope.systemSettings.ticket;
                if (angular.isDefined($scope.ticket.key)) {
                    $window.document.title += ': ' + $scope.ticket.key;
                }
            }
            $scope.generatedOn = $scope.systemSettings.generatedOn;
            $scope.lastChanged = $scope.systemSettings.lastChanged;

            if (angular.isDefined(imports) && imports.requirement !== undefined) {
                if ($location.$$search.file !== undefined || $location.$$search.ticket !== undefined) {
                    $location.search('');
                }
                $scope.requirementProperties.hasIssueLinks = imports.hasIssueLinks;
                $scope.requirements = imports.requirement;
                $scope.requirementProperties.selectedOptColumns.counts = imports.selectedAlternativeSets.length;
                $scope.selectOptCompare.counts = imports.selectedAlternativeSets.length;
                $scope.filterCategory = imports.filterCategory;
                $scope.filterCategory = $filter('orderBy')($scope.filterCategory, 'showOrder');
                $scope.selectedAlternativeSets = imports.selectedAlternativeSets;
                $scope.newStyleAlternativeInstances = imports.newStyleAlternativeInstances;
                // getRequirementsFromImport.setProperty(undefined);
                $scope.jiraStatus.allStatus = [];
                //                $scope.newRequirementParam.id = imports.lastId++; // gets the id of the last Custom requirements save
                $scope.getAlternativeSets();
                $scope.getCustomRequirements();
                $scope.progressbar.showContent = true;
                $scope.requirementProperties.exported = true;
                $scope.requirementProperties.requirementsEdited = false;
                $scope.buildSettings();
                //do a initial localBackup
                $scope.onTimeout();
                $scope.promiseForStorage = $interval($scope.onTimeout, 60000);
                $scope.updateRequirements();
                $scope.getOptandStatusColumns(true);
                $uibModalStack.dismissAll();
                SDLCToolExceptionService.showWarning('Import successful', 'The Secure SDLC artifact ' + $scope.systemSettings.name + ' was successfully imported.', SDLCToolExceptionService.SUCCESS);
            } else {
                $scope.startProgressbar();
                $scope.generatedOn = Helper.getCurrentDate();
                $scope.buildSettings();
                $scope.getRequirements();
                $scope.getAlternativeSets();
                $scope.getOptandStatusColumns(false);
                $scope.alternativeSets = $scope.systemSettings.alternativeSets;
                $scope.requirementProperties.hasIssueLinks = $scope.systemSettings.hasIssueLinks;
            }
            // $scope.getOptandStatusColumns();
            $scope.getTagCategories();
        };

        $scope.loadMore = function () {
            if ($scope.infiniteScroll.numberToDisplay + 10 < $scope.infiniteScroll.length) {
                $scope.infiniteScroll.numberToDisplay += 10;
            } else {
                $scope.infiniteScroll.numberToDisplay = $scope.infiniteScroll.length;
            }
        };

        $scope.hideColumn = function (id) {
            var index = $scope.optToHide.indexOf(id);
            if (index !== -1) {
                $scope.optToHide.splice(index, 1);
            } else {
                $scope.optToHide.push(id);
            }
        };

        $scope.openFeedback = function (requirement) {
            sharedProperties.setProperty(requirement);
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/feedback/feedback.html',
                controller: 'FeedbackController'
            });

            modalInstance.result.then();
        };

        $scope.getCustomRequirements = function () {
            // temporary save the default id for CusReq since this one changed in the loop.
            var tempdefaultCusReqId = $scope.newRequirementParam.id;
            var customReqFound = [];
            var existingIds = []; // saves existing cusReqId. this will help resolve id duplicates.
            $scope.requirements = $filter('orderBy')($scope.requirements, 'id');
            var lastElement = $scope.requirements[$scope.requirements.length - 1];

            // assign the default cusReqId the id of the last element after sort by id, if this condition is met.
            if (lastElement.shortName.indexOf(appConfig.customRequirement) >= 0 && lastElement.id > $scope.newRequirementParam.id) {
                $scope.newRequirementParam.id = lastElement.id + 1;
            }

            if ($scope.requirementProperties.hasIssueLinks) {
                var hosts = [];
                angular.forEach($scope.requirements, function (requirement) {
                    if (requirement.tickets.length > 0) {
                        $scope.fetchTicketStatus(requirement, hosts);
                    }
                    if (requirement.shortName.indexOf(appConfig.customRequirement) >= 0) {
                        $scope.requirementProperties.crCounts++;
                        $scope.newRequirementParam.index++;

                        // assign the new cusReqId to :
                        // first cas: existing cusReq which have id less than the default id.
                        // second case: if there are any duplicates.
                        if (requirement.id < tempdefaultCusReqId || existingIds.indexOf(requirement.id) >= 0) {
                            requirement.id = $scope.newRequirementParam.id;
                            $scope.newRequirementParam.id++;
                        }

                        if (existingIds.indexOf(requirement.id) === -1) {
                            existingIds.push(requirement.id);
                        }
                        // push value after updating id.
                        customReqFound.push(requirement);
                    }

                });
            } else {
                angular.forEach($scope.requirements, function (requirement) {
                    if (requirement.shortName.indexOf(appConfig.customRequirement) >= 0) {
                        $scope.requirementProperties.crCounts++;
                        $scope.newRequirementParam.index++;

                        // assign the new cusReqId to :
                        // first cas: existing cusReq which have id less than the default id.
                        // second case: if there are any duplicates.
                        if (requirement.id < tempdefaultCusReqId || existingIds.indexOf(requirement.id) >= 0) {
                            requirement.id = $scope.newRequirementParam.id;
                            $scope.newRequirementParam.id++;
                        }

                        if (existingIds.indexOf(requirement.id) === -1) {
                            existingIds.push(requirement.id);
                        }
                        // push value after updating id.
                        customReqFound.push(requirement);
                    }

                });
            }

            $scope.customRequirements = customReqFound;
        };

        $scope.changeSettings = function () {
            deselectAllReqs();
            var oldSettings = {};
            angular.extend(oldSettings, {
                name: $scope.systemSettings.name,
                colls: $scope.systemSettings.colls,
                project: $scope.systemSettings.project,
                ticket: $scope.systemSettings.ticket,
                alternativeSets: $scope.alternativeSets,
                hasIssueLinks: $scope.requirementProperties.hasIssueLinks,
                requirements: $scope.requirements
            });
            sharedProperties.setProperty(oldSettings);
            $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/starter/starter.html',
                controller: 'StarterController',
                resolve: {
                    system: function () {
                        return 'old';
                    }
                }
            });
        };

        /* jshint unused: false*/
        $scope.$watch('customRequirements.length', function (newVal, oldVal, scope) {
            if (newVal !== $scope.requirementProperties.crCounts) {
                $scope.enableSave(false);
            } else if (newVal === $scope.requirementProperties.crCounts) {
                $scope.disableSave(false);
            }
        });

        /* jshint unused: false*/
        $scope.$watch('selectOptCompare.counts', function (newVal, oldVal, scope) {
            if (newVal !== $scope.requirementProperties.selectedOptColumns.counts) {
                $scope.enableSave(false);
            } else if (newVal === $scope.requirementProperties.selectedOptColumns.counts) {
                var notFoundId;
                for (var i = 0; i < $scope.selectOptCompare.ids.length; i++) {
                    if ($scope.requirementProperties.selectedOptColumns.ids.indexOf($scope.selectOptCompare.ids[i]) === -1) {
                        notFoundId = true;
                    }
                }
                if (!notFoundId) {
                    $scope.disableSave(false);
                } else {
                    $scope.enableSave(false);
                }
            }
        });

        $scope.getRequirements = function () {
            var requestString = '';
            angular.forEach($scope.requirementsSettings, function (value, key) {
                requestString += key + '=' + value + '&';
            });
            //Remove trailing &
            requestString = requestString.slice(0, -1);
            apiFactory.getByQuery('categoriesWithRequirements', 'filter', requestString).then(
                function (categoriesWithRequirements) {
                    $scope.requirementSkeletons = categoriesWithRequirements;
                    $scope.buildRequirements();
                },
                function () { });
        };

        $scope.getOptandStatusColumns = function (fromImport) {

            angular.forEach($scope.systemSettings, function (object) {
                angular.forEach(object, function (obj) {
                    angular.forEach(obj, function (value, key) {
                        if (key === 'optsColumn') {
                            $scope.optColumns = value;
                            angular.forEach($scope.optColumns, function (column) {
                                if (!column.isVisibleByDefault) {
                                    $scope.optToHide.push(column.id);
                                }
                                // column.description = '<p class=\'myTooltip\'><span style=\'color:yellow;\'>Description:</span> ' + column.description + '</p>';
                                column.description = '<strong> ' + column.description + '</strong>';
                                angular.extend(column, {
                                    optColumnLabelText: {
                                        buttonDefaultText: column.name
                                    }
                                });
                            });
                        } else if (key === 'statsColumn') {
                            var absentStatusColumns = [];
                            $scope.statusColumns = value;
                            // angular.forEach(value, function (statusColumn) {
                            //     if (statusColumn.isEnum) {
                            //         statusColumn.values = $filter('orderBy')(statusColumn.values, 'showOrder');
                            //     }
                            // });
                            var newColumnAlertMessage = 'The status column(s) ';
                            angular.forEach($scope.statusColumns, function (status) {
                                // status.description = '<p class=\'myTooltip\'><span style=\'color:yellow;\'>Description:</span> ' + status.description + '</p>';
                                status.description = '<strong>' + status.description + '</strong>';
                                var statColumnTooltip = '<p class=\'myTooltip\'><span style=\'color:yellow;\'>Possible values:</span><BR>';
                                if (status.isEnum) {
                                    $scope.selectedStatusColumn[status.id] = [];
                                    status.values = $filter('orderBy')(status.values, 'showOrder');
                                    angular.forEach(status.values, function (value) {
                                        statColumnTooltip += '<span><b style=\'font-size:13px;color:#cc6600;\'>' + value.name + ':</b> ' + value.description + '<BR></span>';
                                    });
                                    statColumnTooltip += '</p>';
                                    $scope.htmlTooltips.statusColumnTooltips.push({
                                        statId: status.id,
                                        tooltip: $sce.trustAsHtml(statColumnTooltip)
                                    });
                                }

                                if (fromImport && $filter('filter')($scope.requirements[0].statusColumns, {
                                    id: status.id
                                }).length === 0) {
                                    absentStatusColumns.push(status);
                                    $scope.requirementProperties.newColumn.present = true;
                                }

                                angular.extend(status, {
                                    statColumnLabelText: {
                                        buttonDefaultText: status.name
                                    }
                                });
                            });

                            // add this statusColumn to the import requirement set, if this one was not found.
                            if (absentStatusColumns.length > 0) {
                                var statusColumnsValues = buildStatusColumns(absentStatusColumns);
                                angular.forEach($scope.requirements, function (req) {
                                    angular.copy(req.statusColumns.concat(statusColumnsValues), req.statusColumns);
                                    // req.statusColumns = req.statusColumns.concat(statusColumnsValues);
                                });
                                $scope.requirementProperties.requirementsEdited = true;
                                var absentStatusColumnNames = [];
                                for (var i = 0; i < absentStatusColumns.length; i++) {
                                    absentStatusColumnNames.push(absentStatusColumns[i].name);

                                }
                                newColumnAlertMessage += '**' + absentStatusColumnNames.toString() + '** was/were added. Please save the current state.';
                                $scope.requirementProperties.newColumn.alertMessages.push(newColumnAlertMessage);

                            }
                        }
                    });
                });
            });
        };

        $scope.getTagCategories = function () {
            apiFactory.getAll('tags').then(
                function (tags) {
                    $scope.tags = tags;
                },
                function () { });
        };

        $scope.getAlternativeSets = function () {
            apiFactory.getAll('optionColumnsWithAlternativeSets').then(
                function (optionColumnsWithAlternativeSets) {
                    var selectedAltSets = [];
                    $scope.alternativeSets = optionColumnsWithAlternativeSets;
                    angular.forEach($scope.optColumns, function (optColumn) {
                        var optColumnTooltip = '<p class=\'myTooltip\'><span style=\'color:yellow;\'>You can add different informations to this column by selecting alternatives with the Dropdown.</span><BR>';

                        angular.forEach($scope.alternativeSets, function (alternativeSet) {
                            if (alternativeSet.id === optColumn.id) {
                                var tempSelectedAltSet = [];
                                //we have to add the optColumnId to every alternativeSet as we need it later if the user selected one
                                angular.forEach(alternativeSet.alternativeSets, function (set) {
                                    optColumnTooltip += '<span><b style=\'font-size:13px;color:#cc6600;\'>' + set.name + ':</b> ' + set.description + '<BR></span>';
                                    angular.extend(set, {
                                        'optColumnId': optColumn.id
                                    });
                                    //add the selected list of alternative sets.
                                    if ($scope.selectedAlternativeSets.length > 0) {
                                        for (var i = 0; i < $scope.selectedAlternativeSets.length; i++) {

                                            if (set.id === $scope.selectedAlternativeSets[i]) {
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
                                angular.extend(optColumn, {
                                    'alternativeSets': alternativeSet.alternativeSets,
                                    selectedAlternativeSets: tempSelectedAltSet
                                });
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
                    angular.forEach(selectedAltSets, function (altSet) {
                        $scope.selectAlternatives(altSet);
                    });
                },
                function () { });
        };

        $scope.selectTags = function (id, name, tagCategory) {
            //same tagCategory
            if (Helper.searchArrayByValue(tagCategory, $scope.selectedTags)) {
                angular.forEach($scope.selectedTags, function (object) {
                    if (object.tagCategory === tagCategory) {
                        //tagInstance is already inside, so this is a deselect. delete the item from the array
                        if ($scope.searchObjectbyValue(id, object.tagInstances)) {
                            var idx = object.tagInstances.indexOf(id);
                            object.tagInstances.splice(idx, 1);
                            //tagInstances array is empty so we can delete the whole object
                            if (object.tagInstances.length === 0) {
                                idx = $scope.selectedTags.indexOf(object);
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
                $scope.selectedTags.push({
                    tagCategory: tagCategory,
                    tagName: names,
                    tagInstances: instances
                });
            }

            //if $scope.selectedTags.length === 0 then this is a whole deselect and we can skip searching for requirements and speed this up
            if ($scope.selectedTags.length !== 0) {
                $scope.showSpinner = true;
                var filteredRequirements = [];
                //get the requirements based on the tags
                angular.forEach($scope.selectedTags, function (categorySelection) {
                    angular.forEach($scope.requirements, function (requirement) {
                        angular.forEach(requirement.tagInstances, function (tagInstanceRequirement) {
                            angular.forEach(categorySelection.tagInstances, function (tagInstanceSelection) {
                                //our tagInstance is in a requirement
                                if (tagInstanceSelection === tagInstanceRequirement) {
                                    //check if this tagCategory is already inside and therefor selected before
                                    if (Helper.searchArrayByValue(categorySelection.tagCategory, filteredRequirements)) {
                                        angular.forEach(filteredRequirements, function (object) {
                                            if (categorySelection.tagCategory === object.tagCategory && (!Helper.searchArrayByValue(requirement.shortName, object.requirement))) {
                                                object.requirement.push(requirement);
                                            }
                                        });
                                    } else {
                                        //new category and new requirement
                                        var reqs = [];
                                        reqs.push(requirement);
                                        filteredRequirements.push({
                                            tagCategory: categorySelection.tagCategory,
                                            requirement: reqs
                                        });
                                    }
                                }
                            });
                        });
                    });
                });
                $scope.filteredRequirementsByTags = [];
                //only one category selected, so we don't need to merge any arrays
                if (filteredRequirements.length === 1) {
                    angular.forEach(filteredRequirements, function (object) {
                        $scope.filteredRequirementsByTags = object.requirement;
                    });
                    $scope.showSpinner = false;
                } else {
                    //now merge the filteredRerquirements ANDwise foreach category
                    angular.forEach(filteredRequirements, function (object) {
                        angular.forEach(object.requirement, function (requirement) {
                            //save it and delete it from the array
                            var ret = requirement;
                            var count = 1;
                            var idx = object.requirement.indexOf(requirement);
                            object.requirement.splice(idx, 1);
                            angular.forEach(filteredRequirements, function (searchRequirements) {
                                if (Helper.searchArrayByValue(ret, searchRequirements)) {
                                    count++;
                                }
                            });
                            if (count === filteredRequirements.length) {
                                $scope.filteredRequirementsByTags.push(ret);
                            }
                        });
                    });
                    $scope.showSpinner = false;
                }
                $scope.filteredRequirementsByTags = $filter('orderBy')($scope.filteredRequirementsByTags, 'order');
                //all selections did not match any requirement
                if ($scope.filteredRequirementsByTags.length === 0 && $scope.selectedTags.length !== 0) {
                    $scope.filteredRequirementsByTags = ['ERROR'];
                }
            } else {
                $scope.filteredRequirementsByTags = [];
            }


        };

        //adds a custom requirement
        $scope.addRequirement = function () {
            $scope.crdropdown = false;
            var crObject = {};
            angular.extend(crObject, {
                statusColumns: $scope.statusColumns,
                optionColumns: $scope.optColumns,
                filterCategory: $scope.filterCategory,
                shortnameIndex: $scope.newRequirementParam.index
            });
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/customrequirements/customRequirement.html',
                controller: 'customRequirementController',
                resolve: {
                    crObject: crObject
                }
            });
            //adds the categoryOrder, id of the item and updates the filterCategory library for the filter nach category.
            modalInstance.result.then(function (item) {
                item.requirement.id = $scope.newRequirementParam.id;

                $scope.newRequirementParam.id++;
                //update the order of the last element in the category filter.
                $scope.filterCategory[item.categoryIndex].lastElemOrder = item.requirement.order;
                item.requirement.universalId = '';
                item.requirement.tickets = [];
                $scope.newRequirementParam.index++;
                angular.forEach(item.requirement.optionColumns, function (optColumn) {
                    angular.forEach(optColumn.content, function (content) {
                        content.content = content.content;
                    });
                });
                $scope.customRequirements.push(item.requirement);
                $scope.requirements.push(item.requirement);
                //            $scope.exported = false;
            });
        };
        // edit custom requirement.
        $scope.editRequirement = function () {
            $scope.crdropdown = false;
            var crObject = {};
            angular.extend(crObject, {
                requirements: $scope.customRequirements,
                statusColumns: $scope.statusColumns,
                optionColumns: $scope.optColumns,
                filterCategory: $scope.filterCategory,
            });
            sharedProperties.setProperty(crObject);
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/customrequirements/customRequirement.html',
                controller: 'customRequirementController',
                resolve: {
                    crObject: crObject
                }
            });
            //adds the categoryOrder, id of the item and updates the filterCategory library for the filter nach category.
            modalInstance.result.then(function (item) {
                // updates the edited custom requirement in the requirements list object.
                for (var i = 0; i < $scope.requirements.length; i++) {
                    if ($scope.requirements[i].id === item.requirement.id && $scope.requirements[i].shortName === item.requirement.shortName) {
                        // $scope.requirements.splice(i, 1);
                        $scope.requirements[i] = item.requirement;
                        break;
                    }
                }

                // updates the edited in the customrequirements list.
                for (var j = 0; j < $scope.customRequirements.length; j++) {
                    if ($scope.customRequirements[j].id === item.requirement.id && $scope.customRequirements[j].shortName === item.requirement.shortName) {
                        // $scope.customRequirements.splice(j, 1);
                        $scope.customRequirements[j] = item.requirement;
                        break;
                    }
                }

                // $scope.requirements.push(item.requirement);
                // $scope.customRequirements.push(item.requirement);

                // sets the show order of the last requirement element to a category.
                $scope.filterCategory[item.categoryIndex].lastElemOrder = item.requirement.order;
            });
            //
        };
        //removes a custom requirement
        $scope.removeRequirement = function () {
            $scope.crdropdown = false;
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/customrequirements/remove-customRequirement.html',
                controller: 'removeRequirementController',
                resolve: {
                    customRequirements: function () {
                        return $scope.customRequirements;
                    }
                }
            });

            modalInstance.result.then(function (itemToRemove) {
                $scope.deleteObjFromArrayByValue(itemToRemove.shortName, $scope.customRequirements);
                $scope.deleteObjFromArrayByValue(itemToRemove.shortName, $scope.requirements);
            });
        };
        /* jshint loopfunc: true */
        // the objectValue must be unique in the array
        $scope.deleteObjFromArrayByValue = function (objectValue, givenArray) {
            for (var i = 0; i < givenArray.length; i++) {
                angular.forEach(givenArray[i], function (value, key) {
                    if (value === objectValue) {
                        givenArray.splice(i, 1);
                    }
                });
            }
        };

        $scope.selectAlternatives = function (item) {
            apiFactory.getByQuery('alternativeInstances', 'filter', 'alternativeSet=' + item.id).then(
                function (alternativeInstances) {
                    var alternativeInstance = alternativeInstances;
                    //we need to push the instance also in the alternativeSet structure, as we need them for the deselect later
                    angular.forEach($scope.alternativeSets, function (sets) {
                        angular.forEach(sets.alternativeSets, function (set) {
                            if (item.id === set.id) {
                                angular.extend(set, {
                                    alternativeInstances: alternativeInstances
                                });
                            }
                        });
                    });
                    if (!item.import) {
                        //push the alternativeInstance into the corresponding requirements
                        angular.forEach(alternativeInstance, function (instance) {
                            angular.forEach($scope.requirements, function (requirement) {
                                if (instance.requirementId === requirement.id) {
                                    if (angular.isUndefined($scope.newStyleAlternativeInstances[requirement.id])) {
                                        $scope.newStyleAlternativeInstances[requirement.id] = {};
                                    }
                                    angular.forEach(requirement.optionColumns, function (optColumn) {
                                        $scope.newStyleAlternativeInstances[requirement.id][instance.id] = {
                                            title: item.name,
                                            body: instance.content
                                        };
                                        if (optColumn.showOrder === item.optColumnId) {
                                            optColumn.content.push({
                                                id: instance.id,
                                                setId: item.id,
                                                content: '**' + item.name + '**\n\n' + instance.content,
                                            });
                                        }
                                    });
                                }
                            });
                        });
                        $scope.selectOptCompare.ids.push(item.id);
                        $scope.selectOptCompare.counts++;
                    }
                },
                function () { });
        };

        $scope.deselectAlternatives = function (item) {

            angular.forEach($scope.alternativeSets, function (sets) {
                angular.forEach(sets.alternativeSets, function (set) {
                    if (item.id === set.id) {
                        angular.forEach($scope.requirements, function (requirement) {
                            angular.forEach(requirement.optionColumns, function (optColumn) {
                                angular.forEach(set.alternativeInstances, function (instance) {
                                    angular.forEach(optColumn.content, function (content) {
                                        if (instance.id === content.id) {
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
            if (idIndex >= 0) {
                $scope.selectOptCompare.ids.splice(idIndex, 1);
            }
            $scope.selectOptCompare.counts--;
        };

        $scope.enableSave = function (withStatColumn) {
            $scope.requirementProperties.requirementsEdited = true;
            if (withStatColumn) {
                $scope.requirementProperties.statColumnChanged = true;
            }
        };

        $scope.disableSave = function (forceZero) {
            if ($scope.requirementProperties.exported && !$scope.requirementProperties.statColumnChanged) {
                $scope.requirementProperties.requirementsEdited = false;
            } else if (forceZero) {
                $scope.requirementProperties.selectedOptColumns = {};
                $scope.requirementProperties.selectedOptColumns = (JSON.parse(JSON.stringify($scope.selectOptCompare)));
                $scope.requirementProperties.requirementsEdited = false;
                $scope.requirementProperties.exported = true;
            }
        };

        $scope.getStatusValue = function (requirementId, statusColumnId) {
            var returnValue = '';
            angular.forEach($scope.requirements, function (requirement) {
                //found the requirement, so update the statusColumn Value
                if (requirementId === requirement.id) {
                    angular.forEach(requirement.statusColumns, function (statusColumn) {
                        if (statusColumnId === statusColumn.id) {
                            returnValue = statusColumn.value;
                        }
                    });
                }
            });
            return returnValue;
        };

        $scope.selectStatusValue = function (requirementId, statusColumnId, value) {
            angular.forEach($scope.requirements, function (requirement) {
                //found the requirement, so update the statusColumn Value
                if (requirementId === requirement.id) {
                    angular.forEach(requirement.statusColumns, function (statusColumn) {
                        if (statusColumnId === statusColumn.id) {
                            statusColumn.value = value.name;
                            statusColumn.valueId = value.id;
                            //                       $scope.exported = false;
                        }
                    });
                }
            });
            $scope.enableSave(true);
        };

        var buildReqOptContents = function (reqOptContents) {
            var values = [];
            var lastOptContentId = {};
            angular.forEach(reqOptContents, function (optColumn) {
                if (values.length > 0 && $filter('filter')(values, {
                    showOrder: optColumn.optionColumnId
                }).length === 1) {
                    for (var i = 0; i < values.length; i++) {
                        if (values[i].showOrder === optColumn.optionColumnId) {
                            lastOptContentId[optColumn.optionColumnId]++;
                            values[i].content.push({
                                id: lastOptContentId[optColumn.optionColumnId],
                                content: optColumn.content.trim()
                            });
                        }
                    }
                } else {
                    lastOptContentId[optColumn.optionColumnId] = 0;
                    values.push({
                        content: [{
                            id: 0,
                            content: optColumn.content.trim()
                        }],
                        name: optColumn.optionColumnName,
                        showOrder: optColumn.optionColumnId
                    });
                }
            });
            return values;
        };

        var buildStatusColumns = function (statusColumns) {
            var statusColumnsValues = [];
            angular.forEach($filter('orderBy')(statusColumns, 'showOrder'), function (statusColumn) {
                //check if statusColumn isEnum or not
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
                        }

                    });
                    statusColumnsValues.push({
                        id: statusColumn.id,
                        value: name,
                        valueId: valueId,
                        isEnum: statusColumn.isEnum
                    });
                } else {
                    statusColumnsValues.push({
                        id: statusColumn.id,
                        value: '',
                        isEnum: statusColumn.isEnum
                    });
                }

            });

            return statusColumnsValues;
        };

        $scope.buildRequirements = function () {
            // this is the same for every requirement. It can therefore be called once.
            var statusColumnsValues = buildStatusColumns($scope.statusColumns);

            angular.forEach($scope.requirementSkeletons, function (requirementCategory) {
                var lastElementOrder = 0;
                angular.forEach(requirementCategory.requirements, function (requirement) {
                    var values = buildReqOptContents(requirement.optionColumnContents);
                    $scope.fillEmptyOpts(values, $scope.optColumns);
                    $scope.requirements.push({
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
			collectionInstances: requirement.collectionInstances,    
                        tickets: [],
                        // linkStatus : {enableTooltip : true, link: true},
                        linkStatus: {
                            link: true,
                            ticketStatus: []
                        },
                        statusColumns: angular.copy(statusColumnsValues, []),
                        selected: false
                    });

                    $scope.filterCategory.push({
                        id: requirementCategory.id,
                        showOrder: requirementCategory.showOrder,
                        label: requirementCategory.name
                    });
                    $scope.filterCategory = $scope.unique($scope.filterCategory);
                    if (requirement.showOrder > lastElementOrder) {
                        lastElementOrder = requirement.showOrder;
                    }
                });
                //set a lastElemOrder property. Which is the biggest order of the requirements in this category.
                if ($scope.filterCategory.length > 0) {
                    var lastObject = $scope.filterCategory.pop();
                    lastObject.lastElemOrder = lastElementOrder;
                    $scope.filterCategory.push(lastObject);
                }
            });

            $scope.filterCategory = $filter('orderBy')($scope.filterCategory, 'showOrder');

            if ($scope.systemSettings.oldRequirements !== undefined) {
                var retOld = $scope.systemSettings.oldRequirements;
                var retNew = $scope.requirements;
                $scope.requirements = retOld;
                $scope.mergeUpdatedRequirements(retNew, true, false);
                //$scope.mergeOldAndNewRequirements();
            }

            $scope.finishProgressbar();

            //do a initial localBackup
            $scope.onTimeout();
            $scope.promiseForStorage = $interval($scope.onTimeout, 60000);
            $scope.length = $scope.requirementSkeletons.length;

	    $scope.filterCollectionInstances();

        };

	$scope.filterCollectionInstances = function () {
            angular.forEach($scope.requirements, function (requirement) {
               var cols = [];
               angular.forEach(requirement.collectionInstances, function (col) {
                  angular.forEach($scope.systemSettings.colls, function (settingCol) {
                     angular.forEach(settingCol.values, function (colType) {
                       if(col.name === colType.type) {
                          cols.push({name: col.name, showOrder: col.showOrder});
                       }
                     });
                  });
                });
                requirement.collectionInstances = cols;
            });
        };

        $scope.mergeOldAndNewRequirements = function () {
            var custReq = [];
            angular.forEach($scope.systemSettings.oldRequirements, function (oldRequirement) {
                angular.forEach($scope.requirements, function (newRequirement) {
                    if (oldRequirement.id === newRequirement.id) {
                        newRequirement.optionColumns = oldRequirement.optionColumns;
                        newRequirement.statusColumns = oldRequirement.statusColumns;
                        newRequirement.tickets = oldRequirement.tickets;
                    }
                });
                if ((oldRequirement.shortName.indexOf(appConfig.customRequirement) >= 0) && (oldRequirement.id >= 10000)) {
                    custReq.push(oldRequirement);
                }
                angular.forEach(oldRequirement.optionColumns, function (optColumn) {
                    angular.forEach(optColumn.content, function (content) {
                        if (content.setId !== undefined) {
                            if ($scope.selectedAlternativeSets.indexOf(content.setId) === -1) {
                                $scope.selectedAlternativeSets.push(content.setId);
                            }
                        }
                    });
                });
            });
            //check if a new requirement was added and an alternativeSet is selected. Add the alternativeSet text to the optColumn
            angular.forEach($scope.requirements, function (newRequirement) {
                if (!$scope.searchRequirementInArray(newRequirement, $scope.systemSettings.oldRequirements)) {
                    angular.forEach($scope.alternativeSets, function (sets) {
                        angular.forEach(sets.alternativeSets, function (set) {
                            angular.forEach(set.alternativeInstances, function (instance) {
                                if (instance.requirementId === newRequirement.id) {
                                    angular.forEach($scope.selectedAlternativeSets, function (selectedAlternative) {
                                        if (selectedAlternative === set.id) {
                                            angular.forEach(newRequirement.optionColumns, function (optColumn) {
                                                if (optColumn.showOrder === set.optColumnId) {
                                                    optColumn.content.push({
                                                        id: instance.id,
                                                        setId: set.id,
                                                        content: '**' + set.name + '**\n\n' + instance.content,
                                                    });
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

            if (custReq.length !== 0) {
                angular.forEach(custReq, function (customRequirement) {
                    $scope.requirements.push(customRequirement);
                });
                $scope.getCustomRequirements();
            }
            $scope.getAlternativeSets();
        };

        $scope.unique = function (objectsArray) {
            var newarr = [];
            var unique = {};
            angular.forEach(objectsArray, function (item) {
                if (!unique[item.label]) {
                    newarr.push(item);
                    unique[item.label] = item;
                }
            });
            return newarr;
        };

        $scope.searchObjectKey = function (search, object) {
            var bool = false;
            angular.forEach(object, function (obj) {
                if (obj.hasOwnProperty(search)) {
                    bool = true;
                }
            });
            return bool;
        };

        $scope.searchObjectbyValue = function (search, object) {
            var bool = false;
            angular.forEach(object, function (value, key) {
                if (value === search) {
                    bool = true;
                }
            });
            return bool;
        };

        $scope.searchRequirementInArray = function (requirement, array) {
            var bool = false;
            angular.forEach(array, function (req) {
                if (req.id === requirement.id) {
                    bool = true;
                }
            });
            return bool;
        };

        $scope.fillEmptyOpts = function (searchObj, object) {
            var id = null;
            angular.forEach(object, function (obj) {
                angular.forEach(obj, function (value, key) {
                    if (key === 'id') {
                        id = value;
                    }
                    if (key === 'name') {
                        if ((!Helper.searchArrayByValue(value, searchObj))) {
                            searchObj.push({
                                content: [{
                                    id: 0,
                                    content: ' '
                                }],
                                name: value,
                                'showOrder': id
                            });
                        }
                    }
                });
            });
        };

        $scope.buildSettings = function () {
            var collections = [];
            var projecttypes = [];
            angular.forEach($scope.systemSettings.colls, function (collection) {
                angular.forEach(collection.values, function (value) {
                    collections.push(value.collectionInstanceId);
                });
            });

            angular.forEach($scope.systemSettings.project, function (project) {
                projecttypes.push(project.projectTypeId);
            });
            angular.extend($scope.requirementsSettings, {
                collections: collections,
                projectTypes: projecttypes
            });
        };

        $scope.filterRequirements = function () {
            var requirements = $filter('filterUpdates')($scope.requirements, $scope.updateProperties.updatedReqs);
            requirements = $filter('filterByTags')(requirements, $scope.filteredRequirementsByTags);
            requirements = $filter('filterByCategories')(requirements, $scope.selectedCategory);
            requirements = $filter('filter')(requirements, {
                shortName: $scope.textFilters.shortName,
                description: $scope.textFilters.description
            });
            requirements = $filter('filterByStatus')(requirements, $scope.selectedStatusColumn, $scope.statusColumns);
            requirements = $filter('filterTicketStatus')(requirements, $scope.jiraStatus.selectedStatus);
            requirements = $filter('filter')(requirements, $scope.search);
            requirements = $filter('filterOptColumnByText')(requirements, $scope.textFilters.optColumns, $scope.optColumns);
            requirements = $filter('filterStatusColumnByText')(requirements, $scope.textFilters.statusColumns, $scope.statusColumns);

            return requirements;
        };

        $scope.updateRequirements = function () {
            var requestString = '';
            angular.forEach($scope.requirementsSettings, function (value, key) {
                requestString += key + '=' + value + '&';
            });
            //Remove trailing &
            requestString = requestString.slice(0, -1);
            apiFactory.getByQuery('categoriesWithRequirements', 'filter', requestString).then(
                function (categoriesWithRequirements) {
                    $scope.buildUpdatedRequirements(categoriesWithRequirements);
                },
                function () { });
        };

        $scope.buildUpdatedRequirements = function (skeletons) {
            var updatedRequirements = [];
            // this is the same for every requirement. It can therefore be called once.
            var statusColumnsValues = buildStatusColumns($scope.statusColumns);

            angular.forEach(skeletons, function (requirementCategory) {
                angular.forEach(requirementCategory.requirements, function (requirement) {
                    var values = buildReqOptContents(requirement.optionColumnContents);
                    $scope.fillEmptyOpts(values, $scope.optColumns);
                    updatedRequirements.push({
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
			collectionInstances: requirement.collectionInstances,
                        tickets: [],
                        // linkStatus : {enableTooltip: true, link:true},
                        linkStatus: {
                            link: true,
                            ticketStatus: []
                        },
                        statusColumns: angular.copy(statusColumnsValues, []),
                        selected: false,
                        isNew: false,
                        isOld: false,
                        applyUpdate: ' '
                    });
                });

            });
            $scope.mergeUpdatedRequirements(updatedRequirements, false, true);
        };

        function markChangeInRequirement(requirementToInsert, oldRequirement, changedSettings, afterImport) {
            angular.extend(requirementToInsert, {
                isNew: true,
                isOld: false,
                needsUpdate: true
            });
            angular.extend(oldRequirement, {
                needsUpdate: true,
                oldCategoryId: oldRequirement.categoryId,
                oldCategoryName: oldRequirement.category,
                oldCategoryOrder: oldRequirement.categoryOrder,
                oldOrder: oldRequirement.order
            });
            oldRequirement.categoryId = requirementToInsert.categoryId;
            oldRequirement.category = requirementToInsert.category;
            oldRequirement.categoryOrder = requirementToInsert.categoryOrder;
            oldRequirement.order = requirementToInsert.order;
            requirementToInsert.statusColumns = oldRequirement.statusColumns;
            requirementToInsert.tickets = oldRequirement.tickets;
            requirementToInsert.linkStatus = oldRequirement.linkStatus;
            // $scope.updateProperties.updatesCounter++;
            $scope.updateCounter++;

            $scope.updateProperties.updatesAvailable = true;
        }

        function setDefaultDiff(reqs) {
            angular.forEach(reqs, function (oldRequirement) {
                oldRequirement.diffShortName = oldRequirement.shortName;
                oldRequirement.diffDescription = oldRequirement.description;
                angular.forEach(oldRequirement.optionColumns, function (optColumn) {
                    angular.forEach(optColumn.content, function (content) {
                        content.diffContent = content.content;
                    });
                });
            });
        }
        function removeSpacesFromString(inputString) {
            var result = inputString;
            if (inputString) {
                result = inputString.replace(/[^\x20-\x7E]|\s+/gmi, '')
            }
            return result;
        }

        $scope.mergeUpdatedRequirements = function (updatedRequirements, changedSettings, afterImport) {
            $scope.updateCounter = 0;
            $scope.newCounter = 0;
            $scope.deletedCounter = 0;
            $scope.newRequirements = [];
            var onlyNewRequirements = [];
            // $scope.oldRequirements = [];
            var newOptColumnMessage = 'The optional column(s) ';
            var newOptColumns = [];
            setDefaultDiff($scope.requirements);
            // Adds new categories to the category filter array
            angular.forEach(updatedRequirements, function (newRequirement) {
                if (($filter('filter')($scope.filterCategory, {
                    id: newRequirement.categoryId
                }, true)).length === 0) {
                    $scope.filterCategory.push({
                        id: newRequirement.categoryId,
                        showOrder: newRequirement.categoryOrder,
                        label: newRequirement.category,
                        isNew: true
                    });
                }
                var requirementToInsert = {};
                var foundOne = false;

                // initial the diffs properties in the new requirement
                newRequirement.diffShortName = newRequirement.shortName;
                newRequirement.diffDescription = newRequirement.description;
                angular.forEach(newRequirement.optionColumns, function (optColumn) {
                    angular.forEach(optColumn.content, function (content) {
                        content.diffContent = content.content;
                    });
                });
                for (var i = 0; i < $scope.requirements.length; i++) {
                    // $scope.requirements[i].linkStatus = {enableTooltip : true, link: true};
                    if (angular.isDefined($scope.requirements[i].linkStatus)) {
                        $scope.requirements[i].linkStatus.link = true;
                        if (angular.isUndefined($scope.requirements[i].linkStatus.ticketStatus)) {
                            $scope.requirements[i].linkStatus.ticketStatus = [];
                        }
                    } else {
                        // if not defined creates and initialise the linkStatus object.
                        $scope.requirements[i].linkStatus = {
                            link: true,
                            ticketStatus: []
                        };
                    }

                    if ($scope.requirements[i].id === newRequirement.id) {
                        // updates category name is this was changed
                        // $scope.requirements[i].category = newRequirement.category;
                        // adds the taginstance ids
                        $scope.requirements[i].tagInstances = newRequirement.tagInstances;
                        var oldRequirement = $scope.requirements[i];

                        // search for new changes in shortname
                        if (oldRequirement.shortName !== newRequirement.shortName) {
                            var highlightedChangesInShortName = diffString2(oldRequirement.shortName, newRequirement.shortName);
                            oldRequirement.diffShortName = highlightedChangesInShortName.o;
                            newRequirement.diffShortName = highlightedChangesInShortName.n;
                            requirementToInsert = newRequirement;
                            markChangeInRequirement(requirementToInsert, oldRequirement, changedSettings, afterImport);
                            $scope.requirements[i].markAsOld = true;
                            foundOne = true;
                        }

                        var atLeastOneDescriptionIsNotNull = !(newRequirement.description && oldRequirement.description)

                        // search for new changes in description
                        if (atLeastOneDescriptionIsNotNull ||
                            (removeSpacesFromString(newRequirement.description)
                                !== removeSpacesFromString(oldRequirement.description))) {
                            var changes = diffString2(oldRequirement.description, newRequirement.description);
                            // saves the highlighted changes in diffDescription property to prevent this from been shown when not needed.
                            oldRequirement.diffDescription = changes.o;
                            newRequirement.diffDescription = changes.n;

                            requirementToInsert = newRequirement;
                            if (!foundOne) {
                                markChangeInRequirement(requirementToInsert, oldRequirement, changedSettings, afterImport);
                                $scope.requirements[i].markAsOld = true;
                                foundOne = true;
                            }
                        }
                        //search for new changes in optionColumns
                        angular.forEach(newRequirement.optionColumns, function (newRequirementOptColumns) {
                            var optColumnFound = false;
                            for (var j = 0; j < oldRequirement.optionColumns.length; j++) {
                                if (oldRequirement.optionColumns[j].showOrder === newRequirementOptColumns.showOrder) {
                                    optColumnFound = true;
                                    var oldRequirementOptColumns = oldRequirement.optionColumns[j];
                                    angular.forEach(newRequirementOptColumns.content, function (newRequirementContent) {
                                        angular.forEach(oldRequirementOptColumns.content, function (oldRequirementContent) {
                                            if ((newRequirementContent.id === oldRequirementContent.id) &&
                                                (newRequirementContent.content.replace(/[^\x20-\x7E]|\s+/gmi, '')
                                                    !== oldRequirementContent.content.replace(/[^\x20-\x7E]|\s+/gmi, ''))) {
                                                var changes = diffString2(oldRequirementContent.content, newRequirementContent.content);
                                                oldRequirementContent.diffContent = changes.o.replace(/\x60/gmi, '');
                                                newRequirementContent.diffContent = changes.n.replace(/\x60/gmi, '');
                                                requirementToInsert = newRequirement;
                                                if (!foundOne) {
                                                    markChangeInRequirement(requirementToInsert, oldRequirement, changedSettings, afterImport);
                                                    $scope.requirements[i].markAsOld = true;
                                                    foundOne = true;
                                                }
                                                //the old requirement has alternative Sets, so we need to push them into the new one
                                                if (oldRequirementOptColumns.content.length > 1) {
                                                    angular.forEach(requirementToInsert.optionColumns, function (requirementToInsertOptColumns) {
                                                        angular.forEach(oldRequirementOptColumns.content, function (oldRequirementOptColumnsContent) {
                                                            if (oldRequirementOptColumnsContent.id > 0 &&
                                                                (requirementToInsertOptColumns.showOrder === oldRequirementOptColumns.showOrder)) {
                                                                requirementToInsertOptColumns.content.push(oldRequirementOptColumnsContent);
                                                            }
                                                        });
                                                    });
                                                }
                                            }
                                        });
                                    });
                                    break;
                                }
                            }
                            if (!optColumnFound) {
                                if ($filter('filter')(newOptColumns, newRequirementOptColumns.name).length === 0) {
                                    newOptColumns.push(newRequirementOptColumns.name);
                                }
                                oldRequirement.optionColumns.push(newRequirementOptColumns);
                                $scope.requirementProperties.requirementsEdited = true;
                                $scope.requirementProperties.newColumn.present = true;
                            }
                        });
                        // }
                        break;
                    }
                    // });
                }

                // push the updated requirement to the newRequirements array in order to differentiate the change settings from updates functionality.
                if (foundOne) {
                    $scope.newRequirements.push(requirementToInsert);
                }

                //a new requirement was added
                if (!$scope.searchRequirementInArray(newRequirement, $scope.requirements)) {
                    //if the user changed the settings we do not need to let him apply the updates for new requirements
                    if (changedSettings) {
                        angular.extend(newRequirement, {
                            isNew: false,
                            isOld: false
                        });
                        $scope.requirements.push(newRequirement);
                        // this is just needed to display information to the new requirements in modal.
                        onlyNewRequirements.push(newRequirement);
                        $scope.newCounter++;
                    } else if (afterImport) {
                        angular.extend(newRequirement, {
                            isNew: true,
                            isOld: false,
                            needsUpdate: true
                        });
                        $scope.newRequirements.push(newRequirement);
                        $scope.updateProperties.updatesAvailable = true;
                        $scope.newCounter++;
                    }
                }
            });
            if (newOptColumns.length > 0) {
                newOptColumnMessage += '**' + newOptColumns.toString() + '** was/were added. Please save the current state.';
                $scope.requirementProperties.newColumn.alertMessages.push(newOptColumnMessage);
            }

            //checks if an old requirement was removed, so we need to reiterate through the new requirements
            $scope.deletedReqs = [];
            // reverse iteration so that change in array lenght does not affect the result
            for (var idx = $scope.requirements.length - 1; idx >= 0; idx--) {
                var oldRequirement = $scope.requirements[idx];

                // check for requirement with id less than 10000 is to avoid removing custom requirements from the scope.
                if (!$scope.searchRequirementInArray(oldRequirement, updatedRequirements) && oldRequirement.id < 10000) {
                    $scope.deletedReqs.push(oldRequirement);
                    if (changedSettings) {
                        $scope.requirements.splice(idx, 1);
                    } else {
                        $scope.updateProperties.updatesAvailable = true;
                    }
                    $scope.deletedCounter++;
                }
            }
            if (changedSettings) {
                var message = '';
                if ($scope.newCounter === 0 && $scope.deletedCounter === 0) {
                    message = 'No Updates were found. All your requirements are up to date.';
                    SDLCToolExceptionService.showWarning('Change settings and update requirements successful', message, SDLCToolExceptionService.SUCCESS);
                } else {
                    message = 'Summary:<ul><li> ' + $scope.newCounter + ' new requirement(s) were added</li><li>' + $scope.deletedCounter + ' requirement(s) were removed</li></ul>';
                    if (onlyNewRequirements.length > 0) {
                        message += '<BR>The following requirement(s) were <font color=\'green\'>added</font>:<BR><BR><table class=\'table table-responsive\'><tr><th>Short Name</th><th>Description</th></tr>';
                        angular.forEach($filter('orderBy')(onlyNewRequirements, ['categoryOrder', 'order']), function (req) {
                            message += '<tr><td>' + req.shortName + '</td><td>' + req.description + '</td></tr>';
                        });
                        message += '</table>';
                    }
                    if ($scope.deletedReqs.length > 0) {
                        message += '<BR>The following requirement(s) were <font color=\'red\'>removed</font>:<BR><BR><table class=\'table table-responsive\'><tr><th>Short Name</th><th>Description</th></tr>';
                        angular.forEach($filter('orderBy')($scope.deletedReqs, ['categoryOrder', 'order']), function (req) {
                            message += '<tr><td>' + req.shortName + '</td><td>' + req.description + '</td></tr>';
                        });
                        message += '</table>';
                    }
                    // reinitialise this array so it should not affect the updates functionality.
                    // this is because, these requirements have already been removed from the requirements object.
                    $scope.deletedReqs = [];
                    $scope.newCounter = 0;
                    SDLCToolExceptionService.showWarning('Change settings and update requirements successful', message, SDLCToolExceptionService.INFO);
                }
            }
            $scope.updateProperties.updatesCounter = $scope.updateCounter + $scope.newCounter;
        };

        $scope.updatesAvailableClicked = function () {

            angular.forEach($filter('filter')($scope.filterCategory, {
                isNew: true
            }), function (category) {
                delete category.isNew;
            });

            // temporary saves the requirements object in case the updates are canceled.
            $scope.backUpForUpdateCancelation = {
                requirements: [],
                updatesCounter: $scope.updateProperties.updatesCounter
            };
            angular.copy($scope.requirements, $scope.backUpForUpdateCancelation.requirements);
            //add the new requirements to the main array
            if ($scope.newRequirements.length > 0) {
                angular.forEach($scope.newRequirements, function (newRequirement) {
                    newRequirement.updateTooltip = 'New requirement in the SecurityRAT database';
                    // makes a copy before adding. When this is not done
                    // Case 1: Update process can be started and object in changed and afterwards the process is reverted.
                    $scope.requirements.push(angular.extend({}, newRequirement));
                });
                $scope.updateProperties.updatedReqs = true;
            }

            // var oldRequirements = $filter('filter')($scope.requirements, {markAsOld: true});
            if ($filter('filter')($scope.requirements, {
                markAsOld: true
            }).length > 0) {
                angular.forEach($filter('filter')($scope.requirements, {
                    markAsOld: true
                }), function (oldRequirement) {
                    oldRequirement.isOld = true;
                    oldRequirement.updateTooltip = 'Obsolete requirement in your YAML file';
                });
            }
            var message = '';
            if ($scope.deletedReqs.length > 0) {
                // must be done since the decision is now made by the user.
                $scope.updateProperties.updatesCounter += $scope.deletedReqs.length;
                angular.forEach($scope.deletedReqs, function (deleteRequirement) {
                    // var idx = $scope.requirements.indexOf(deleteRequirement);
                    for (var k = 0; k < $scope.requirements.length; k++) {

                        var requirement = $scope.requirements[k];

                        if (requirement.id === deleteRequirement.id) {
                            requirement.isOld = true;
                            requirement.toBeRemoved = true;
                            requirement.needsUpdate = true;
                            requirement.updateTooltip = 'Obsolete requirement in your YAML file';
                            break;
                        }

                    }
                });
                $scope.updateProperties.updatedReqs = true;
            }
            // don't check for $scope.deletedCounter === 0 since these obsolete requirements are not deleted. The choice is left in the hands of the user.
            if ($scope.updateProperties.updatesCounter === 0 && $scope.newCounter === 0) {
                SDLCToolExceptionService.showWarning('Update requirements successful', 'No Updates were found. All your requirements are up to date.', SDLCToolExceptionService.SUCCESS);
            } else if ($scope.updateProperties.updatesCounter > 0) {

                message = 'Summary:<ul><li>' + $scope.updateCounter + ' requirement(s) updates were found</li><li> ' + $scope.newCounter + ' new requirement(s) were found</li><li> ' + $scope.deletedReqs.length + ' removable requirement(s) were found.</li></ul><BR>You can now review the updates. ' +
                    'The obsolete requirement is marked in <span style=\'background-color:rgb(255, 204, 204);\'>light red</span> and the new requirement in <span style=\'background-color:rgb(204, 255, 204);\'>light green</span>' +
                    ' Please accept the change by clicking on the <button class=\'btn btn-success\'>' +
                    '<span class=\'glyphicon glyphicon-ok\'></span></button> button to keep the new requirement or by clicking on the <button class=\'btn btn-danger\'><span class=\'glyphicon glyphicon-remove\'></span></button> ' +
                    'to keep the obsolete requirement.';
                SDLCToolExceptionService.showWarning('Update requirements successful', message, SDLCToolExceptionService.INFO);
            }
        };

        $scope.revertUpdates = function () {
            $scope.updateProperties.updatedReqs = false;
            $scope.requirements = [];
            angular.copy($scope.backUpForUpdateCancelation.requirements, $scope.requirements);
            $scope.updateProperties.updatesCounter = $scope.backUpForUpdateCancelation.updatesCounter;
            $scope.backUpForUpdateCancelation = {};
            // updates changes reverted means not changes are to be saved.
            $scope.requirementProperties.requirementsEdited = false;
            // delete $scope.tempSavedRequirements;
        };

        $scope.acceptAllUpdates = function () {
            var requirements = angular.copy($scope.requirements);
            for (var i = 0; i < requirements.length; i++) {
                var requirement = requirements[i];
                if (requirement.isNew !== undefined && requirement.isNew) {
                    $scope.applyChanges(requirement.id, true);
                } else if (requirement.toBeRemoved !== undefined && requirement.toBeRemoved) {
                    $scope.applyChanges(requirement.id, false);
                }
            }
        }

        /* jshint loopfunc: true */
        $scope.applyChanges = function (reqId, keepNewOne) {
            // defined whether the user's choice has been finally applied in the object.
            var decisionMade = false;
            for (var i = $scope.requirements.length - 1; i >= 0; i--) {
                var requirement = $scope.requirements[i];
                //keep new one
                if (requirement.id === reqId && keepNewOne && !requirement.isNew && angular.isUndefined(requirement.toBeRemoved)) {
                    requirement.updateTooltip = '';

                    $scope.requirements.splice(i, 1);
                    if (!decisionMade) {
                        $scope.updateProperties.updatesCounter--;
                    }
                    $scope.requirementProperties.requirementsEdited = true;
                    decisionMade = true;
                } else if (requirement.id === reqId && !keepNewOne && (requirement.isNew || requirement.toBeRemoved)) {
                    // new changes declined -> remove new requirement element from array
                    requirement.updateTooltip = '';

                    $scope.requirements.splice(i, 1);
                    if (!decisionMade) {
                        $scope.updateProperties.updatesCounter--;
                    }
                    decisionMade = true;
                } else if (requirement.id === reqId && keepNewOne && (requirement.isNew || requirement.toBeRemoved)) {
                    // new changes accepted -> remove green background from new one
                    requirement.isNew = false;
                    requirement.updateTooltip = '';

                    requirement.toBeRemoved = false;
                    requirement.isOld = false; // for requirement with toBeRemoved == true
                    requirement.needsUpdate = false;
                    requirement.applyUpdate = ' ';
                    if (!decisionMade) {
                        $scope.requirementProperties.requirementsEdited = true;
                        $scope.updateProperties.updatesCounter--;
                    }
                    // makes sure the updatesCounter is not decremented more than once for a requirement
                    decisionMade = true;
                } else if (requirement.id === reqId && !keepNewOne && !requirement.isNew) {
                    // new changes declined -> keep obsolete by removing red background from old one
                    requirement.updateTooltip = '';
                    requirement.isOld = false;
                    requirement.toBeRemoved = false; // for requirement with toBeRemoved == true
                    requirement.needsUpdate = false;
                    if (requirement.oldOrder) {
                        requirement.order = requirement.oldOrder;
                        delete requirement.oldOrder;
                    }
                    if (requirement.oldCategoryId) {
                        // revert category update
                        requirement.categoryId = requirement.oldCategoryId;
                        requirement.category = requirement.oldCategoryName;
                        requirement.categoryOrder = requirement.oldCategoryOrder;
                        delete requirement.oldCategoryName;
                        delete requirement.oldCategoryId;
                        delete requirement.oldCategoryOrder;
                    }
                }
            }
            //Dirty hack for the weird case if ticket column is available, the green color is not removed by the code above
            angular.forEach($scope.requirements, function (requirement) {
                if ((requirement.isNew) && (requirement.id === reqId)) {
                    requirement.isNew = false;
                    requirement.needsUpdate = false;
                    requirement.applyUpdate = ' ';
                    if (!decisionMade) {
                        $scope.requirementProperties.requirementsEdited = true;
                        $scope.updateProperties.updatesCounter--;
                    }
                }
            });
            if ($scope.updateProperties.updatesCounter <= 0) {
                $scope.updateProperties.updatedReqs = false;
                $scope.updateProperties.updatesAvailable = false;
                // deletes the temporary saved requirement set from the $scope object.
                $scope.backUpForUpdateCancelation = {};
            }
        };
        // removes space and invalid file name characters from file name.
        $scope.removeUnwantedChars = function (str, invalidChars) {
            for (var i = 0; i < invalidChars.length; i++) {
                str = str.replace(invalidChars[i], '');
            }
            var strTemp = str.split(' ');
            str = '';
            for (var j = 0; j < strTemp.length; j++) {
                if (j > 0) {
                    str += '_';
                }
                str += strTemp[j];
            }
            return str;
        };
        // create the presentation page.
        $scope.exportPTT = function () {
            $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/presentation/configuration/config-modal.html',
                controller: 'EditPresentation',
                resolve: {
                    entity: function () {
                        var entity = {};
                        entity.requirements = angular.copy($filter('orderBy')($filter('filter')($scope.requirements, {
                            selected: true
                        }), ['categoryOrder', 'order']));
                        entity.optionColumns = angular.copy($filter('orderBy')($scope.optColumns, ['showOrder']));
                        entity.statusColumns = angular.copy($filter('orderBy')($scope.statusColumns, ['showOrder']));
                        entity.artifactName = $scope.systemSettings.name;
                        return entity;
                    }
                }
            });
        };

        $scope.excelToggle = function (opened, backToMain) {
            if (angular.isDefined(opened) && !opened) {
                $scope.withselectedDropdown.toggleExcel = false;
            } else if (angular.isUndefined(opened)) {
                $scope.withselectedDropdown.toggleExcel = true;
            }
        };

        $scope.configExcel = function () {
            // if($filter('filter')($scope.statusColumns))
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/excel/excel.config.html',
                controller: 'EditExcel',
                resolve: {}
            });
            modalInstance.result.then(function (config) {
                $scope.exportExcel(config.statusValues);
            });
        };

        $scope.exportExcel = function (withStatusColumns) {
            $scope.withselectedDropdown.toggleExcel = false;
            $scope.withselectedDropdown.isopen = false;
            var wsName = $scope.removeUnwantedChars($scope.systemSettings.name, ['[', ']', '\'', ':', '*', '?', '|', '/', '\\', ':', '*',]);
            wsName = wsName.replace('&', '&amp;');
            var wsName1 = 'dropdown';
            var dropdownList = [];
            var statusCounter = 0;
            for (var i = 0; i < $scope.statusColumns.length; i++) {
                if ($scope.statusColumns[i].isEnum) {
                    dropdownList[statusCounter] = {};
                    dropdownList[statusCounter].values = [];
                    dropdownList[statusCounter].values = $scope.statusColumns[i].values;
                    dropdownList[statusCounter].statusname = $scope.statusColumns[i].name;
                    statusCounter++;
                }
            }
            var colspan = $scope.optColumns.length + $scope.statusColumns.length + 4;
            var ws = $scope.buildExcelFile("foo","bar");
		//var ws = $scope.buildExcelFile(colspan, withStatusColumns);
	    var wscols = [{
                wch: 20
            }, // width of column category
            {
                wch: 12
            }, // width of column Short name
            {
                wch: 45
            }
            ]; // width of column description
            //        var wsrows = [{}]
            angular.forEach($scope.optColumns, function () {
                wscols.push({
                    wch: 50
                });
            });
            angular.forEach($scope.statusColumns, function () {
                wscols.push({
                    wch: 10
                });
            });
            //var wb = new Workbook();
	    var wb = XLSX.utils.book_new();
            wb.SheetNames.push(wsName);
            wb.Sheets[wsName] = ws;

            if (dropdownList.length > 0) {
                wb.SheetNames.push(wsName1);
                // in case there are no statuscolumns of type enum.
                //wb.Sheets[wsName1] = $scope.buildDropdownList(dropdownList);
            }
            //sets the columns width.
            ws['!cols'] = wscols;
            var wbopts = {
                bookType: 'xlsx',
                bookSST: false,
                type: 'binary'
            };
	    console.log(XLSX.version);
	    console.log(wb);
            /*var foo = XLSX.utils.book_new();
	    var opts = {
                bookType: 'xlsx',
                bookSST: false,
                type: 'binary'
            };
	    foo.SheetNames.push(wsName);
            foo.Sheets[wsName] = ws; 
	    console.log(ws);
	    var out = XLSX.write(foo, opts);*/
            var wbout = XLSX.write(wb, wbopts);
            if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
                window.open('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;base64,' + window.btoa(wbout), '', 'width=300,height=150');
            } else {
                saveAs(new Blob([s2ab(wbout)], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet ;charset=utf-8'
                }), appConfig.filenamePrefix + '_' + $scope.removeUnwantedChars($scope.systemSettings.name, ['/', '\\', ':', '*', '?', '\'', '<', '>', '|', '.']) + '_' + Helper.getCurrentDate() + '.xlsx');
            }
        };

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        }

        // adjust the invalid excel syntax symbols to prevent errors on opening the generated excel file.
        $scope.adjustExcelSyntaxSymbols = function (str) {
            var syntaxSymbol = ['&', ':', '*', '?', '|'];
            for (var i = 0; i < syntaxSymbol.length; i++) {
                str = str.replace(syntaxSymbol[i], '\'' + syntaxSymbol[i]);
            }
            return str;
        };

        // workbook object
        function Workbook() {
            if (!(this instanceof Workbook)) {
                return new Workbook();
            }
            this.SheetNames = [];
            this.Sheets = {};
        }
        //builds the array with the requirement values for the excel export.
        $scope.reproduceTable = function (withStatusColumn) {
            var titleSelector = ['collectionInstances', 'category', 'shortName', 'description'];
            var requirements = $filter('orderBy')($filter('filter')($scope.requirements, {
                selected: true
            }), ['categoryOrder', 'order']);
            var counter = 0;
            var format = {
                fontId: 1,
                xfinnertags: [{
                    alignment: {
                        horizontal: 'center'
                    },
                    name: 'alignment'
                }]
            };
            $scope.tableArray[counter] = [{
                value: $scope.systemSettings.name,
                format: {
                    fontId: 2
                }
            }, {
                value: null
            }, {
                value: null
            }, {
                value: Helper.getCurrentDate(),
                format: {
                    fontId: 2,
                    xfinnertags: [{
                        alignment: {
                            horizontal: 'right'
                        },
                        name: 'alignment'
                    }]
                }
            }];
            counter++;
            $scope.tableArray[counter] = [];
            counter++;
            $scope.tableArray[counter] = [];
            ['Pattern', 'Control', 'Short name', 'Description'].forEach(function (element) {
                if (angular.equals(element, 'Description')) {
                    $scope.tableArray[counter].push({
                        value: element,
                        format: {
                            fontId: 1,
                            xfinnertags: [{
                                alignment: {
                                    wrapText: '1'
                                },
                                name: 'alignment'
                            }]
                        }
                    });
                } else {
                    $scope.tableArray[counter].push({
                        value: element,
                        format: format
                    });
                }
            });
            angular.forEach($filter('orderBy')($scope.optColumns, ['showOrder']), function (optColumn) {
                $scope.tableArray[counter].push({
                    value: optColumn.name,
                    format: format
                });
            });
            angular.forEach($filter('orderBy')($scope.statusColumns, ['showOrder']), function (statColumn) {
                if (statColumn.isEnum) {
                    $scope.tableArray[counter].push({
                        value: statColumn.name,
                        comment: 'statusColumn',
                        format: format
                    });
                } else {
                    $scope.tableArray[counter].push({
                        value: statColumn.name,
                        format: format
                    });
                }
            });

            angular.forEach(requirements, function (requirement) {
                counter++;
                $scope.tableArray[counter] = [];
                for (var i = 0; i < titleSelector.length; i++) {
		    if (titleSelector[i] === 'collectionInstances') {
                      var name = "";
                      angular.forEach($filter('orderBy')(requirement.collectionInstances, ['showOrder']), function (colInstance) {
                          name += colInstance.name + " \n\n";
                       });	
                      $scope.tableArray[counter].push({
	                 value: name,
                         format: {
                           fontId: 0,
                           xfinnertags: [{
                                alignment: {
                                    wrapText: '1'
                                },
                                name: 'alignment'
                            }]
                         }
                      });
                    } else if (titleSelector[i] === 'collectionInstances') {
		      $scope.tableArray[counter].push({
                        value: requirement['Control'],
                        format: {
                            fontId: 0,
                            xfinnertags: [{
                              alignment: {
                                  wrapText: '1'
                              },
                              name: 'alignment'
                            }]
                        }
                      });
		    } else {
                      $scope.tableArray[counter].push({
                        value: requirement[titleSelector[i]],
                        format: {
                            fontId: 0,
                            xfinnertags: [{
                              alignment: {
                                  wrapText: '1'
                              },
                              name: 'alignment'
                            }]
                        }
                       });
                    }
	        }
                angular.forEach($filter('orderBy')(requirement.optionColumns, ['showOrder']), function (optColumn) {
                    var contentValue = '';
                    angular.forEach(optColumn.content, function (content) {
                        contentValue += content.content;
                    });
                    $scope.tableArray[counter].push({
                        value: Helper.removeMarkdown(contentValue, 'requirement'),
                        format: {
                            fontId: 0,
                            xfinnertags: [{
                                alignment: {
                                    wrapText: '1'
                                },
                                name: 'alignment'
                            }]
                        }
                    });
                });
                angular.forEach($filter('orderBy')(requirement.statusColumns, ['showOrder']), function (statColumn) {
                    if (withStatusColumn) {
                        $scope.tableArray[counter].push({
                            value: statColumn.value,
                            format: {
                                fontId: 0
                            }
                        });
                    } else {
                        $scope.tableArray[counter].push({
                            value: '',
                            format: {
                                fontId: 0
                            }
                        });
                    }

                });
            });
            counter++;
            return counter;
        };
        /* jshint camelcase: false */
        //creates the dropdowm list worksheet.
        $scope.buildDropdownList = function (table) {
            var excelFile = {};
            var range = {
                s: {
                    c: 10000000,
                    r: 10000000
                },
                e: {
                    c: 0,
                    r: 0
                }
            };
            for (var R = 0; R < table.length; R++) { // number of column
                for (var C = 0; C < table[R].values.length; C++) { //number of rows
                    if (range.s.r > C) {
                        range.s.r = C;
                    }
                    if (range.s.c > R) {
                        range.s.c = R;
                    }
                    if (range.e.r < C) {
                        range.e.r = C;
                    }
                    if (range.e.c < R) {
                        range.e.c = R;
                    }
                    var cell = {};
                    if (C === 0) {
                        angular.extend(cell, {
                            c: 'statusColumn ' + table[R].statusname,
                        });
                    }

                    //formats the title row.
                    angular.extend(cell, {
                        v: table[R].values[C].name,
                    });
                    if (cell.v === null) {
                        continue;
                    }
                    var cellRef = XLSX.utils.encode_cell({
                        c: R,
                        r: C
                    });

                    if (typeof cell.v === 'number') {
                        cell.t = 'n';
                    } else if (typeof cell.v === 'boolean') {
                        cell.t = 'b';
                    } else {
                        cell.t = 's';
                    }

                    excelFile[cellRef] = cell;
                }
            }
            
            if (range.s.c < 10000000) {
                excelFile['!ref'] = XLSX.utils.encode_range(range);
            }
            return excelFile;
	    //return ['foobar'];
        };

        //creates the requirement worksheet.
        $scope.buildExcelFile = function (colspan, withStatusColumn) {
            var row = $scope.reproduceTable(withStatusColumn);
            var excelFile = {};
            var range = {
                s: {
                    c: 10000000,
                    r: 10000000
                },
                e: {
                    c: 0,
                    r: 0
                }
            };
	    	
            for (var R = 0; R !== row; ++R) {
                for (var C = 0; C < colspan; C++) {
                    if (range.s.r > R) {
                        range.s.r = R;
                    }
                    if (range.s.c > C) {
                        range.s.c = C;
                    }
                    if (range.e.r < R) {
                        range.e.r = R;
                    }
                    if (range.e.c < C) {
                        range.e.c = C;
                    }
                    var cell = {};
                    if (angular.isUndefined($scope.tableArray[R][C])) {
                        continue;
                    }
                    //formats the title row.
                    angular.extend(cell, {
                        v: $scope.tableArray[R][C].value,
                    });
                    if (cell.v === null) {
                        continue;
                    }
                    angular.extend(cell, $scope.tableArray[R][C].format);
                    if (angular.isDefined($scope.tableArray[R][C].comment)) {
                        angular.extend(cell, {
                            c: $scope.tableArray[R][C].comment,
                        });
                    }
                    var cellRef = XLSX.utils.encode_cell({
                        c: C,
                        r: R
                    });

                    if (typeof cell.v === 'number') {
                        cell.t = 'n';
                    } else if (typeof cell.v === 'boolean') {
                        cell.t = 'b';
                    } else {
                        cell.t = 's';
                    }

                    excelFile[cellRef] = cell;
                }
            }
            if (range.s.c < 10000000) {
                excelFile['!ref'] = XLSX.utils.encode_range(range);
            }
            return excelFile;
        };

        $scope.createTicketReqs = function () {
            var exportRequirements = {};
            $scope.withselectedDropdown.isopen = false;
            angular.extend(exportRequirements, {
                name: $scope.systemSettings.name,
                ticket: $scope.ticket,
                projectType: $scope.systemSettings.project,
                collections: $scope.systemSettings.colls,
                generatedOn: $scope.generatedOn,
                lastChanged: Helper.getCurrentDate(),
                requirements: $scope.requirements,
                statusColumns: $scope.statusColumns,
                defaultJIRAHost: appConfig.defaultJIRAHost
            });
            sharedProperties.setProperty(exportRequirements);
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/export/createTicket.html',
                controller: 'ExportController'
            });
            modalInstance.result.then(function (jiraStatus) {
                if ($scope.jiraStatus.allStatus.length > 0) {
                    angular.forEach(jiraStatus.allStatus, function (newStatus) {
                        // eliminates duplicates.
                        if ($filter('filter')($scope.jiraStatus.allStatus, {
                            name: newStatus.name
                        }).length === 0) {
                            $scope.jiraStatus.allStatus.push(newStatus);
                        }
                    });
                } else {
                    $scope.jiraStatus.allStatus = jiraStatus.allStatus;
                    $scope.jiraStatus.allStatus.push({
                        name: 'No ticket'
                    });
                }

                $scope.disableSave(true);
                $scope.requirementProperties.hasIssueLinks = true;
            });
        };

        $scope.checkExistingTickets = function () {
            var exist = false;
            $scope.existingTickets = '';
            angular.forEach($filter('filter')($scope.requirements, {
                selected: true
            }), function (requirement) {
                if (angular.isDefined(requirement.tickets) && requirement.tickets.length > 0) {
                    if (!angular.equals($scope.existingTickets, '')) {
                        $scope.existingTickets += ', ';
                    }
                    $scope.existingTickets += requirement.shortName;
                    exist = true;
                }
            });
            return exist;
        };

        $scope.exportSystem = function () {
            var exportRequirements = {};
            angular.extend(exportRequirements, {
                name: $scope.systemSettings.name,
                ticket: $scope.ticket,
                projectType: $scope.systemSettings.project,
                collections: $scope.systemSettings.colls,
                generatedOn: $scope.generatedOn,
                lastChanged: Helper.getCurrentDate(),
                requirements: $scope.requirements,
                defaultJIRAUrl: appConfig.defaultJIRAQueueForYAML
            });
            sharedProperties.setProperty(exportRequirements);
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/export/export.html',
                controller: 'ExportController'
            });
            modalInstance.result.then(function (obj) {
                if (angular.isDefined(obj.ticket) && angular.isDefined(obj.ticket.url) && angular.isDefined(obj.ticket.key)) {
                    $scope.ticket.url = obj.ticket.url;
                    $scope.ticket.key = obj.ticket.key;
                    $window.document.title = $window.document.title.split(':')[0] + ': ' + $scope.ticket.key;
                }
                if (angular.isDefined(obj.hasReqTicket) && !obj.hasReqTicket) {
                    $scope.requirementProperties.hasIssueLinks = false;
                }
                $scope.disableSave(true);
                if (localStorageService.isSupported) {
                    localStorageService.remove(appConfig.localStorageKey);
                }
            });
        };

        $scope.onTimeout = function () {
            if (localStorageService.isSupported && $scope.requirementProperties.requirementsEdited
                && !$scope.updateProperties.updatedReqs) {
                var exportRequirements = $scope.buildYAMLFile();
                var doc = jsyaml.safeDump(exportRequirements);
                localStorageService.set(appConfig.localStorageKey, doc);
            }
        };

        $scope.buildYAMLFile = function () {

            var objectToExport = {
                name: $scope.systemSettings.name,
                ticket: $scope.ticket,
                projectType: $scope.systemSettings.project,
                collections: $scope.systemSettings.colls,
                generatedOn: $scope.generatedOn,
                lastChanged: Helper.getCurrentDate(),
                requirements: $scope.requirements

            };
            return Helper.buildYAMLFile(objectToExport);
        };

        // setting fixed position for ng-style
        $scope.setFixedPosition = function () {
            return {
                position: 'fixed',
                top: $scope.mouseY + 5,
                left: $scope.mouseX - 10
            };
        };

        $scope.pushCoordinates = function (event) {
            $scope.mouseX = event.clientX;
            $scope.mouseY = event.clientY;
        };

        $scope.routeChange = function (event, newUrl, oldUrl) {
            //Navigate to newUrl if the form isn't dirty
            if (!$scope.requirementProperties.requirementsEdited) {
                return;
            }

            $confirm({
                text: 'You have unsaved data. Are you sure you want to leave the page without saving?',
                title: 'Confirm',
                ok: 'Ignore Changes',
                cancel: 'Cancel'
            }, {
                templateUrl: 'scripts/app/editor/confirm-modal.html'
            })
                .then(function () {
                    $scope.onRouteChangeOff = '';
                    $scope.requirementProperties.requirementsEdited = false;
                    window.onbeforeunload = function (e) { };
                    window.location.href = $location.url(newUrl).hash();
                });

            //prevent navigation by default since we'll handle it
            //once the user selects a dialog option
            event.preventDefault();
            return;
        };

        $scope.startAutomatedTest = function () {
            var reqs = $filter('filter')($scope.requirements, {
                selected: true
            });
            $uibModal.open({
                templateUrl: 'scripts/app/editor/requirements/requirements-test.html',
                controller: 'TestRequirements',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    entity: function () {
                        return reqs;
                    }
                }
            }).result.then(function () { }, function () { });
        };

        /* jshint unused: false*/
        function onIssueLinkFailure(exception, mainTicket, remoteTicket) {
            var message = '';
            if (exception.status !== 500) {
                if (exception.errorException.opened.$$state.status === 0) {
                    exception.errorException.opened.$$state.value = false;
                    exception.errorException.opened.$$state.status = 1;
                }
                if (parseInt(exception.status) === 404) {
                    message = 'The issues could not be linked. This can occur when the issue linking between ' + mainTicket + ' and ' + remoteTicket + ' is disabled.';
                    SDLCToolExceptionService.showWarning('Issue link unsuccessful', message, SDLCToolExceptionService.DANGER);
                } else if (exception.status === 401) {
                    $scope.exportProperty.issuelink = 'permission';
                    message = 'The issues could not be linked. You do not have the permission to link issues.';
                    SDLCToolExceptionService.showWarning('Issue link unsuccessful', message, SDLCToolExceptionService.DANGER);
                }
            }
        }

        function onLinkRemoveFailure(exception) {
            if (exception.status !== 500) {
                if (parseInt(exception.status) === 404) {
                    var message = 'These issues are either not linked or the issue was not added by the SecurityRAT tool.';
                    SDLCToolExceptionService.showWarning('Removing issue link unsuccessful', message, SDLCToolExceptionService.DANGER);
                }
            }
        }

        $scope.cleanUpIssueLinking = function (req) {
            req.linkStatus.enableTooltip = false;
            req.tempTicket = '';
            // if(angular.isDefined(req.ticket) && req.ticket !== '') req.ticket = '';
            $scope.manageTicketProperty.sameTicketError = false;
            $scope.manageTicketProperty.jhError.show = false;
            authenticatorService.cancelPromises($scope.manageTicketProperty.promise);
            $scope.manageTicketProperty.spinnerProperty.showSpinner = false;
        };

        $scope.doIssueLinking = function (req, callbackFunction, ticket) {
            // reset the error handling properties.
            ticket = JiraService.buildJiraUrl(ticket);
            req.tempTicket = ticket;
            $scope.manageTicketProperty.error = false;
            $scope.manageTicketProperty.authenticationFailure = false;
            $scope.manageTicketProperty.jhError.show = false;
            $scope.manageTicketProperty.jhError.msg = '';
            if (angular.equals(ticket, $scope.ticket.url)) {
                $scope.manageTicketProperty.jhError.show = true;
                $scope.manageTicketProperty.jhError.msg = 'You cannot link a ticket to itself.';
            } else {
                $scope.manageTicketProperty.jhError.show = false;
                var remoteObjectInfo = {};
                var mainObjectInfo = {};
                mainObjectInfo.apiUrl = Helper.buildJiraUrl($scope.ticket.url.split('/'));
                mainObjectInfo.key = mainObjectInfo.apiUrl.ticketKey[0];
                mainObjectInfo.url = $scope.ticket.url;
                remoteObjectInfo.apiUrl = Helper.buildJiraUrl(ticket.split('/'));

                if (remoteObjectInfo.apiUrl.ticketKey.length === 1) {
                    $scope.manageTicketProperty.error = false;
                    remoteObjectInfo.key = remoteObjectInfo.apiUrl.ticketKey[0];
                    remoteObjectInfo.url = ticket;

                    $scope.manageTicketProperty.authenticatorProperty = {
                        url: $scope.ticket.url,
                        message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
                    };
                    $scope.manageTicketProperty.promise.derefer = $q.defer();

                    checkAuthentication.jiraAuth(JiraService.buildUrlCall('issueKey', mainObjectInfo.apiUrl), $scope.manageTicketProperty.authenticatorProperty,
                        $scope.manageTicketProperty.spinnerProperty, $scope.manageTicketProperty.promise).then(function (response) {
                            mainObjectInfo.fields = response.fields;
                            mainObjectInfo.key = response.key;
                            $scope.manageTicketProperty.authenticatorProperty = {
                                url: ticket,
                                message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
                            };
                            $scope.manageTicketProperty.promise.derefer = $q.defer();
                            // Checks authentication in case the provided ticket url is not from the same jira instance.
                            return Promise.all([response, checkAuthentication.jiraAuth(JiraService.buildUrlCall('issueKey', remoteObjectInfo.apiUrl), $scope.manageTicketProperty.authenticatorProperty,
                                $scope.manageTicketProperty.spinnerProperty, $scope.manageTicketProperty.promise)]);

                        }).then(function (responses) {
                            // $scope.manageTicketProperty.spinnerProperty.showSpinner = false;
                            remoteObjectInfo.key = responses[1].key;
                            remoteObjectInfo.fields = responses[1].fields;
                            // This is to prevent adding the link to the yaml file before 'add ticket' confirmation. issue #62

                            callbackFunction(req, mainObjectInfo, remoteObjectInfo, ticket);
                        }).catch(function (exception) {
                            if (exception.status === 503) {
                                $scope.manageTicketProperty.authenticationFailureMessage = 'Service is not available for the moment. Please try again later.';
                            } else if (exception.status === 404) {
                                $scope.manageTicketProperty.authenticationFailureMessage = 'The request to the issue tracker responded with 404 Not found. Please make sure that the given ticket exist.';
                            } else {
                                $scope.manageTicketProperty.authenticationFailureMessage = 'The authentication to the issue tracker was unsuccesful. Please make sure you have permission to see the specified issue';
                            }
                            $scope.manageTicketProperty.authenticationFailure = true;
                            $scope.manageTicketProperty.spinnerProperty.showSpinner = false;
                        });
                } else {
                    $scope.manageTicketProperty.error = true;
                }
            }
        };

        $scope.validateURLTicketValue = function (value) {
            return Helper.validateURLTicketValue(value);
        }

        $scope.addManualTicket = function (req, mainObjectInfo, remoteObjectInfo, ticket) {
            $scope.manageTicketProperty.spinnerProperty.showSpinner = true;
            // var ticketUrl = remoteObjectInfo.apiUrl.http + '//' + remoteObjectInfo.apiUrl.host + '/' + remoteObjectInfo.apiUrl.path.join('/') + '/' + remoteObjectInfo.key;

            // first check that the requirement is not already present.
            if (req.tickets.indexOf(ticket) === -1) {
                req.tickets.push(req.tempTicket);

                req.tempTicket = '';
                if (req.linkStatus.link) {
                    JiraService.addIssueLinks(mainObjectInfo, remoteObjectInfo).then(function () {
                        // req.linkStatus.enableTooltip = true
                        // req.linkStatus.summary = remoteObjectInfo.fields.summary;
                        $scope.manageTicketProperty.spinnerProperty.showSpinner = false;

                    }).catch(function (exception) {
                        $scope.manageTicketProperty.spinnerProperty.showSpinner = false;
                        onIssueLinkFailure(exception, mainObjectInfo.url, remoteObjectInfo.url);
                    });
                }
                var linkStatus = {
                    iconUrl: remoteObjectInfo.fields.status.iconUrl,
                    name: remoteObjectInfo.fields.status.name,
                    issueKey: remoteObjectInfo.key,
                    summary: remoteObjectInfo.fields.summary,
                    url: ticket
                    // summary: req.linkStatus.link ? null : remoteObjectInfo.fields.summary,
                    // enableTooltip : req.linkStatus.link ? false : true
                };
                req.linkStatus.ticketStatus.push(linkStatus);
                if ($scope.jiraStatus.allStatus.length === 0) {
                    $scope.jiraStatus.allStatus.push(linkStatus);
                    $scope.jiraStatus.allStatus.push({
                        name: 'No ticket'
                    });
                } else {
                    if ($filter('filter')($scope.jiraStatus.allStatus, {
                        name: linkStatus.name
                    }).length === 0) {
                        $scope.jiraStatus.allStatus.push(linkStatus);
                    }
                }
                var promise = JiraService.addAttachmentAndComment(mainObjectInfo, {
                    content: $scope.buildYAMLFile(),
                    artifactName: $scope.systemSettings.name,
                    errorHandlingProperty: $scope.manageTicketProperty
                });
                if (angular.isDefined(promise)) {
                    promise
                        .then(function () {
                            $scope.manageTicketProperty.spinnerProperty.showSpinner = false;
                            req.linkStatus.enableTooltip = false;
                            $scope.manageTicketProperty.jhError.show = false;
                        }).catch(function () {

                        });
                }
            } else {
                $scope.manageTicketProperty.jhError.show = true;
                $scope.manageTicketProperty.spinnerProperty.showSpinner = false;
                $scope.manageTicketProperty.jhError.msg = 'This ticket is already linked to this requirement. Please provide another one.';
            }


        };

        $scope.removeManualTicket = function (req, mainObjectInfo, remoteObjectInfo, ticket) {
            // remove status from list of possible ticket status to filter.
            if (($filter('filterTicketStatus')($scope.requirements, [remoteObjectInfo.fields.status])).length === 1) {
                for (var i = 0; i < $scope.jiraStatus.allStatus.length; i++) {
                    if ($scope.jiraStatus.allStatus[i].name === remoteObjectInfo.fields.status.name) {
                        $scope.jiraStatus.allStatus.splice(i, 1);
                    }
                }

            }
            if ($scope.jiraStatus.allStatus.length === 1) {
                if ($scope.jiraStatus.allStatus[0].name.toLowerCase() === 'no ticket') {
                    $scope.jiraStatus.allStatus = [];
                }
            }

            // remove appropriate ticket from array in requirement.
            var index = req.tickets.indexOf(ticket);
            req.tickets.splice(index, 1);

            for (var j = 0; j < req.linkStatus.ticketStatus.length; j++) {
                var element = req.linkStatus.ticketStatus[j];
                if (angular.equals(element.url, ticket)) {
                    req.linkStatus.ticketStatus.splice(j, 1);
                }
            }

            // This returns the jiraservice.sendComment promise
            JiraService.addAttachmentAndComment(mainObjectInfo, {
                content: $scope.buildYAMLFile(),
                artifactName: $scope.systemSettings.name,
                errorHandlingProperty: $scope.manageTicketProperty
            });

            // JiraService.removeIssueLinks(mainObjectInfo, remoteObjectInfo).then(function() {

            // }).catch(function(exception) {onIssueLinkFailure(exception, mainObjectInfo.url, remoteObjectInfo.url)})
        };

        $scope.$on('$destroy', function () {
            $interval.cancel($scope.promiseForStorage);
            $scope.requirementProperties.requirementsEdited = false;
            $scope.onRouteChangeOff = '';
        });

        $scope.isStatusArrayEmpty = function () {
            return $scope.jiraStatus.allStatus.length === 0;
        };

        $scope.fetchTicketStatus = function (requirement, hosts) {
            var linkStatus = {};
            if ($scope.jiraStatus.allStatus.length === 0) {
                $scope.jiraStatus.allStatus.push({
                    name: 'No ticket'
                });
            }
            angular.forEach(requirement.tickets, function (ticket) {
                var apiUrl = Helper.buildJiraUrl(ticket.split('/'));
                var urlCall = JiraService.buildUrlCall('issueKey', apiUrl);
                if (angular.isUndefined(linkStatus.ticketStatus)) {
                    linkStatus.ticketStatus = [];
                }

                var jiraLink = apiUrl.http + '//' + apiUrl.host + '/' + apiUrl.path.join('/') + '/' + apiUrl.ticketKey[0];
                apiFactory.getJIRAInfo(urlCall).then(function (response) {
                    var ticketStatus = {
                        iconUrl: response.fields.status.iconUrl,
                        name: response.fields.status.name,
                        summary: response.fields.summary,
                        issueKey: response.key,
                        url: jiraLink
                    };
                    linkStatus.ticketStatus.push(ticketStatus);
                    angular.extend(requirement.linkStatus, linkStatus);

                    if ($filter('filter')($scope.jiraStatus.allStatus, {
                        name: response.fields.status.name
                    }).length === 0) {
                        $scope.jiraStatus.allStatus.push(ticketStatus);
                    }
                }, function (error) {
                    if (error.status === 401) {
                        $scope[apiUrl.ticketKey[0]] = {};
                        $scope[apiUrl.ticketKey[0]].derefer = $q.defer();
                        var authenticatorProperty = {
                            url: hosts.indexOf(apiUrl.host) === -1 ? jiraLink : '',
                            message: 'The status of issue linked in your requirement set could not be determined because you are not authenticated.' +
                                'Please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
                        };
                        if (hosts.indexOf(apiUrl.host) === -1) {
                            hosts.push(apiUrl.host);
                            // adds the check authentication Modal in case the issue tracking's system session has expired
                            // and the status of the ticket cannot be fetched.
                            Helper.addCheckAuthenticationModal($scope[apiUrl.ticketKey[0]]);
                        }
                        // check if the user is authenticated to the issue tracker and starts the authentication process if this is not the case.
                        checkAuthentication.jiraAuth(urlCall, authenticatorProperty, $scope.manageTicketProperty.spinnerProperty, $scope[apiUrl.ticketKey[0]]).then(function (response) {
                            var ticketStatus = {
                                iconUrl: response.fields.status.iconUrl,
                                name: response.fields.status.name,
                                summary: response.fields.summary,
                                issueKey: response.key,
                                url: jiraLink
                            };
                            linkStatus.ticketStatus.push(ticketStatus);
                            angular.extend(requirement.linkStatus, linkStatus);
                            if ($filter('filter')($scope.jiraStatus.allStatus, {
                                name: response.fields.status.name
                            }).length === 0) {
                                $scope.jiraStatus.allStatus.push(ticketStatus);
                            }
                        }).catch(function () {
                            if (error.status === 403) {
                                SDLCToolExceptionService.showWarning('Issue call failed', 'You do not have the permission to view the ticket ' + jiraLink, SDLCToolExceptionService.DANGER);
                            } else if (error.status === 500) {
                                SDLCToolExceptionService.showWarning('Internal Server Error', 'The server encountered an unexpected condition which prevented it from fulfilling the request.', SDLCToolExceptionService.DANGER);
                            }
                        });
                    } else if (error.status === 403) {
                        SDLCToolExceptionService.showWarning('Issue call failed', 'You do not have the permission to view the ticket ' + jiraLink, SDLCToolExceptionService.DANGER);
                    } else if (error.status === 404) {
                        if (error.errorException.opened.$$state.status === 0) {
                            error.errorException.opened.$$state.value = false;
                            error.errorException.opened.$$state.status = 1;
                        }
                        SDLCToolExceptionService.showWarning('Issue call failed', 'The ticket ' + jiraLink + ' does not exist.', SDLCToolExceptionService.DANGER);
                    } else if (error.status === 503) {
                        SDLCToolExceptionService.showWarning('Issue call failed', 'The request to ' + jiraLink + ' returned service unavailble.', SDLCToolExceptionService.DANGER);
                    }
                });
            });
        };
        // Move to top functionality
        var moveToTopButton = document.getElementById('backToTop');

        $scope.moveToTop = function () {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }

        function scrollFunction() {
            if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
                moveToTopButton.style.display = "block";
            } else {
                moveToTopButton.style.display = "none";
            }
        }
        window.onscroll = function () {
            scrollFunction();
        }


    });
