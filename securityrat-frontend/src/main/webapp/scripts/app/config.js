/* jshint unused: false */

const jiraRestApiPrefix = '/rest/api/2';
const jiraApiPrefix = jiraRestApiPrefix + '/issue';
const jiraApiIssueType = jiraRestApiPrefix + '/issuetype';
const jiraApiServerInfo = jiraRestApiPrefix + '/serverInfo'
const jiraApiProject = jiraRestApiPrefix + '/project';
const jiraAttachment = '/attachments';
const securityCATTestApi = '/scanapi/tests';
const jiraComment = '/comment';
const jiraBrowseUrlPathName = 'browse';
let importPrefix = '§origin§§path§?file='
importPrefix = importPrefix.replace('§origin§', window.location.origin)
importPrefix = importPrefix.replace("§path§", window.location.pathname.replace('/requirements', ''));
const localStorageKey = 'backup';
