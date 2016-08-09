describe('Protractor Security RAT general testsuite', function() {
	var defineArtifact = element(by.id('defineArtifact'));
	var restoreSession = element(by.id('restoreSession'));
	var deleteSession = element(by.id('deleteSession'));
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
	});
	 
	it('log out test.', function() {
		element(by.partialLinkText("Account")).click();
		element(by.partialLinkText("Log out")).click();
		browser.sleep(5000);
	});
	
});