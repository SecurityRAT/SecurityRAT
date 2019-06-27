'use strict';

/* jshint undef: true */
/* globals urlpattern, Blob, re_weburl, document, $, jsyaml, FileReader */

/**
 * @ngdoc function
 * @name sdlcFrontendApp.controller:StarterCtrl
 * @description
 * # StarterCtrl
 * Controller of the sdlcFrontendApp
 */
angular.module('sdlctoolApp')
    .controller('ImportController', function ($scope, $location, $uibModalStack, sharedProperties, getRequirementsFromImport, Helper, checkAuthentication,
        apiFactory, $filter, authenticatorService, SDLCToolExceptionService, $timeout, appConfig, $q, $uibModal, localStorageService, JiraService) {
        $scope.status = {
            file: false,
            jira: false
        };
        $scope.importObject = {};
        $scope.uploadFail = false;
        $scope.failMessage = '';
        $scope.selectedAlternativeSets = [];
        $scope.requirements = [];
        $scope.lastRequirementId = 0;
        $scope.optionColumns = [];
        //    $scope.promise = {};
        $scope.filterCategory = [];
        $scope.statusColumns = [];
        $scope.jiraLink = {};
        $scope.apiUrl = {};
        // $scope.isTicket = false;
        $scope.name = '';
        $scope.importProperty = {
            spinner: {},
            promise: {},
            importing: false,
            authenticating: false,
            defaultJIRAHost: appConfig.defaultJIRAHost,
            jiraTicketInputPlaceholder: appConfig.defaultJIRAHost ? 'e.g. TEST-01 or https://your-jira.url/browse/YOURPROJECT-123' : 'e.g. https://your-jira.url/browse/YOURPROJECT-123'
        };
        $scope.checks = {
            url: {
                pattern: urlpattern.javascriptStringRegex,
                errorMessage: 'The entered URL is invalid. Please provide a valid URL'
            }
        };
        $scope.attachmentProperties = {};

        //builds the URL object.
        $scope.buildUrlObject = function (list) {
            $scope.apiUrl = {};
            $scope.apiUrl.ticketKey = [];
            angular.extend($scope.apiUrl, Helper.buildJiraUrl(list));
        };

        var isImportFromLink = function (fileParam) {
            return ($location.search().file !== undefined || fileParam !== undefined) && ($location.search().ticket === undefined);
        }

        $scope.init = function () {
            $scope.status.jira = true;
            $timeout(function() {$('#jiraLink').focus();}, 500)
            function onSuccess(attachment) {
                // var modalInstance;
                if (attachment.self !== undefined) {
                    $scope.importProperty.importing = true;
                    $scope.importProperty.spinner.showSpinner = false;
                    //cancels the promises if they are defined to prevent use of resources.
                    authenticatorService.cancelPromises($scope.importProperty.promise);
                    apiFactory.getJIRAInfo(attachment.content).then(function (yamlFile) {
                        //                    if(modalInstance !== undefined){modalInstance.cancel('');}
                        var blob = new Blob([yamlFile], {
                            type: attachment.mimeType
                        });
                        $scope.readYamlFile(blob);
                    }, function () { });
                } else {
                    SDLCToolExceptionService.showWarning('Import unsuccessful', 'Invalid url in query parameter file. Please enter a valid JIRA ticket with an attachment.', SDLCToolExceptionService.DANGER);
                }
            }
            var url = sharedProperties.getProperty();
            angular.extend($scope.attachmentProperties, {
                attachments: [],
                hasAttachments: false,
                selectedAttachment: ''
            });
            angular.extend($scope.jiraLink, {
                url: '',
                backupUrl: ''
            });

            var fileParam = undefined;
            if (url instanceof String) {
                fileParam = url;
            }
            // must be '==' and not '===' because fileParam is and object of type String but not "RESTORE"
            /* jshint eqeqeq: false */
            if (fileParam == 'RESTORE') {
                $scope.status.jira = false;
                $scope.importProperty.importing = true;
                angular.extend($scope.importProperty.spinner, {
                    showSpinner: false
                });
                apiFactory.getAll('collections').then(function (collections) {
                    $scope.collections = collections;
                }, function() {});
                apiFactory.getAll('projectTypes').then(
                    function (projectTypes) {
                        $scope.projectTypes = $filter('orderBy')(projectTypes, 'showOrder');
                        var yamlFile = localStorageService.get(appConfig.localStorageKey);
                        var blob = new Blob([yamlFile]);
                        // $scope.importProperty.importing = true;
                        $scope.readYamlFileFromLocalStorage(blob);
                    },
                    function () { });

            } else {
                angular.extend($scope.importProperty.spinner, {
                    showSpinner: false
                });
                if(isImportFromLink(fileParam)) {
                    $scope.status.jira = false;
                }
                apiFactory.getAll('collections').then(function (collections) {
                    $scope.collections = collections;
                }, function() {});
                apiFactory.getAll('projectTypes').then(
                    function (projectTypes) {
                        $scope.projectTypes = $filter('orderBy')(projectTypes, 'showOrder');
                        if (isImportFromLink(fileParam)) {
                            var fileUrl;
                            if (fileParam !== undefined) {
                                fileUrl = decodeURIComponent(fileParam.toString());
                            } else {
                                fileUrl = decodeURIComponent($location.search().file);
                            }
                            /* jshint camelcase: false */
                            if (re_weburl.test(fileUrl)) {
                                // uncommented if any exception modal are shown on importing. This was commented to show loading on import.
                                // $uibModalStack.dismissAll('close exception modal');
                                var urlSplit = fileUrl.split('/');
                                $scope.buildUrlObject(urlSplit);
                                $scope.importProperty.promise.derefer = $q.defer();
                                Helper.addCheckAuthenticationModal($scope.importProperty.promise);
                                var authenticatorProperty = {
                                    url: $scope.apiUrl.http + '//' + $scope.apiUrl.host,
                                    message: 'Attachment could not be imported because you are not authenticated.' +
                                        'Please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
                                };
                                checkAuthentication.jiraAuth(fileUrl, authenticatorProperty, $scope.importProperty.spinner, $scope.importProperty.promise)
                                    .then(function (attachment) {
                                        onSuccess(attachment);
                                    }).catch(function (exception) {
                                        $scope.importProperty.authenticating = false;
                                        if (exception.status === 404) {
                                            // $uibModalStack.dismissAll('cancel');
                                            SDLCToolExceptionService.showWarning('Import unsuccessful', 'No attachment with this id was found.', SDLCToolExceptionService.DANGER);
                                        }
                                    });
                            } else {
                                //                                    $uibModalStack.dismissAll('cancel');
                                SDLCToolExceptionService.showWarning('Import unsuccessful', 'Invalid url in query parameter file.', SDLCToolExceptionService.DANGER);
                            }
                        } else {
                            if ($location.search().ticket !== undefined) {
                                $scope.jiraLink.url = $location.search().ticket;
                                $scope.status.jira = true;
                                $scope.uploadJira();
                            }
                        }
                    },
                    function () { });
            }

        };


        $scope.upload = function () {
            $scope.uploadFail = false;
            if ($scope.status.file) {
                $scope.importProperty.importing = true;
                $scope.uploadFile();
            } else if ($scope.status.jira) {
                $scope.uploadJira();
            }
        };


        $scope.validateURLTicketValue = function (value) {
            return Helper.validateURLTicketValue(value);
        }


        $scope.uploadJira = function () {
            $scope.jiraLink.url = JiraService.buildJiraUrl($scope.jiraLink.url);
            var urlSplit = $scope.jiraLink.url.split('/');
            $scope.buildUrlObject(urlSplit);
            if ($scope.apiUrl.ticketKey.length !== 1) {
                $scope.importProperty.importing = false;
                $scope.uploadFail = true;
                $scope.failMessage = 'You have entered an invalid ticket URL.';
            } else {
                $scope.importProperty.promise.derefer = $q.defer();
                var authenticatorProperty = {
                    url: $scope.jiraLink.url,
                    message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
                };

                checkAuthentication.jiraAuth(JiraService.buildUrlCall('issueType', $scope.apiUrl), authenticatorProperty, $scope.importProperty.spinner, $scope.importProperty.promise).then(function () {
                    $scope.importProperty.importing = true;
                    if (!angular.equals($scope.jiraLink.backupUrl, $scope.jiraLink.url)) {
                        $scope.attachmentProperties = {};
                        angular.extend($scope.attachmentProperties, {
                            attachments: [],
                            hasAttachments: false,
                            selectedAttachment: ''
                        });
                        $scope.jiraLink.backupUrl = $scope.jiraLink.url.trim();
                    }
                    $scope.checkTicket();
                }).catch(function () {
                    $scope.importProperty.authenticating = false;
                    $scope.importProperty.importing = false;
                });
            }
        };

        //checks if the given ticket exist
        $scope.checkTicket = function () {
            // var downloadUrl = "";
            if ($scope.attachmentProperties.attachments.length === 0) {
                apiFactory.getJIRAInfo(JiraService.buildUrlCall('issueKey', $scope.apiUrl)).then(function (response) {
                    if (response.fields.attachment.length === 0) {
                        $scope.importProperty.importing = false;
                        SDLCToolExceptionService.showWarning('Import unsuccessful', 'There were no attachments found in this ticket.', SDLCToolExceptionService.DANGER);
                    } else if (response.fields.attachment.length > 0) {
                        $scope.attachmentProperties.attachments = $filter('orderBy')($scope.buildAttachmentsArray(response.fields.attachment), 'showOrder', true);
                        if ($scope.attachmentProperties.attachments.length === 1) {
                            $scope.getAttachment($scope.attachmentProperties.attachments[0].downloadUrl);
                        } else if ($scope.attachmentProperties.attachments.length > 1) {
                            $scope.attachmentProperties.selectedAttachment = $scope.attachmentProperties.attachments[0].downloadUrl;
                            $scope.attachmentProperties.hasAttachments = true;
                            $scope.importProperty.importing = false;
                        } else if ($scope.attachmentProperties.attachments.length === 0) {
                            $scope.importProperty.importing = false;
                            SDLCToolExceptionService.showWarning('Import unsuccessful', 'There were no valid yaml attachments found in this ticket.', SDLCToolExceptionService.DANGER);
                        }
                    }
                },
                    function (exception) {
                        $scope.importProperty.importing = false;
                        if (exception.status === 404) {
                            $scope.uploadFail = true;
                            $scope.failMessage = 'The entered ticket is invalid. Please provide a valid ticket';
                        }
                    });
            } else if ($scope.attachmentProperties.attachments.length > 1) {
                $scope.getAttachment($scope.attachmentProperties.selectedAttachment);
            }
        };

        // get the attachment from jira.
        $scope.getAttachment = function (downloadUrl) {
            if (downloadUrl !== '') {
                var fileUrl = decodeURIComponent(downloadUrl);
                apiFactory.getJIRAInfo(fileUrl).then(function (yamlFile) {
                    var blob = new Blob([yamlFile], {
                        type: 'application/x-yaml'
                    });
                    $scope.readYamlFile(blob);
                }, function (exception) {
                    if (exception.status === 404) {
                        $scope.importProperty.importing = false;
                        SDLCToolExceptionService.showWarning('Import unsuccessful', 'No attachment with this id was found.', SDLCToolExceptionService.DANGER);
                    }
                });
            } else {
                $scope.importProperty.importing = false;
            }
        };

        $scope.buildAttachmentsArray = function (attachments) {
            var attachmentArray = [];
            angular.forEach(attachments, function (attachment) {
                //              
                if ((attachment.mimeType === 'application/x-yaml' && attachment.size <= 5000000)) {
                    var date = $filter('date')(attachment.created, 'medium');
                    var names = attachment.filename.split('_');
                    var name = names[(names).indexOf(appConfig.filenamePrefix) + 1];

                    attachmentArray.push({
                        label: name + ' created on: ' + date,
                        downloadUrl: attachment.content,
                        showOrder: attachment.created
                    });
                }
            });
            return attachmentArray;
        };

        $scope.uploadFile = function () {
            $scope.uploadFail = false;
            var fileTag = document.getElementById('fileUpload');
            if (fileTag.files.length === 0) {
                $scope.failMessage = 'Please select a File.';
                $scope.uploadFail = true;
                $scope.importProperty.importing = false;
            } else if (fileTag.files.length > 1) {
                $scope.importProperty.importing = false;
                $scope.failMessage = 'You can only upload one File.';
                $scope.uploadFail = true;
            } else {
                var yamlFile = fileTag.files[0];
                $scope.readYamlFile(yamlFile);

            }
        };

        //reads the yaml file and builds the system settings and the requirements. Takes a file or a blob.
        $scope.readYamlFile = function (file) {
            var yamlData = '';
            var r = new FileReader();
            //        console.log(file.type);
            if (file.size > 5000000) {
                $scope.importProperty.importing = false;
                $scope.failMessage = 'File limit 5MB exceeded.';
                $scope.uploadFail = true;
            } else {
                //executes this function once the file is successfully read.
                r.onload = function (event) {
                    yamlData = event.target.result;
                    try {
                        var doc = jsyaml.safeLoad(yamlData, {
                            filename: file.name
                        });
                        //console.log(doc);
                        $scope.buildSystemSettings(doc);
                        $scope.buildRequirement(doc.requirementCategories);
                    } catch (e) {
//                        console.log(e);
                        $scope.importProperty.importing = false;
                        SDLCToolExceptionService.showWarning('Import unsuccessful', 'Yaml file could not be read please contact the developers.', SDLCToolExceptionService.DANGER);
                    }
                };
                r.readAsText(file);
            }
        };

        //reads the yaml file from the LocalStorage and builds the systemsettings and the requirements. Takes a file or a blob.
        $scope.readYamlFileFromLocalStorage = function (file) {
            var yamlData = '';
            var r = new FileReader();
            if (file.size > 5000000) {
                $scope.failMessage = 'File limit exceeded.';
                $scope.uploadFail = true;
                $scope.importProperty.importing = false;
                //            if(status.file && status.jira){SDLCToolExceptionService.showWarning('Import unsuccessful', "File limit was exceeded.", SDLCToolExceptionService.DANGER);}
            } else {
                //executes this function once the file is successfully read.
                r.onload = function (event) {
                    yamlData = event.target.result;
                    try {
                        var doc = jsyaml.safeLoad(yamlData, {
                            filename: file.name
                        });
                        $scope.buildSystemSettings(doc);
                        $scope.buildRequirement(doc.requirementCategories);
                    } catch (e) {
                        $scope.importProperty.importing = false;
                        SDLCToolExceptionService.showWarning('Restore unsuccessful', 'Something wrent wrong restoring your session. Please import a valid one from Jira or create a new artifact.', SDLCToolExceptionService.DANGER);
                    }
                };
                r.readAsText(file);
            }
        };

        $scope.buildRequirement = function (requirementCategories) {
            // var setIds = [];
            var jiraStatus = {};
            jiraStatus.allStatus = [];
            var hasIssueLinks = false;
            var reqCounter = 0;
            var newStyleAlternativeInstances = {};

            angular.forEach(requirementCategories, function (category) {
                var lastElementOrder = 0;
                angular.forEach(category.requirements, function (requirement) {

                    reqCounter++;
                    var values = [];
                    // var linkStatus = {};
                    newStyleAlternativeInstances[requirement.id] = {};
                    angular.forEach(requirement.optColumns, function (optColumn) {
                        angular.forEach(optColumn.content, function (content) {
                            if (content.setId !== undefined) {
                                var split = content.content.split('**\n\n');
                                // this is to make panels in editor view possible. This is done to better the performance.
                                newStyleAlternativeInstances[requirement.id][content.id] = {
                                    title: split[0] + '**',
                                    body: split[1]
                                };
                                if ($scope.selectedAlternativeSets.indexOf(content.setId) === -1) {
                                    $scope.selectedAlternativeSets.push(content.setId);
                                }
                            }
                        });
                        values.push({
                            content: optColumn.content,
                            name: optColumn.name,
                            showOrder: optColumn.showOrder
                        });
                    });
                    var statusColumnsValues = [];
                    angular.forEach(requirement.statusColumns, function (statusColumn) {
                        if (statusColumn.isEnum && angular.isDefined(statusColumn.valueId)) {
                            statusColumnsValues.push({
                                id: statusColumn.id,
                                isEnum: statusColumn.isEnum,
                                value: statusColumn.value,
                                valueId: statusColumn.valueId
                            });
                        } else if (statusColumn.isEnum && angular.isUndefined(statusColumn.valueId)) {
                            angular.forEach($scope.statusColumns, function (newStatusColumn) {
                                angular.forEach(newStatusColumn.values, function (value) {
                                    if (angular.equals(value.name, statusColumn.value)) {
                                        statusColumnsValues.push({
                                            id: statusColumn.id,
                                            isEnum: statusColumn.isEnum,
                                            value: statusColumn.value,
                                            valueId: value.id
                                        });
                                    }
                                });
                            });

                        } else if (!statusColumn.isEnum) {
                            statusColumnsValues.push({
                                id: statusColumn.id,
                                isEnum: statusColumn.isEnum,
                                value: statusColumn.value
                            });
                        }

                    });
                    var tickets = [];
                    if (angular.isDefined(requirement.tickets)) {
                        angular.copy(requirement.tickets, tickets);
                        requirement.tickets = [];
                        requirement.tickets = tickets;
                        if (requirement.tickets.length > 0) {
                            hasIssueLinks = true;
                        }
                    } else {
                        // push ticket to array if present in the ticket property.
                        if (angular.isDefined(requirement.ticket) && !angular.equals(requirement.ticket, '')) {
                            hasIssueLinks = true;
                            tickets.push(requirement.ticket);
                        }
                    }

                    $scope.requirements.push({
                        id: requirement.id,
                        category: category.category,
                        categoryId: category.categoryId,
                        shortName: requirement.shortName,
                        universalId: requirement.universalId,
                        tickets: tickets,
                        description: requirement.description,
                        categoryOrder: category.categoryOrder,
                        order: requirement.showOrder,
                        optionColumns: values,
                        statusColumns: statusColumnsValues,
                        tagInstances: requirement.tagInstances,
                        selected: false,
                        linkStatus: {
                            link: true,
                            ticketStatus: []
                        },
                        isNew: false,
                        isOld: false,
                        applyUpdate: ' '
                    });
                    if (requirement.showOrder > lastElementOrder) {
                        lastElementOrder = requirement.showOrder;
                    }
                    if (requirement.id > $scope.lastRequirementId) {
                        $scope.lastRequirementId = requirement.id;
                    }
                });
                $scope.filterCategory.push({
                    id: category.categoryId,
                    showOrder: category.categoryOrder,
                    label: category.category,
                    lastElemOrder: lastElementOrder
                });
            });

            angular.extend($scope.importObject, {
                newStyleAlternativeInstances: newStyleAlternativeInstances,
                requirement: $scope.requirements,
                filterCategory: $scope.filterCategory,
                selectedAlternativeSets: $scope.selectedAlternativeSets,
                lastId: $scope.lastRequirementId,
                hasIssueLinks: hasIssueLinks
            });
            getRequirementsFromImport.setProperty($scope.importObject).then(function () {
                $scope.close();
            });
        };
        $scope.buildSystemSettings = function (system) {
            $scope.name = system.name;
            var projecttypes = [];
            var collections = [];
            angular.forEach(system.collections, function (collection) {
                var collValues = [];
                var newCollectionsCategory = [];
                if (angular.isDefined($scope.collections)) {
                     newCollectionsCategory = $filter('filter')($scope.collections, {'name': collection.categoryName}, true);
                }
                angular.forEach(collection.values, function (instance) {
                    var newInstance = $filter('filter')(newCollectionsCategory[0].collectionInstances, {'id': instance.collectionInstanceId});
                    collValues.push({
                        type: angular.isDefined(newInstance) ? newInstance[0].name : instance.type,
                        collectionInstanceId: instance.collectionInstanceId
                    });
                });
                collections.push({
                    categoryName: collection.categoryName,
                    values: collValues
                });
            });
            // fill the system settings with the project Type and its corresponding optionColumns and statusColumns
            angular.forEach(system.projectType, function (projectType) {
                var optsColumn = [];
                var statsColumn = [];
                angular.forEach($scope.projectTypes, function (type) {
                    if (projectType.projectTypeId === type.id) {
                        optsColumn = type.optionColumns;
                        statsColumn = type.statusColumns;
                        $scope.statusColumns = type.statusColumns;
                    }
                });
                $scope.optionColumns = optsColumn;
                projecttypes.push({
                    projectTypeId: projectType.projectTypeId,
                    name: projectType.projectTypeName,
                    optsColumn: optsColumn,
                    statsColumn: statsColumn
                });
            });
            var ticket = system.ticket;
            // in case a yaml file was manual uploaded to a JIRA ticket without giving the ticket URL in this file.
            if ((angular.isUndefined(ticket) || (angular.isDefined(ticket) && $.isEmptyObject(ticket))) && $scope.status.jira && angular.isDefined($scope.jiraLink.url)) {
                ticket = {
                    url: $scope.jiraLink.url,
                    key: Helper.buildJiraUrl($scope.jiraLink.url.split('/')).ticketKey[0]
                };
            }

            var systemSetting = {
                name: system.name,
                ticket: ticket,
                generatedOn: system.generatedOn,
                lastChanged: system.lastChanged,
                project: projecttypes,
                colls: collections
            };
            sharedProperties.setProperty(systemSetting);
        };

        $scope.cleanAll = function () {
            // cleans the check authenticator promise if this one is running.
            authenticatorService.cancelPromises($scope.importProperty.promise);
            $scope.importProperty.spinner.showSpinner = false;
        };

        $scope.cancel = function () {
            $scope.cleanAll();
            $uibModalStack.dismissAll('cancel');
        };

        $scope.close = function () {
            $location.path('/requirements');
            $scope.cleanAll();
        };
    });
