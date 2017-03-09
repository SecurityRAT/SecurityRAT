var jiraRestApi = '/rest/api/latest';
var jiraApiPrefix = '/rest/api/latest/issue';
var jiraApiIssueType = '/rest/api/latest/issuetype';
var jiraApiProject = '/rest/api/latest/project';
var jiraAttachment = "/attachments";
var securityCATStartTest = "/serviceapi/starttest"
var securityCATStopTest = "/serviceapi/stoptest"
var jiraComment = "/comment";
var importPrefix = window.location.origin ? window.location.origin + "/?file=" : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + "/?file=";
var localStorageKey = 'backup';
