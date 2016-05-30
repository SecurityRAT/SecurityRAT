describe('Protractor Security RAT general testsuite', function() {
	var defineArtifact = element(by.id('defineArtifact'));
	var restoreSession = element(by.id('restoreSession'));
	var deleteSession = element(by.id('deleteSession'));
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
	});
	 
	it('prepares restoring test.', function() {
		defineArtifact.click();
		var artifactName = element(by.model('starterForm.name'));
		artifactName.sendKeys("some artifact");
		element.all(by.buttonText('Select')).last().click();
		element(by.linkText('Internal')).click();
		element.all(by.buttonText('Select')).each(function(elemt, index) {
			elemt.click().then(function() {
				element(by.linkText('High')).isPresent().then(function(isInternally){
					if(isInternally) {
						element(by.linkText('High')).click();
					}else {
						element(by.linkText('Mobile App')).isPresent().then(function(isMobile){
							if(isMobile) {
								element(by.linkText('Mobile App')).click();
							}else {
								elemt.click();
							}
						});
					}
				});
			});
		});
		element(by.buttonText('High')).click();
		(element(by.linkText('Low'))).click();
		(element(by.buttonText("Generate"))).click();
		browser.sleep(2000);
		var list = element.all(by.tagName('textarea'));
		list.first().sendKeys("restore session test.");
		browser.sleep(65000);
		browser.refresh().then(function(){}, function() {
			browser.switchTo().alert().accept();
		});
		
	});
	
	//restores previous session.
	it('Restores a previous session', function() {
		element(by.id('restoreSession')).isPresent().then(function(v){ 
		    expect(v).toBe(true);
		});
		
		restoreSession.click();
		
		browser.sleep(5000);
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		var list = element.all(by.tagName('textarea'));
		// checks for the restored session according to the comment written before.
		expect(list.first().getText()).toBe("restore session test.");
	});
	
	it('Delete local storage backup', function() {
		element(by.id('deleteSession')).isPresent().then(function(v){ 
		    expect(v).toBe(true);
		});
		deleteSession.click();
		element(by.buttonText("OK")).click();
		
		var value = browser.executeScript("return window.localStorage.getItem('sdlc.backup');");
		expect(value).toEqual(null);
	});

});