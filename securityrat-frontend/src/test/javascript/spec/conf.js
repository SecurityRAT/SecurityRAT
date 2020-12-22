// conf.js
exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    directConnect: true,
    specs: ['generalTest.js', 'layoutAndExportTest.js', 'importerTest.js', 'restoreTest.js', 'tagTest.js'
        , 'requirementTest.js', 'optColumnTest.js', 'statColumnTest.js', 'alternativeTest.js', 'ImpTypeTest.js',
        'collectionTest.js', 'constantTest.js', 'userManagementTest.js', 'logoutTest.js'],// add 'accountTest.js' add the beginning of this array if you use FORM authentication and registration is true
    allScriptsTimeout: 100000,
    jasmineNodeOpts: { defaultTimeoutInterval: 500000 },
    onPrepare: function () {
        browser.driver.manage().window().maximize();
    },
    params: {
        formLogin: true,
        admin: {
            user: '#{admin username}',
            password: '#{admin password}'
        },// this is only relevant when you use FORM authentication.
        customRequirementShortName: 'CUS',
        testHost: "https://securityrat.test.local", //FQDN of test instance of Security RAT
        jiraLogoutUrl: 'https://test-jira.local/logout', // URL to logout to your JiraInstance
        jiraQueue: 'https://test-jira.local/browse/XYZ', //path to a JIRA Queue where test tickets can be opened
        jiraTicket: 'https://test-jira.local/browse/XYZ-144', //path to a JIRA Ticket to test manual linking of tickets
        jiraRemoteLinkQueue: 'https://second-test-jira.local/browse/ABC', // second jira to test the remote linking. Please this Queue should just have issuetype as mandatory field.
        jiraRemoteLinkTicket: 'https://second-test-jira.local/browse/ABC-524', // an existing ticket from the second jira instance to test manual linking
        jiraHost: 'https://test-jira.local/browse/', //path to test JIRA
        impTestAttachmentUrl: 'https://securityrat.test.local/?file=',
        // Change the value of the ticket query parameter to a
        // Ticket that have different attachment types. For e.g SecurityRAT *.yml file and *.xlsx.
        impTestUrl2: 'https://securityrat.test.local/?ticket=https://test-jira.local/browse/XYZ-123',
        // copy a link to an attachment in JIRA and set this link in the query parameter file
        impTestFileUrl: 'https://securityrat.test.local/?file=https:%2F%2Ftest-jira.local%2Fsecure%2Fattachment%2F685933%2FSSDLC_sfgsfgsfg_17-2-2016_134738.yml',
        // The values provided in this array are URL for the file query parameter.
        // These values will be used to concatenate with the "impTestAttachmentUrl" property above.
        // Copy this value the comment added by SecurityRAT to your ticket.
        // These URLs will be use to test different scenarios.
        attachmentUrls: [
            '${filePathUrl1}',
            // The file path URL should correspond to an SecurityRAT attachment that have been deleted from the ticket.
            '${filePathUrl2}',
            // This file path URL should open a SecurityRAT YAML attachment that contains old contains
            // After importing this file the red button "update requirements" should be displayed
            '${filePathUrl3}',
            // The SecurityRAT attachment for this attachment should contain requirements with ticket link.
            '${filePathUrl4}',
            // This attachment must have custom requirements.
            '${filePathUrl5}'
        ],
        // A list of Ticket number. This values are concatenate with the value from the "jiraQueue" given above.
        issueNumbers: [
            // The resulting ticket with this number should contain exactly one attachment added by SecurityRAT.
            // This result link used will be https://test-jira.local/browse/XYZ-issuenumber1
            '${issuenumber1}',
            // The resulting ticket with this number should contain more than one attachment added by SecurityRAT.
            '${issuenumber2}'
        ],
        issuetypes: [
            // This Issuetype should not have mandatory fields other than project, summary name
            '${issuetype1}',
            '${issuetype2}', // an issue type with a mandatory fields besides project, summary name or reporter e.g Epic
            '${issuetype3}' // issue type for the {jiraRemoteLinkQueue} propperty
        ],
        // Default optColumn value to be used in different tests
        defaultOptColumn: '${defaultOptColumnValues}',
        // Default statusColumn value used by SecurityRAT.
        // This is the statusColumn value with the small showOrder value
        statusColumnDefaultValue: '${defaultStatusValue}',
        // This shall be used during the test to change the values of the statusColumValues
        otherStatusColumnValues: [
            '${statusvalue1}',
            '${statusvalue1}'
        ],
        email: '#{registrationEmail}' // Email address to test for the registration.
    },
    capabilities: {
        'browserName': 'chrome' // or 'firefox' for firefox please use version 36 or less because the selenium driver doesn't support later versions of firefox yet.
    }
}