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
        admin: {
            user: '#{admin username}',
            password: '#{admin password}'
        },// this is only relevant when you use FORM authentication.
        customRequirementShortName: 'CUS',
        testHost: "https://securityrat.test.local", //FQDN of test instance of Security RAT
        jiraQueue: 'https://test-jira.local/browse/XYZ', //path to a JIRA Queue where test tickets can be opened
        jiraTicket: 'https://test-jira.local/browse/XYZ-144', //path to a JIRA Ticket to test manual linking of tickets
        jiraRemoteLinkQueue: 'https://second-test-jira.local/browse/ABC', // second jira to test the remote linking. Please this Queue should just have issuetype as mandatory field.
        jiraRemoteLinkTicket: 'https://second-test-jira.local/browse/ABC-524', // an existing ticket from the second jira instance to test manual linking
        jiraHost: 'https://test-jira.local/browse/', //path to test JIRA
        impTestAttachmentUrl: 'https://securityrat.test.local/?file=',
        impTestUrl2: 'https://securityrat.test.local/?ticket=https://test-jira.local/browse/XYZ-123', // the specied ticket in the "ticket" parameter should preferably have different attachment types. For e.g .yml, .xlsx.
        impTestFileUrl: 'https://securityrat.test.local/?file=https:%2F%2Ftest-jira.local%2Fsecure%2Fattachment%2F685933%2FSSDLC_sfgsfgsfg_17-2-2016_134738.yml', // set the file parameter with a copied the link address to an attached file in a JIRA ticket
        attachmentUrls: ['#{id1}', //Any attachment id. See file query parameter of exported attachments in JIRA Queue
            '#{id2}', //The file attachment corresponding to this "id" muss be deleted in JIRA Tickets.
            '#{id3}', // this attachment must display the update available button. That means some requirements from the yaml file muss need changes .
            '#{id4}', // The attachment corresponding to this Id should have issues links.
            '#{id5}' // this attachment must have custom requirements.
        ],
        issueNumbers: ['#{issuenum1}', // JIRA issue number from "jiraQueue" containing one attachment added through by SecurityRAT
            '#{issuenum2}' // JIRA issue number from "jiraQueue" containing more than one attachment added through SecurityRAT
        ],
        issuetypes: ['#{issuetype1}', // issuetype with no mandatory fields other than project, summary name and reporter e.g Bug
            '#{issuetype2}', // an issue type with a mandatory fields besides project, summary name or reporter e.g Epic
            '#{issuetype3}' // issue type for the {jiraRemoteLinkQueue} propperty
        ],
        email: '#{registrationEmail}' // Email address to test for the registration.
    },
    capabilities: {
        'browserName': 'chrome' // or 'firefox' for firefox please use version 36 or less because the selenium driver doesn't support later versions of firefox yet.
    }
}
