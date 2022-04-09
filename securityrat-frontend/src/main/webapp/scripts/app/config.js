/* jshint unused: false */

var jiraRestApi = '/rest/api/latest';
var jiraApiPrefix = '/rest/api/latest/issue';
var jiraApiIssueType = '/rest/api/latest/issuetype';
var jiraApiProject = '/rest/api/latest/project';
var jiraAttachment = '/attachments';
var securityCATTestApi = '/scanapi/tests';
var jiraComment = '/comment';
var jiraBrowseUrlPathName = 'browse';
var importPrefix = window.location.href
importPrefix = importPrefix.endsWith('/') ? importPrefix.slice(0, -1) : importPrefix
importPrefix = importPrefix.replace("/requirements","") + '/?file=';
var localStorageKey = 'backup';
