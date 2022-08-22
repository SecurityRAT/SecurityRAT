/* jshint unused: false */

var jiraRestApi = '/rest/api/latest';
var jiraApiPrefix = '/rest/api/latest/issue';
var jiraApiIssueType = '/rest/api/latest/issuetype';
var jiraApiProject = '/rest/api/latest/project';
var jiraAttachment = '/attachments';
var securityCATTestApi = '/scanapi/tests';
var jiraComment = '/comment';
var jiraBrowseUrlPathName = 'browse';
var importPrefix = '§origin§§path§?file='
importPrefix = importPrefix.replace('§origin§', window.location.origin)
importPrefix = importPrefix.replace("§path§", window.location.pathname.replace('/requirements', ''));
var localStorageKey = 'backup';
