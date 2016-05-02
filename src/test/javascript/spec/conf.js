// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  directConnect: true,
  specs: ['collectionTest.js'],//   'ConstantTest.js', 'generalTest.js', 'layoutAndExportTest.js', 'importerTest.js', 'restoreTest.js',  , 'tagTest.js','requirementTest.js', 'OptColumnTest.js', 'StatColumnTest.js', 'AlternativeTest.js', 'ImpTypeTest.js'
  allScriptsTimeout: 100000,
  jasmineNodeOpts: {defaultTimeoutInterval: 500000},
  onPrepare: function() {
      browser.driver.manage().window().maximize();
   },
   params: {
	   testHost:"https://securityrat.test.local", //FQDN of test instance of Security RAT
	   jiraQueue : 'https://test-jira.local/browse/XYZ', //path to a JIRA Queue where test tickets can be opened
	   jiraHost : 'https://test-jira.local/browse/browse/', //path to test JIRA
	   impTestAttachmentUrl : 'https://securityrat.test.local/?file=https%3A%2F%2Ftest-jira.local%2Frest%2Fapi%2F2%2Fattachment%2F',
	   impTestUrl2: 'https://securityrat.test.local/?ticket=https://test-jira.local/browse/XYZ-123',
	   impTestFileUrl: 'https://securityrat.test.local/?file=https:%2F%2Ftest-jira.local%2Fsecure%2Fattachment%2F685933%2FSSDLC_sfgsfgsfg_17-2-2016_134738.yml'
   }
}
