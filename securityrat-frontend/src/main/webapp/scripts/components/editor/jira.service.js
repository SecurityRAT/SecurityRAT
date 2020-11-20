'use strict';

/* jshint undef: true */
/* globals jsyaml, Blob, FormData */
angular.module('sdlctoolApp')
    .factory('JiraService', ['Helper', 'apiFactory', 'appConfig', '$q', 'SDLCToolExceptionService', function (Helper, apiFactory, appConfig, $q, SDLCToolExceptionService) {

        var linkTypeName = appConfig.JIRAIssueLinkTypeName;
        var remoteRelationshipName = appConfig.JIRARemoteIssueLinkRelationshipName;

        function buildJiraUrl(value) {
            var builtUrl = '';
            if (!value.startsWith('http')) {
                builtUrl = appConfig.defaultJIRAHost;
                if (!appConfig.defaultJIRAHost.endsWith('/')) {
                    builtUrl += '/';
                }
                builtUrl += 'browse/' + value;
            } else {
                builtUrl = value;
            }

            return builtUrl;
        }

        function buildUrlCall(selector, apiUrlInfo) {
            var baseJiraCall = apiUrlInfo.jiraUrl + appConfig.jiraApiPrefix + '/';
            console.log(baseJiraCall);
            var origin = apiUrlInfo.http + '//' + apiUrlInfo.host;
            var returnValue = '';
            switch (selector) {
                case 'ticket':
                    returnValue = origin + appConfig.jiraApiPrefix;
                    break;
                case 'attachment':
                    returnValue = baseJiraCall + apiUrlInfo.ticketKey[0] + appConfig.jiraAttachment;
                    break;
                case 'comment':
                    returnValue = baseJiraCall + apiUrlInfo.ticketKey[0] + appConfig.jiraComment;
                    break;
                case 'issueType':
                    returnValue = origin + appConfig.jiraApiIssueType;
                    break;
                case 'project':
                    returnValue = origin + appConfig.jiraApiProject;
                    break;
                case 'issueKey':
                    returnValue = baseJiraCall + apiUrlInfo.ticketKey[0];
                    break;
                case 'search':
                    returnValue = origin + appConfig.jiraRestApi + '/search';
                    break;
                case 'issueLink':
                    returnValue = origin + appConfig.jiraRestApi + '/issueLink';
                    break;
                case 'remotelink':
                    returnValue = baseJiraCall + apiUrlInfo.ticketKey[0] + '/remotelink';
                    break;
                case 'field':
                    returnValue = origin + appConfig.jiraRestApi + '/field';
                    break;
            }
            return returnValue;
        }

        function sendComment(body, ticketInfo) {
            var commentData = {
                'body': body
            };
            //adds comment to ease import
            return apiFactory.postExport(buildUrlCall('comment', ticketInfo.apiUrl), commentData, { 'X-Atlassian-Token': 'nocheck', 'Content-Type': 'application/json' });
        }

        function addAttachmentAndComment(ticketInfo, fileObject) {
            try {
                var doc = jsyaml.safeDump(fileObject.content);
                var filename = appConfig.filenamePrefix + '_' + fileObject.artifactName + '_' + Helper.getDetailedCurrentDate() + '.yml';
                var blob = new Blob([doc], { type: 'application/x-yaml' });
                var data = new FormData();
                data.append('file', blob, filename);
                return apiFactory.postExport(buildUrlCall('attachment', ticketInfo.apiUrl), data, { 'X-Atlassian-Token': 'nocheck', 'Content-Type': undefined })
                    .then(function (response) {
                        var commentBody = appConfig.ticketComment;
                        commentBody = commentBody.replace('§artifact_name§', fileObject.artifactName);
                        commentBody = commentBody.replace('§import_link§', appConfig.importPrefix + encodeURIComponent(response[0].self) + '.\n');
                        commentBody = commentBody.replace('§filename§', filename);

                        //get the attachment id and save in the current requirement.
                        return sendComment(commentBody, ticketInfo);
                    }, function (error) {
                        if (angular.isDefined(fileObject.errorHandlingProperty)) { fileObject.errorHandlingProperty.spinnerProperty.showSpinner = false; }
                        if (error.status === 403) {
                            SDLCToolExceptionService.showWarning('Adding attachment unsuccessful', 'The YAML file could not be attached to the main ticket. Please check if ticket is not closed and that you have the permission to attach files.', SDLCToolExceptionService.DANGER);
                        }
                    });
            } catch (e) {
                if (angular.isDefined(fileObject.errorHandlingProperty)) { fileObject.errorHandlingProperty.spinnerProperty.showSpinner = false; }
                SDLCToolExceptionService.showWarning('Adding attachment unsuccessful', 'YAML file could not be attached to main ticket due to file parsing error. Please contact the developers.', SDLCToolExceptionService.DANGER);
            }
        }

        function createRemoteLink(apiCall, issueKey, issueInfo) {
            var postData = {
                'object': {
                    'url': issueInfo.url,
                    'title': issueKey,
                    'summary': issueInfo.fields.summary,
                    'icon': {
                        'url16x16': issueInfo.fields.issuetype.iconUrl,
                        'title': issueInfo.fields.issuetype.description
                    },
                    'status': {
                        'icon': {
                            'url16x16': issueInfo.fields.status.iconUrl,
                            'title': issueInfo.fields.status.name
                        }
                    }
                },
                'relationship': remoteRelationshipName
            };
            return apiFactory.postExport(apiCall, postData, { 'X-Atlassian-Token': 'nocheck', 'Content-Type': 'application/json' });

        }

        function addIssueLinks(mainIssueInfo, remoteIssueInfo) {
            var apiCall = buildUrlCall('issueLink', remoteIssueInfo.apiUrl);
            var promiseArray = [];
            var postData = {
                type: {
                    name: linkTypeName
                },
                inwardIssue: {
                    key: mainIssueInfo.key
                },
                outwardIssue: {
                    key: remoteIssueInfo.key
                }
            };

            if (angular.equals(mainIssueInfo.apiUrl.host, remoteIssueInfo.apiUrl.host)) {
                // links tickets are from the same JIRA instance
                promiseArray.push(apiFactory.postExport(apiCall, postData, { 'X-Atlassian-Token': 'nocheck', 'Content-Type': 'application/json' }));
            } else {
                // links tickets from different JIRA instances.
                // links ticket from main JIRA ticket to ticket in different JIRA instance
                var inwardApiCall = buildUrlCall('remotelink', mainIssueInfo.apiUrl);

                promiseArray.push(createRemoteLink(inwardApiCall, remoteIssueInfo.key, remoteIssueInfo));
                var outwardApiCall = buildUrlCall('remotelink', remoteIssueInfo.apiUrl);
                // get the summary of the main JIRA to prepare for remote linking if necessary
                if (angular.isUndefined(mainIssueInfo.fields)) {
                    promiseArray.push(apiFactory.getJIRAInfo(buildUrlCall('issueKey', mainIssueInfo.apiUrl)).then(function (response) {
                        mainIssueInfo.fields = response.fields;
                        return createRemoteLink(outwardApiCall, mainIssueInfo.key, mainIssueInfo);

                    }));
                } else {
                    promiseArray.push(createRemoteLink(outwardApiCall, mainIssueInfo.key, mainIssueInfo));
                }
            }
            return Promise.all(promiseArray);
        }

        function removeIssueLinks(mainIssueInfo, remoteIssueInfo) {
            var exception = {};
            if (angular.equals(mainIssueInfo.apiUrl.host, remoteIssueInfo.apiUrl.host)) {
                var promise = $q.defer();
                for (var i = 0; i < mainIssueInfo.fields.issuelinks.length; i++) {
                    if (mainIssueInfo.fields.issuelinks[i].outwardIssue.key === remoteIssueInfo.key && mainIssueInfo.fields.issuelinks[i].type.name === linkTypeName) {
                        return apiFactory.deleteExport(buildUrlCall('issueLink', mainIssueInfo.apiUrl) + '/' + mainIssueInfo.fields.issuelinks[i].id,
                            {}, { 'X-Atlassian-Token': 'nocheck' });
                    }
                }
                exception.status = 404;
                promise.reject(exception);
                return promise;
            } else {
                Promise.all([apiFactory.getJIRAInfo(buildUrlCall('remotelink', mainIssueInfo.apiUrl)), apiFactory.getJIRAInfo(buildUrlCall('remotelink', remoteIssueInfo.apiUrl))])
                    .then(function (responses) {
                        var promiseArray = [];
                        for (var i = 0; i < responses[0].length; i++) {
                            if (responses[0][i].object.title === remoteIssueInfo.key && responses[0].relationship === remoteRelationshipName) {
                                promiseArray.push(apiFactory.deleteExport(buildUrlCall('remotelink', mainIssueInfo.apiUrl) + '/' + responses[0].id,
                                    {}, { 'X-Atlassian-Token': 'nocheck' }));

                            }
                        }
                        for (i = 0; i < responses[1].length; i++) {
                            if (responses[1][i].object.title === mainIssueInfo.key && responses[1].relationship === remoteRelationshipName) {
                                promiseArray.push(apiFactory.deleteExport(buildUrlCall('remotelink', remoteIssueInfo.apiUrl) + '/' + responses[1].id,
                                    {}, { 'X-Atlassian-Token': 'nocheck' }));

                            }
                        }
                        return Promise.all(promiseArray);
                    }).catch();
            }

        }

        var jiraService = {
            buildUrlCall: buildUrlCall,
            addAttachmentAndComment: addAttachmentAndComment,
            addIssueLinks: addIssueLinks,
            removeIssueLinks: removeIssueLinks,
            buildJiraUrl: buildJiraUrl
        };

        return jiraService;
    }]);
