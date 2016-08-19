describe('Protractor Security RAT general testsuite', function() {
	var browseLink = element(by.partialLinkText('Browse'));
	var constantRepeater = "requirementSkeleton in requirementSkeletons| orderBy : ['reqCategory.showOrder','showOrder']| filter: searchQuery | filter: {active: true} track by requirementSkeleton.id";
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
		
	});
	
	it('test suite for browse requirements', function() {
		browseLink.click();
		element(by.partialLinkText('Requirements')).click();
		element(by.id('fesearchQuery')).sendKeys('AU-01');
		browser.sleep(3000);
		expect(element.all(by.repeater(constantRepeater)).count()).toBe(1);
		element(by.buttonText('View')).click();
		browser.sleep(6000);
		element(by.buttonText('Back')).click();
	});
});