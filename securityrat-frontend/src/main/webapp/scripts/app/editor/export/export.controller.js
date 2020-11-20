'use strict';

/* jshint undef: true */
/* globals urlpattern, $, window, jsyaml, document */
angular.module('sdlctoolApp')
    .controller('ExportController', function ($scope, apiFactory, sharedProperties, $uibModalStack, $uibModalInstance, $timeout,
        appConfig, authenticatorService, $uibModal, $interval, $q, SDLCToolExceptionService, $filter, $confirm, $window, Helper, checkAuthentication, JiraService) {
        $scope.jiraUrl = {};
        $scope.checks = {};
        $scope.extension = {};
        $scope.fields = {};
        $scope.apiUrl = {};
        $scope.jiraAlternatives = {};
        $scope.exportProperty = {
            promise: {},
            urlPlaceholder: 'e.g. https://your-jira.url/browse/YOURPROJECT'
        };
        $scope.jiraStatus = {};
        // $scope.promise = {};
        $scope.issueLinkObject = {};
        $scope.selection = {
            file: false,
            jira: true,
            createTickets: false
        };
        $scope.ticketURL = '';
        $scope.backupUrl = '';
        $scope.label = {};
        $scope.ticketsToLink = [];
        $scope.datePicker = {};
        $scope.autoComplete = {};
        $scope.toggleAutoCompleteDropdown = {};
        $scope.tempMandatoryValue = [];

        $scope.init = function () {
            $scope.manFilterObject = {};
            $scope.extension = 'yaml';
            angular.extend($scope.exportProperty, {
                fail: false,
                showSpinner: false,
                failed: '',
                authenticating: false,
            });
            $scope.exported = sharedProperties.getProperty();

            if ($scope.selection.createTickets && angular.isDefined($scope.exported.defaultJIRAHost)
                && $scope.exported.defaultJIRAHost.trim() !== '') {
                $scope.exportProperty.urlPlaceholder = 'e.g. YOURPROJECT or https://your-jira.url/browse/YOURPROJECT';
                $scope.exportProperty.defaultJIRAHost = $scope.exported.defaultJIRAHost;
            } else {
                //            assigns default JIRA Url
                $scope.jiraUrl.url = $scope.exported.defaultJIRAUrl
            }
            $scope.jiraAlternatives.issueTypes = [];
            $scope.jiraAlternatives.projects = [];
            $scope.jiraAlternatives.mandatoryFields = [];
            $scope.jiraStatus.allStatus = [];
            $scope.ticketURLs = [];

            $scope.checks.url = {
                pattern: urlpattern.javascriptStringRegex,
                errorMessage: 'Invalid URL. Please specify URL like https://www.example-jira.com/browse/DUMBQ',
                createTicketURLErrorMessage: 'Invalid Queue or URL. Please specify URL like https://www.example-jira.com/browse/DUMBQ or Queue like DUMBQ'
            };
            angular.extend($scope.checks, {
                isNotProject: false,
                issueKey: false,
                isQueue: false,
                isTicket: false,
                exporting: false
            });
            // only assigns the url when exporting to a jira ticket.
            if ($scope.exported.ticket.url !== undefined && !$scope.selection.createTickets) {
                $scope.jiraUrl.url = $scope.exported.ticket.url;
            }
        };

        //initial method for the create ticket use case.
        $scope.initcreateTicket = function () {
            $scope.selection.jira = false;
            $scope.selection.createTickets = true;
            $scope.init();
        };

        $scope.validateURLQueueValue = function (value) {
            return Helper.validateURLQueueValue(value);
        }

        $scope.removeLabel = function (label) {
            var index = $scope.fields.labels.indexOf(label);
            if (index !== -1) {
                $scope.fields.labels.splice(index, 1);
            }
        };

        $scope.addLabel = function (labelValue) {
            if (labelValue !== '' && labelValue !== undefined) {
                $scope.fields.labels.push(labelValue.replace(' ', '_'));
            }

            $scope.label.labelValue = '';
        };

        // initialises the labels according to the use case.
        $scope.initLabels = function () {
            if ($scope.selection.jira) {
                $scope.fields.labels = [appConfig.summaryPrefix];
            }
            if ($scope.selection.createTickets) {
                $scope.fields.labels = [appConfig.summaryPrefix + '_REQUIREMENT'];
            }
        };

        // Dirty Dirty Dirty Hack.
        $scope.fillDefaultValues = function () {
            $scope.fields.summary = appConfig.summaryPrefix + ' ' + $scope.exported.name;
            $scope.fields.description = appConfig.ticketDescription;
        };

        $scope.calDueDate = function ($event, key) {
            $scope.datePicker[key].opened = true;
        };

        $scope.close = function () {
            // activate the column ticket status of the requirement when tickets were created.
            if ($scope.selection.createTickets) {
                $uibModalInstance.close($scope.jiraStatus);
            } else {
                var obj = {
                    ticket: $scope.exported.ticket
                };
                if (angular.isDefined($scope.checks.hasReqTicket) && !$scope.checks.hasReqTicket) {
                    obj.hasReqTicket = $scope.checks.hasReqTicket;
                }

                $uibModalInstance.close(obj);
            }
        };

        $scope.cancel = function () {
            authenticatorService.cancelPromises($scope.exportProperty.promise);
            $scope.exportProperty.showSpinner = false;

            $uibModalStack.dismissAll('closing export');

        };
        //builds the URL object
        $scope.buildUrlObject = function (list) {
            $scope.apiUrl = {};
            $scope.apiUrl.ticketKey = [];
            angular.extend($scope.apiUrl, Helper.buildJiraUrl(list));
            if ($scope.apiUrl.ticketKey.length === 1) {
                $scope.checks.isTicket = true;
            }
        };

        //build the url call need according to the distinguisher. 
        $scope.buildUrlCall = function (selector) {
            return JiraService.buildUrlCall(selector, $scope.apiUrl);
        };

        //checks if the queue exist.
        $scope.checkQueue = function (projectKey, excludedFields, fatalFields) {
            var isProject = false;
            apiFactory.getJIRAInfo($scope.buildUrlCall('project')).then(function (response) {
                $scope.jiraAlternatives.projects = response;
                for (var i = 0; i < response.length; i++) {
                    if (angular.equals(response[i].key, projectKey)) {
                        $scope.manFilterObject.projectKey = projectKey;
                        $scope.manFilterObject.issuetypeName = undefined;
                        $scope.getMandatoryFields($scope.manFilterObject, excludedFields, fatalFields);
                        //gets the issue types.
                        $scope.getIssueTypes(projectKey);
                        $scope.checks.isQueue = true;
                        $scope.checks.isNotProject = false;
                        isProject = true;
                        $scope.fields.project = {};
                        angular.extend($scope.fields.project, {
                            key: projectKey
                        });
                        break;
                    }
                }
                if (!isProject) {
                    $scope.jiraUrl.url = $scope.apiUrl.cachedUrl;
                    $scope.checks.isNotProject = true;
                    $scope.exportProperty.fail = true;
                    $scope.exportProperty.failed = 'You have entered a wrong queue. Please select a valid queue and click on Export again.';
                    $scope.alertType = 'danger';
                }
                $scope.checks.exporting = false;
            }).catch(function () {
                // handle error if any concern should arise.
            });
        };

        //get the issue type of the given project Key.
        $scope.getIssueTypes = function (projectKey) {
            $scope.jiraAlternatives.issueTypes = [];
            var url = $scope.buildUrlCall('project') + '/' + projectKey;
            apiFactory.getJIRAInfo(url).then(function (projectData) {
                angular.forEach(projectData.issueTypes, function (issueType) {
                    if (!issueType.subtask) {
                        $scope.jiraAlternatives.issueTypes.push(issueType);
                    }
                });
                $scope.fields.issuetype = {
                    name: $scope.jiraAlternatives.issueTypes[0].name
                }
            }, function () { });
        };

        // checks if the given ticket exist
        $scope.checkTicketAndSendAttachment = function () {
            apiFactory.getJIRAInfo($scope.buildUrlCall('issueKey')).then(function (response) {
                $scope.checks.isTicket = true;
                $scope.checks.exporting = true;
                $scope.ticketURL = $scope.apiUrl.http + '//' + $scope.apiUrl.host + '/browse/' + $scope.apiUrl.ticketKey[0];
                if (angular.isDefined($scope.exported.ticket.url)) {
                    if (!angular.equals($scope.exported.ticket.url, $scope.ticketURL)) {
                        $confirm({
                            text: 'You have already exported this artifact in the ticket ' + $scope.exported.ticket.url + '. Are you sure you want to export into ' + $scope.ticketURL,
                            title: 'Confirm',
                            ok: 'OK',
                            cancel: 'Cancel'
                        }, {
                                templateUrl: 'scripts/app/editor/confirm-modal.html'
                            })
                            .then(function () {
                                $scope.checkForTicketInReqSet();
                                //                          $scope.sendAttachment();
                            }, function () {
                                $scope.checks.exporting = false;
                            });
                    } else {
                        $scope.sendAttachment();
                    }
                } else {
                    if (response.fields.attachment.length !== 0) {
                        $confirm({
                            text: 'This ticket already contains a Secure SDLC Artifact. Are you sure you want to export another one into ' + $scope.ticketURL + '?',
                            title: 'Confirm',
                            ok: 'OK',
                            cancel: 'Cancel'
                        }, {
                                templateUrl: 'scripts/app/editor/confirm-modal.html'
                            })
                            .then(function () {
                                $scope.sendAttachment();
                            }, function () {
                                $scope.checks.exporting = false;
                            });
                    } else {
                        $scope.sendAttachment();
                    }
                }
            }).catch(function (exception) {
                $scope.checks.exporting = false;
                if (exception.status === 404) {
                    $scope.exportProperty.failed = 'You have entered an invalid ticket. Please provide a valid one.';
                    $scope.alertType = 'danger';
                    $scope.exportProperty.fail = true;
                }
            });

        };

        function onIssueLinkFailure(exception, outwardKey) {
            var message = '';
            if (exception.status !== 500) {
                if (exception.errorException.opened.$$state.status === 0) {
                    exception.errorException.opened.$$state.value = false;
                    exception.errorException.opened.$$state.status = 1;
                }
                if (parseInt(exception.status) === 404) {
                    var project = $scope.jiraUrl.url.split('/').pop();
                    $scope.exportProperty.issuelink = 'disabled';
                    message = 'The issues could not be linked. This can occur when the issue linking between ' + $scope.exported.ticket.url + ' and ' +
                        $scope.jiraUrl.url.slice(0, $scope.jiraUrl.url.indexOf(project)) + outwardKey + ' is disabled.';
                    SDLCToolExceptionService.showWarning('Issue link unsuccessful', message, SDLCToolExceptionService.DANGER);
                } else if (exception.status === 401) {
                    $scope.exportProperty.issuelink = 'permission';
                    message = 'The issues could not be linked. You do not have the permission to link issues.';
                    SDLCToolExceptionService.showWarning('Issue link unsuccessful', message, SDLCToolExceptionService.DANGER);
                }
            }
        }

        /**
         * Queries the autoCompleteUrl with the entered text to help autocomplete
         */
        $scope.requestAutoComplete = function (field) {
            $scope.autoComplete[field.key] = [];
            //renders identification by jquery id possible.
            $scope.getHeight(field.key);
            var lastValue = '';
            if ($scope.fields[field.key] && angular.isDefined(field.autoCompleteUrl)) {
                switch (field.type) {
                    case 'array':
                        switch (field.itemType) {

                            case 'user':
                                lastValue = JSON.parse($scope.fields[field.key][$scope.fields[field.key].length - 1]).name;
                                break;
                        }
                        break;
                    case 'user':
                        lastValue = $scope.fields[field.key].name;
                        break;
                }
                if (lastValue.length > 1) {
                    apiFactory.getJIRAInfo(field.autoCompleteUrl.replace('/null/', '/') + lastValue).then(function (response) {
                        //                      console.log(response)
                        switch (field.type) {
                            case 'array':
                                switch (field.itemType) {

                                    case 'user':
                                        $scope.autoComplete[field.key] = response.users;
                                        $scope.toggleAutoCompleteDropdown[field.key] = response.total > 0 ? true : false;
                                        break;
                                }
                                break;
                            case 'user':
                                $scope.autoComplete[field.key] = response;
                                $scope.toggleAutoCompleteDropdown[field.key] = response.length > 0 ? true : false;
                                break;
                        }
                    }, function () {
                        angular.forEach($scope.jiraAlternatives.mandatoryFields, function (manField) {
                            if (angular.equals(manField.key, field.key)) {
                                delete manField.autoCompleteUrl;
                            }
                        });
                    });
                }
            }
        };

        $scope.finishAutocomplete = function (field, name) {
            var value = {};
            switch (field.type) {
                case 'array':
                    switch (field.itemType) {
                        case 'user':
                            value = JSON.parse($scope.fields[field.key][$scope.fields[field.key].length - 1]);
                            value.name = name;
                            break;
                    }
                    $scope.fields[field.key].pop();
                    $scope.fields[field.key].push(JSON.stringify(value));
                    break;
                case 'user':
                    $scope.fields[field.key].name = name;
            }
        };

        /**
         * get the configurable and mandatory fields excluding excludedFields, fatalFields, array fields with now allowedValues and array fields with only the set operation.
         */
        $scope.getMandatoryFields = function (filterObject, excludedFields, fatalFields) {
            $scope.jiraAlternatives.mandatoryFields = [];
            // builds the url call.
            var url = $scope.buildUrlCall('ticket') + '/createmeta?projectKeys=' + filterObject.projectKey;
            if (angular.isDefined(filterObject.issuetypeName)) {
                url += '&issuetypeNames=' + filterObject.issuetypeName;
            }
            url += '&expand=projects.issuetypes.fields';
            var dateType = ['date', 'datetime']; // jira date schemas.
            apiFactory.getJIRAInfo(url).then(function (response) {
                angular.forEach(response.projects, function (project) {
                    angular.forEach(project.issuetypes[0].fields, function (value, key) {
                        var allowedValues;
                        // var itemType = '';
                        var sync = $q.defer();
                        if ((fatalFields.indexOf(key) === -1) && (excludedFields.indexOf(key) === -1) && !(angular.equals(value.schema.type, 'array') && (value.operations.length === 1) && value.operations.indexOf('set') !== -1) && !angular.equals(value.schema.type, 'any')) {
                            if (angular.isDefined(value.allowedValues)) {
                                if (value.allowedValues.length > 0) {
                                    allowedValues = value.allowedValues;
                                } else {
                                    sync.reject(false);
                                } // slice out field without values in the allowedValues property.
                                if (angular.equals(value.schema.type, 'array')) {
                                    $scope.fields[key] = [];
                                }
                            }
                            // creates new Date object for fields of schema dateType
                            if (dateType.indexOf(value.schema.type) !== -1) {
                                $scope.datePicker[key] = {};
                                $scope.datePicker[key].opened = false;
                                $scope.fields[key] = new Date();
                            }
                            sync.resolve(true);
                            //sync makes sure the array is updated when the datas are available.
                            sync.promise.then(function () {
                                var autoCompleteUrl = value.autoCompleteUrl;
                                // console.log(autoCompleteUrl)
                                // exclude autoComplete with issueKey=null. 
                                if (angular.isDefined(autoCompleteUrl) && autoCompleteUrl.indexOf('=null') !== -1) {
                                    autoCompleteUrl = undefined;
                                }
                                $scope.jiraAlternatives.mandatoryFields.push({
                                    key: key,
                                    name: value.name,
                                    type: value.schema.type,
                                    schemaCustom: value.schema.custom,
                                    itemType: value.schema.items,
                                    values: allowedValues,
                                    configurable: $scope.selection.createTickets && key === 'labels' ? false : !value.required,
                                    mandatory: $scope.selection.createTickets && key === 'labels' ? true : value.required,
                                    required: value.required,
                                    autoCompleteUrl: autoCompleteUrl
                                });
                                // console.log($scope.jiraAlternatives.mandatoryFields);
                            });
                        }
                    });

                });
            });
        };

        // watch the issue type field and gets the mandatory fields depending on he issue type selected.
        /* jshint unused: false */
        $scope.$watch('fields.issuetype.name', function (newVal, oldVal, scope) {
            $scope.manFilterObject.projectKey = $scope.apiUrl.projectKey;
            $scope.manFilterObject.issuetypeName = newVal;
            var excludedFields = ['summary', 'issuetype', 'project', 'reporter', 'description']; // 
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
            if (angular.isDefined(newVal)) {
                $scope.getMandatoryFields($scope.manFilterObject, excludedFields, fatalFields);
            }
            // console.log($scope.jiraAlternatives.mandatoryFields)

        });
        /**
         * Determines the height of the window from the element with the id given as parameter
         */
        $scope.getHeight = function (id) {
            var height = $(window).height() - ($('#' + id).offset().top - $(window).scrollTop()) - $('#' + id).height();
            $scope.maxHeight = height + 'px';
        };

        $scope.$watch('fields.project.key', function (newVal, oldVal, scope) {
            if ($scope.apiUrl.http !== undefined && newVal !== undefined) {
                $scope.apiUrl.projectkey = newVal;
                $scope.jiraUrl.url = $scope.apiUrl.http + '//' + $scope.apiUrl.host + '/browse/' + newVal;
                $scope.backupUrl = $scope.jiraUrl.url;
            }
        });
        // create a new ticket
        $scope.createTicket = function (fieldObject, withAttachment) {
            var derefer = $q.defer();
            var req = {};
            if (angular.isDefined(fieldObject.req)) {
                angular.extend(req, fieldObject.req);
                delete fieldObject.req;
            }
            //          var excludedFields = ['summary', 'issuetype', 'labels', 'reporter', 'project', 'description'];
            for (var i = 0; i < $scope.jiraAlternatives.mandatoryFields.length && $scope.jiraAlternatives.mandatoryFields.length > 0; i++) {
                if (!$scope.jiraAlternatives.mandatoryFields[i].mandatory) {
                    delete fieldObject[$scope.jiraAlternatives.mandatoryFields[i].key];
                }
            }
            //Set the time time tracking parameter when this field is mandatory.
            if (angular.isDefined(fieldObject.timetracking)) {
                fieldObject.timetracking.remainingEstimate = $scope.fields.timetracking.originalEstimate;
            }

            var postData = {};
            angular.extend(postData, {
                fields: fieldObject
            });
            apiFactory.postExport($scope.buildUrlCall('ticket'), postData, {
                'X-Atlassian-Token': 'no-check',
                'Content-Type': 'application/json'
            })
                .then(function (response) {
                    if (response !== undefined) {
                        response.req = req;
                        $scope.apiUrl.ticketKey = [];
                        $scope.apiUrl.ticketKey.push(response.key);
                        derefer.resolve(response);
                        $scope.ticketURL = $scope.apiUrl.http + '//' + $scope.apiUrl.host + '/browse/' + response.key;
                        $scope.ticketURLs.push($scope.ticketURL);
                        if (withAttachment) {
                            $scope.commentForTicketImport();
                            $scope.sendAttachment();
                        }
                    }
                }).catch(function (error) {
                    $scope.checks.exporting = false;
                    if (error.status === 400) {
                        angular.forEach(error.data.errors, function (value, key) {
                            var values = value.split(' ');
                            var result = '';
                            for (var j = 0; j < values.length; j++) {
                                result += encodeURI(values[j]) + ' ';
                            }
                            // shows the error and scrolls the document to top to make sure the user sees it.
                            for (var i = 0; i < $scope.jiraAlternatives.mandatoryFields.length; i++) {
                                if ($scope.jiraAlternatives.mandatoryFields[i].key === key) {
                                    $scope.exportProperty.fail = true;
                                    $scope.exportProperty.failed = 'Value to field ' + $scope.jiraAlternatives.mandatoryFields[i].name + ' ' + result;
                                    if (angular.isDefined($scope.fields[key])) {
                                        $scope.fields[key] = '';
                                    }
                                }
                                // retrieves the old field values whose structure were changed to be able to create a ticket.
                                if (angular.isDefined($scope.tempMandatoryValue[$scope.jiraAlternatives.mandatoryFields[i].key])) {
                                    $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key] = $scope.tempMandatoryValue[$scope.jiraAlternatives.mandatoryFields[i].key];
                                }
                                $window.scrollTo(0, 0);
                            }
                        });
                    }
                });

            return derefer.promise;
        };

        $scope.commentForTicketImport = function () {
            var appUrl = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            var commentBody = 'With the following link you can import your artifact directly into the Secure SDLC Tool and select the newest version.' +
                ' You can also use this link to share it with others: ' + appUrl + '/?ticket=' + $scope.ticketURL;
            //get the attachment id and save in the current requirement.
            var commentData = {
                'body': commentBody
            };
            //adds comment to ease import
            apiFactory.postExport($scope.buildUrlCall('comment'), commentData, {
                'X-Atlassian-Token': 'no-check',
                'Content-Type': 'application/json'
            }).then(function () { });
        };

        $scope.sendAttachment = function () {
            var file = $scope.buildYAMLFile();
            var linksObject = {};
            $scope.ticketAuthentication = {};
            //          console.log(file);
            $scope.exported.ticket.apiUrl = $scope.apiUrl;
            $scope.exported.ticket.key = $scope.apiUrl.ticketKey[0];

            // links the newly created ticket to the existing tickets (created in batch mode) from the yaml file. 
            // This happens when the requirement set has already been saved in a ticket and the user save it into a new one.
            angular.forEach($scope.ticketsToLink, function (ticketToLink) {
                var urlSplit = ticketToLink.split('/');
                var apiUrl = {};
                angular.extend(apiUrl, Helper.buildJiraUrl(urlSplit));

                // this is done to prevent the data from been changed due to the asynchronous nature of the http calls.
                linksObject[apiUrl.ticketKey[0]] = {};
                linksObject[apiUrl.ticketKey[0]].apiUrl = apiUrl;
                linksObject[apiUrl.ticketKey[0]].url = ticketToLink;
                linksObject[apiUrl.ticketKey[0]].key = apiUrl.ticketKey[0];

                // makes the authenticator properties to be distinct to every ticket to link
                $scope.ticketAuthentication[apiUrl.ticketKey[0]] = {
                    authenticatorProperty: {},
                    promise: {},
                    showSpinner: false
                };
                $scope.ticketAuthentication[apiUrl.ticketKey[0]].authenticatorProperty.url = ticketToLink;
                $scope.ticketAuthentication[apiUrl.ticketKey[0]].authenticatorProperty.message = 'In order to link this issue, you have to authenticated. Please click on the following link to authenticate yourself. You will have one minute after a click on the link.';
                $scope.ticketAuthentication[apiUrl.ticketKey[0]].promise.derefer = $q.defer();
                checkAuthentication.jiraAuth(JiraService.buildUrlCall('issueKey', apiUrl),
                    $scope.ticketAuthentication[apiUrl.ticketKey[0]].authenticatorProperty, $scope.ticketAuthentication[apiUrl.ticketKey[0]],
                    $scope.ticketAuthentication[apiUrl.ticketKey[0]].promise).then(function (response) {
                        linksObject[response.key].fields = response.fields;
                        JiraService.addIssueLinks($scope.exported.ticket, linksObject[response.key]).then()
                            .catch(function (exception) {
                                onIssueLinkFailure(exception, response.key);
                            });
                    }).catch(function (exception) {
                        SDLCToolExceptionService.showWarning('Unsuccessful issue linking', 'The issue ' + ticketToLink + ' was not linked because the user was not authenticated.', SDLCToolExceptionService.DANGER);
                    });
            });


            var returnPromise = JiraService.addAttachmentAndComment($scope.exported.ticket, {
                content: file,
                artifactName: $scope.exported.name
            });
            if (angular.isDefined(returnPromise)) {
                returnPromise
                    .then(function () {
                        if ($scope.selection.jira) {
                            $scope.close();
                            SDLCToolExceptionService.showWarning('Export successful', 'The Secure SDLC artifact ' + $scope.exported.name + ' was successfully exported to:\n' + $scope.ticketURL, SDLCToolExceptionService.SUCCESS);
                        }
                    }).catch(function () {

                    });
            }

        };

        function callbackAfterTicketCheck() {
            if ($scope.checks.isTicket) {
                $scope.sendAttachment();
            } else {
                $scope.createTicket($scope.fields, true).then();
            }
        }

        $scope.checkForTicketInReqSet = function () {
            var requirements = [];
            angular.forEach($scope.exported.requirements, function (requirement) {
                if (angular.isDefined(requirement.tickets) && requirement.tickets.length > 0) {
                    requirements.push(requirement.shortName);
                }
            });
            if (requirements.length > 0) {
                var message = 'The Requirements ' + requirements.toString();
                message += ' have tickets associated to them. Should these tickets URL been taken along and linked to the new ticket or not?';
                $confirm({
                    text: message,
                    title: 'Confirm',
                    ok: 'Yes',
                    cancel: 'No'
                }, {
                        templateUrl: 'scripts/app/editor/confirm-modal.html'
                    })
                    .then(function () {
                        angular.extend($scope.checks, {
                            hasReqTicket: true
                        });
                        callbackAfterTicketCheck();
                    }, function () {
                        angular.extend($scope.checks, {
                            hasReqTicket: false
                        });
                        callbackAfterTicketCheck();
                    });
            } else {
                callbackAfterTicketCheck();
            }

        };

        $scope.confirm = function () {
            $scope.exportProperty.fail = false;
            $scope.checks.isTicket = false;
            var fieldNotfulfilled = false;
            $scope.jiraUrl.url = JiraService.buildJiraUrl($scope.jiraUrl.url);
            if ($scope.selection.jira || $scope.selection.createTickets) {
                //export to JIRA
                $scope.exportProperty.authenticatorProperty = {
                    url: $scope.jiraUrl.url,
                    message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
                };
                var urlSplit = $scope.jiraUrl.url.split('/');
                //console.log($scope.apiUrl);
                $scope.buildUrlObject(urlSplit);
                //console.log($scope.apiUrl);
                $scope.exportProperty.promise.derefer = $q.defer();
                checkAuthentication.jiraAuth($scope.buildUrlCall('issueType'), $scope.exportProperty.authenticatorProperty, $scope.exportProperty, $scope.exportProperty.promise).then(function (data) {
                    $scope.checks.exporting = true;
                    if ($scope.checks.isTicket && $scope.selection.jira) {
                        $scope.fields = {};
                        $scope.checkTicketAndSendAttachment();
                    } else if ($scope.checks.isTicket && $scope.selection.createTickets) {
                        $scope.exportProperty.fail = true;
                        $scope.exportProperty.failed = 'You have entered a ticket. Please provide a queue.';
                        $scope.checks.isQueue = false;
                        $scope.checks.exporting = false;
                    } else if ($scope.apiUrl.ticketKey.length > 1) {
                        $scope.exportProperty.fail = true;
                        $scope.alertType = 'danger';
                        $scope.exportProperty.failed = 'You have entered a invalid ticket. Please provide a valid ticket.';
                        $scope.checks.exporting = false;
                    } else {
                        var excludedFields = ['summary', 'issuetype', 'reporter', 'project', 'description'];
                        var fatalFields = ['attachment', 'issuelinks'];
                        //makes sure the other tests are run if the value of the URL is changed by the user. But doesn't executes if the URL was changed by the program.
                        if (!angular.equals($scope.jiraUrl.url.trim(), $scope.backupUrl)) {
                            $scope.backupUrl = $scope.jiraUrl.url.trim();
                            $scope.fields = {};
                        }
                        //checks for the project key only once. 
                        if (angular.isUndefined($scope.fields.project) || $scope.checks.isNotProject) {
                            $scope.checks.isQueue = false;
                            $scope.checkQueue($scope.apiUrl.projectKey, excludedFields, fatalFields);
                        } else {
                            $scope.checks.isQueue = true;
                            $scope.manFilterObject.projectKey = $scope.fields.project.key;
                            $scope.manFilterObject.issuetypeName = undefined;
                            $scope.checks.isNotProject = false;
                            if ($scope.jiraAlternatives.mandatoryFields.length === 0) {
                                $scope.getMandatoryFields($scope.manFilterObject, excludedFields, fatalFields);
                            }
                            if ($scope.jiraAlternatives.issueTypes.length === 0) {
                                $scope.getIssueTypes($scope.fields.project.key);
                            }
                            //verifies the existence and format of the mandatory fields.
                            for (var i = 0; i < $scope.jiraAlternatives.mandatoryFields.length; i++) {
                                if (!$scope.jiraAlternatives.mandatoryFields[i].mandatory) {
                                    delete $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key];
                                } else {
                                    if (angular.isUndefined($scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key]) || (angular.isDefined($scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key]) && $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key].length <= 0)) {
                                        fieldNotfulfilled = true;
                                        SDLCToolExceptionService.showWarning('Ticket creation failed',
                                            'The field <strong>' + $scope.jiraAlternatives.mandatoryFields[i].name + '</strong> has no value or wrong format. Please fill this out.',
                                            SDLCToolExceptionService.DANGER);
                                        break;
                                    } else if ($scope.jiraAlternatives.mandatoryFields[i].type === 'array' && !$scope.jiraAlternatives.mandatoryFields[i].values) {
                                        // properly sets the data Structure for fields os schema type array in the scope.fields object.
                                        if ($scope.jiraAlternatives.mandatoryFields[i].itemType !== 'string') {
                                            var j = 0;
                                            var tempValue = $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key];
                                            $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key] = [];
                                            while (tempValue[j]) {
                                                $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key].push(JSON.parse(tempValue[j]));
                                                j++;
                                            }
                                        }
                                    } else if ($scope.jiraAlternatives.mandatoryFields[i].type === 'datetime') {
                                        // creates the date format for the datetime type.
                                        $scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key] = $filter('date')($scope.fields[$scope.jiraAlternatives.mandatoryFields[i].key], 'yyyy-MM-dd\'T\'hh:mm:ss\'.000\'Z');
                                    }
                                }
                            }
                            // }
                            // create a ticket only when the required fields have been properly set.
                            if (!fieldNotfulfilled) {
                                if ($scope.selection.jira) {
                                    if (angular.isDefined($scope.exported.ticket.url)) {
                                        $confirm({
                                            text: 'You have already exported this artifact in the ticket ' + $scope.exported.ticket.url +
                                                '. Are you sure you want to export into a new ticket in the queue ' + $scope.jiraUrl.url,
                                            title: 'Confirm',
                                            ok: 'OK',
                                            cancel: 'Cancel'
                                        }, {
                                                templateUrl: 'scripts/app/editor/confirm-modal.html'
                                            })
                                            .then(function (data) {
                                                // check for the tickets in requirement set to be aber to link these ones to the newly created ticket.
                                                $scope.checkForTicketInReqSet();
                                            }, function () {
                                                $scope.checks.exporting = false;
                                            });
                                    } else if (angular.isUndefined($scope.exported.ticket.url) || angular.equals($scope.exported.ticket.url, '')) {
                                        $scope.createTicket($scope.fields, true).then();
                                    }

                                } else if ($scope.selection.createTickets) {
                                    $scope.createReqTickets();
                                }
                            } else {
                                $scope.checks.exporting = false;
                            }
                        }

                    }
                }, function () {
                    $scope.exportProperty.authenticating = false;
                });
            } else if ($scope.selection.file) {
                if ($scope.extension === 'yaml') {
                    var file = $scope.buildYAMLFile();
                    var mime = 'data:application/x-yaml;charset=utf-8,';
                    var ext = '.yml';
                    var doc = jsyaml.safeDump(file);
                    var a = document.createElement('a');
                    if (angular.isDefined(a.download)) {
                        a.href = mime + encodeURIComponent(doc);
                        a.download = appConfig.filenamePrefix + '_' + $scope.exported.name + '_' + Helper.getDetailedCurrentDate() + ext;
                        a.target = '_blank';
                        document.body.appendChild(a);
                        $timeout(function () {
                            a.click();
                            $scope.close();
                        });
                    } else {
                        $scope.exportProperty.fail = true;
                        $scope.exportProperty.failed = 'Export not supported by this browser use Firefox or Chrome';
                    }
                }
            }
        };

        function callbackAfterReqTicketCreation(ticketResponse) {

            apiFactory.getJIRAInfo(ticketResponse.self).then(function (responseInfo) {
                angular.forEach($filter('filter')($scope.exported.requirements, {
                    selected: true
                }), function (requirement) {
                    if ((requirement.id === ticketResponse.req.id) && requirement.shortName === ticketResponse.req.shortName) {
                        var remoteObject = {};
                        remoteObject.url = $scope.jiraUrl.url + '-' + responseInfo.key.split('-').pop();
                        remoteObject.apiUrl = Helper.buildJiraUrl(remoteObject.url.split('/'));
                        // This property muss be set irrelevant of thre remoteObject.key property.
                        remoteObject.apiUrl.ticketKey = [];
                        remoteObject.apiUrl.ticketKey.push(responseInfo.key);
                        remoteObject.apiUrl.projectKey = responseInfo.fields.project.key;
                        remoteObject.fields = responseInfo.fields;
                        remoteObject.key = responseInfo.key;

                        requirement.tickets.push(remoteObject.url);

                        $scope.numRequirementTicketToCreate--;
                        var linkStatus = {
                            iconUrl: responseInfo.fields.status.iconUrl,
                            name: responseInfo.fields.status.name,
                            summary: responseInfo.fields.summary,
                            issueKey: responseInfo.key,
                            url: remoteObject.url
                            // enableTooltip: true,
                            // link: true
                        };
                        requirement.linkStatus.ticketStatus.push(linkStatus);
                        if ($filter('filter')($scope.jiraStatus.allStatus, {
                            name: linkStatus.name
                        }).length === 0) {
                            $scope.jiraStatus.allStatus.push(linkStatus);
                        }
                        //links the newly created ticket to the main ticket
                        JiraService.addIssueLinks($scope.exported.ticket, remoteObject).then()
                            .catch(function (exception) {
                                onIssueLinkFailure(exception, remoteObject.key);
                            });
                        // shows the successful modal and updates the attachment.
                        if ($scope.numRequirementTicketToCreate === 0) {
                            var urlSplit = $scope.exported.ticket.url.split('/');
                            $scope.buildUrlObject(urlSplit);
                            $scope.sendAttachment();
                            var tickets = '\n';
                            var message = '';
                            for (var i = 0; i < $scope.ticketURLs.length; i++) {
                                tickets += $scope.ticketURLs[i];
                                tickets += '\r\n';
                            }
                            $scope.close();
                            SDLCToolExceptionService.showWarning('Tickets creation successful',
                                'The following tickets were successfully created: ' + tickets, SDLCToolExceptionService.SUCCESS);
                        }
                    }
                });
            });
        }
        // creates tickets for each selected requirement.
        $scope.createReqTickets = function () {
            $scope.numRequirementTicketToCreate = ($filter('filter')($scope.exported.requirements, {
                selected: true
            })).length;
            // preparing the main ticket object for linking
            var urlSplit = $scope.exported.ticket.url.split('/');
            $scope.exported.ticket.apiUrl = {};
            angular.extend($scope.exported.ticket.apiUrl, Helper.buildJiraUrl(urlSplit));
            $scope.exportProperty.promise.derefer = $q.defer();
            $scope.exportProperty.authenticatorProperty.url = $scope.exported.ticket.url;
            checkAuthentication.jiraAuth(JiraService.buildUrlCall('issueKey', $scope.exported.ticket.apiUrl), $scope.exportProperty.authenticatorProperty, $scope.exportProperty, $scope.exportProperty.promise)
                .then(function (response) {
                    $scope.exported.ticket.fields = response.fields;
                    angular.forEach($filter('orderBy')($filter('filter')($scope.exported.requirements, {
                        selected: true
                    }), ['categoryOrder', 'order']), function (requirement) {
                        var fieldObject = {};
                        angular.extend(fieldObject, $scope.fields);
                        var commentBody = '';
                        var name = $scope.exported.name.replace(' ', '_');
                        //console.log(name);
                        fieldObject.description = '';
                        // to synchronize asynchronous REST CALLS.
                        fieldObject.req = requirement;
                        fieldObject.summary = '';
                        fieldObject.summary += '[' + $scope.exported.name + '] ' + requirement.description + ' (' + requirement.shortName + ')';
                        fieldObject.description += 'Category:\n';
                        fieldObject.description += requirement.category + '\n\n';
                        fieldObject.description += 'Short name:\n';
                        fieldObject.description += requirement.shortName + '\n\n';
                        fieldObject.description += 'Requirement description:\n';
                        fieldObject.description += requirement.description + '\n';
                        angular.forEach($filter('orderBy')(requirement.optionColumns, 'showOrder'), function (optColumn) {
                            fieldObject.description += '\n' + optColumn.name + ':\n';
                            angular.forEach(optColumn.content, function (content) {
                                fieldObject.description += Helper.removeMarkdown(content.content, 'export');
                                fieldObject.description += '\n';
                            });
                        });
                        //add comments to the description if these have been provided.
                        angular.forEach(requirement.statusColumns, function (statColumn) {
                            angular.forEach($filter('orderBy')($scope.exported.statusColumns, 'showOrder'), function (stat) {
                                if (stat.id === statColumn.id) {
                                    fieldObject.description += '\n' + stat.name + '\n';
                                    fieldObject.description += statColumn.value;
                                    fieldObject.description += '\n';
                                }
                            });
                        });

                        $scope.createTicket(fieldObject, false).then(function (ticketResponse) {
                            callbackAfterReqTicketCreation(ticketResponse);
                        });
                    });
                }).catch(function () {
                    $scope.checks.exporting = false;
                    $scope.exportProperty.authenticating = false;
                });
        };

        $scope.getTicketValue = function (req) {
            if (angular.isUndefined($scope.checks.hasReqTicket)) {
                return req.tickets;
            } else if (!$scope.checks.hasReqTicket) {
                req.tickets = [];
                return [];
            } else if ($scope.checks.hasReqTicket) {
                if (req.tickets.length > 0) {
                    // save the ticket url from yaml, to later on link them to main Ticket. 
                    $scope.ticketsToLink = $scope.ticketsToLink.concat(req.tickets);
                }
                return req.tickets;
            }
        };

        $scope.buildYAMLFile = function () {
            if (angular.isDefined($scope.exported.ticket.url) && $scope.ticketURL === '') {
                $scope.ticketURL = $scope.exported.ticket.url;
            } else if ($scope.selection.jira && $scope.ticketURL !== '') {
                //$scope.exported.ticket is undefined and adding something to .url is not possible, so initialize it empty
                $scope.exported.ticket = {};
                $scope.exported.ticket.url = $scope.ticketURL;
                $scope.exported.ticket.key = $scope.apiUrl.ticketKey[0];
            }

            // copy the exported object
            var copyOfExport = angular.copy($scope.exported);
            angular.forEach(copyOfExport.requirements, function (requirement) {

                requirement.tickets = $scope.getTicketValue(requirement);
            });

            return Helper.buildYAMLFile(copyOfExport);
        };
    });
