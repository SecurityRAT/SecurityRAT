'use strict';
/** jshint undef: true */
/* globals urlpattern, Date */
angular.module('sdlctoolApp')
    .service('Helper', ['$uibModal', 'appConfig', function ($uibModal, appConfig) {
        return {
            /* jshint unused: false */
            searchArrayByValue: function (search, object) {
                var bool = false;
                angular.forEach(object, function (obj) {
                    angular.forEach(obj, function (value, key) {
                        if (value === search) {
                            bool = true;
                        }
                    });
                });
                return bool;
            },
            removeMarkdown: function (changedContent, controller) {
                if (controller === 'export') {
                    changedContent = changedContent.replace(/(\*)/g, '');
                    changedContent = changedContent.replace(/(\s+-\s)/g, '\n');
                    changedContent = changedContent.replace(/(-\s)/g, '');
                    changedContent = changedContent.replace(/(\s+1\.\s)/g, '\n');
                    changedContent = changedContent.replace(/(1\.\s)/g, '');
                    changedContent = changedContent.replace(/#/g, '');
                    changedContent = changedContent.replace(/`/g, '');
                    changedContent = changedContent.replace(/([\[]\S+[\]])/g, '');
                    changedContent = changedContent.replace(/(mailto:)/g, '');
                    changedContent = changedContent.replace(/([\n])+/g, '\n');
                } else {
                    changedContent = changedContent.replace(/(\*\s)/g, '- ');
                    changedContent = changedContent.replace(/(\*)/g, '');
                    changedContent = changedContent.replace(/(1\.\s)/g, '- ');
                    changedContent = changedContent.replace(/#/g, '');
                    changedContent = changedContent.replace(/`/g, '');
                    changedContent = changedContent.replace(/(\s{3,})/g, '\n');
                    changedContent = changedContent.replace(/([\[]\S+[\]])/g, '');
                    changedContent = changedContent.replace(/(mailto:)/g, '');
                }
                return changedContent;
            },
            validateURLQueueValue: function (value) {
                if (!value) {
                    return true;
                } else if (value.startsWith('http')) {
                    var re = new RegExp(urlpattern.javascriptStringRegex, 'i');
                    return re.test(value.trim())
                }
                return new RegExp('^[A-Z]+$').test(value.trim());
            },
            validateURLTicketValue: function (value) {
                if (!value) {
                    return true;
                } else if (value.startsWith('http')) {
                    var re = new RegExp(urlpattern.javascriptStringRegex, 'i');
                    return re.test(value.trim())
                }
                return new RegExp('^[A-Z]+-\\d+$').test(value.trim());
            },
            buildJiraUrl: function (list) {
                var apiUrl = {};
                apiUrl.ticketKey = [];
                apiUrl.path = [];
                var hostSet = false;
                for (var i = 0; i < list.length; i++) {
                    if (angular.equals(list[i], '')) {
                        list.splice(i, 1);
                        i--;
                    } else if (urlpattern.http.test(list[i])) {
                        angular.extend(apiUrl, {
                            http: list[i]
                        });
                    } else if (urlpattern.host.test(list[i]) && !hostSet) {
                        hostSet = true;
                        angular.extend(apiUrl, {
                            host: list[i]
                        });
                    } else if (list[i].indexOf('-') > -1) {
                        apiUrl.ticketKey.push(list[i]);
                    } else if (i < (list.length - 1)) {
                        apiUrl.path.push(list[i]);
                    }
                }
                var listSize = list.length;
                var lastElement = list.pop();
                //gets the project key.
                if (angular.isUndefined(apiUrl.projectKey) && (listSize >= 4)) {
                    if (lastElement.indexOf('-') >= 0) {
                        angular.extend(apiUrl, {
                            projectKey: lastElement.slice(0, lastElement.indexOf('-'))
                        });
                    } else {
                        angular.extend(apiUrl, {
                            projectKey: lastElement
                        });
                    }
                }
                // required for Jira URL with path
                apiUrl.jiraUrl = apiUrl.http + '//' + apiUrl.host;
                var pathCounter = 0;

                for (; pathCounter < apiUrl.path.length; pathCounter++) {
                    var pathValue = apiUrl.path[pathCounter];
                    if (pathValue === appConfig.jiraBrowseUrlPathName) {
                        break;
                    }
                    apiUrl.jiraUrl += '/' + pathValue;
                }
                apiUrl.cachedUrl = apiUrl.jiraUrl;
                for (; pathCounter < apiUrl.path.length; pathCounter++) {
                    apiUrl.cachedUrl += '/' + apiUrl.path[pathCounter];
                }
                apiUrl.cachedUrl += '/';
                return apiUrl;
            },
            buildYAMLFile: function (settings) {
                var self = this;
                var yamlExport = {};
                var projectTypeIdValue = 0;
                var projectTypeNameValue = '';
                var ticket = {};
                if (angular.isDefined(settings.ticket.url)) {
                    ticket.url = settings.ticket.url;
                }
                if (angular.isDefined(settings.ticket.key)) {
                    ticket.key = settings.ticket.key;
                }
                // this is done this way to prevent exception if the settings.project is empty
                angular.forEach(settings.projectType, function (projectType) {
                    projectTypeIdValue = projectType.projectTypeId;
                    projectTypeNameValue = projectType.name;
                });
                angular.extend(yamlExport, {
                    name: settings.name,
                    ticket: ticket,
                    projectType: [{
                        projectTypeId: projectTypeIdValue,
                        projectTypeName: projectTypeNameValue
                    }],
                    collections: settings.collections,
                    generatedOn: settings.generatedOn,
                    lastChanged: settings.lastChanged,
                    requirementCategories: []
                });

                angular.forEach(settings.requirements, function (requirement) {
                    angular.forEach(requirement.optionColumns, function (optColumn) {
                        angular.forEach(optColumn.content, function (content) {
                            if (angular.isDefined(content.diffContent)) {
                                delete content.diffContent;
                            }
                        });
                    });
                    //check if category is already inside
                    if (self.searchArrayByValue(requirement.category, yamlExport.requirementCategories)) {
                        angular.forEach(yamlExport.requirementCategories, function (requirementCategoryObject) {
                            if (requirementCategoryObject.category === requirement.category) {
                                requirementCategoryObject.requirements.push({
                                    id: requirement.id,
                                    shortName: requirement.shortName,
                                    showOrder: requirement.order,
                                    universalId: requirement.universalId,
                                    description: requirement.description,
                                    tickets: requirement.tickets,
                                    tagInstances: requirement.tagInstances,
                                    optColumns: requirement.optionColumns,
                                    statusColumns: requirement.statusColumns
                                });
                            }

                        });

                    } else {
                        //new category
                        var requirementElement = [];
                        requirementElement.push({
                            id: requirement.id,
                            shortName: requirement.shortName,
                            showOrder: requirement.order,
                            universalId: requirement.universalId,
                            description: requirement.description,
                            tickets: requirement.tickets,
                            tagInstances: requirement.tagInstances,
                            optColumns: requirement.optionColumns,
                            statusColumns: requirement.statusColumns
                        });
                        yamlExport.requirementCategories.push({
                            categoryId: requirement.categoryId,
                            category: requirement.category,
                            categoryOrder: requirement.categoryOrder,
                            requirements: requirementElement
                        });
                    }
                });
                // console.log('yaml export', yamlExport);
                return yamlExport;
            },
            getCurrentDate: function () {
                var d = new Date();
                var currDate = d.getDate();
                var currMonth = d.getMonth() + 1; //Months are zero based
                var currYear = d.getFullYear();
                if (currMonth < 10) {
                    currMonth = '0' + currMonth;
                }
                if (currDate < 10) {
                    currDate = '0' + currDate;
                }
                return currDate + '-' + currMonth + '-' + currYear;
            },
            getDetailedCurrentDate: function () {
                var d = new Date();
                var currHour = d.getHours();
                var currMin = d.getMinutes();
                var currSec = d.getSeconds();
                var currDate = d.getDate();
                var currMonth = d.getMonth() + 1; //Months are zero based
                var currYear = d.getFullYear();
                //add a zero for hours less than 10.
                if (currHour < 10) {
                    currHour = '0' + currHour.toString();
                }
                if (currMin < 10) {
                    currMin = '0' + currMin.toString();
                }
                if (currSec < 10) {
                    currSec = '0' + currSec.toString();
                }
                return currDate + '-' + currMonth + '-' + currYear + '_' + currHour + currMin + currSec;
            },
            addCheckAuthenticationModal: function (promise) {
                angular.extend(promise, {
                    runningModalPromise: function () {
                        var modalInstance = $uibModal.open({
                            template: '<div class="modal-body"><div id="UsSpinner1" class=" text-center col-sm-1" id="UsSpinner" spinner-on="true" us-spinner=' +
                                '"{radius:6, width:4, length:6, lines:9}"></div><br/><h4 class="text-center"> JIRA Authentication running...</h4></div>',
                            controller: function () { },
                            size: 'sm'
                        });
                        return modalInstance;
                    }
                });
            }
        };
    }]);
