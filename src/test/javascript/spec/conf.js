// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  directConnect: true,
  specs: ['generalTest.js', 'layoutAndExportTest.js', 'importerTest.js', 'restoreTest.js', 'tagTest.js','requirementTest.js', 'optColumnTest.js', 'statColumnTest.js', 'alternativeTest.js', 'ImpTypeTest.js','collectionTest.js', 'constantTest.js', 'userManagementTest.js'],//    
  allScriptsTimeout: 100000,
  jasmineNodeOpts: {defaultTimeoutInterval: 500000},
  onPrepare: function() {
      browser.driver.manage().window().maximize();
   },
   params: {
	   testHost:"https://securityrat.test.local", //FQDN of test instance of Security RAT
	   jiraQueue : 'https://test-jira.local/browse/XYZ', //path to a JIRA Queue where test tickets can be opened
	   jiraHost : 'https://test-jira.local/browse/', //path to test JIRA
	   impTestAttachmentUrl : 'https://securityrat.test.local/?file=https%3A%2F%2Ftest-jira.local%2Frest%2Fapi%2F2%2Fattachment%2F',
	   impTestUrl2: 'https://securityrat.test.local/?ticket=https://test-jira.local/browse/XYZ-123',
	   impTestFileUrl: 'https://securityrat.test.local/?file=https:%2F%2Ftest-jira.local%2Fsecure%2Fattachment%2F685933%2FSSDLC_sfgsfgsfg_17-2-2016_134738.yml', // copy the link address to an attached file in a JIRA ticker
	   attachmentUrls: ['#{id1}', //Any attachment id. See file query parameter of exported attachments in JIRA Queue
	                    '#{id2}', //The file attachment corresponding to this "id" muss be deleted in JIRA Tickets.
	                    '#{id3}'], // The attachment corresponding to this Id should have issues links.
	   issueNumbers : ['#{issuenum1}', // JIRA issue number from "jiraQueue" containing an attachment added through by SecurityRAT
	                   '#{issuenum2}' // JIRA issue number from "jiraQueue" containing more than one attachment added through SecurityRAT
	                   ],
       email: '#{registrationEmail}' // Email address to test for the registration.
   }
}
