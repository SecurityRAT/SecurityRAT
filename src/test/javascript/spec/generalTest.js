describe('Protractor Security RAT general testsuite', function() {
	var defineArtifact = element(by.id('defineArtifact'));
	
	beforeAll(function() {
		browser.driver.executeScript(function(jiraQueue) {
			  (function(a){
				  // append a link to the jira queue to the DOM and clicks it. 
				  document.body.appendChild(a);
				  a.setAttribute('href', jiraQueue);
				  a.setAttribute('target', 'blank');
				  a.dispatchEvent((function(e){
					  e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
					  return e;
			  }(document.createEvent('MouseEvents'))))}(document.createElement('a')));
			}, browser.params.jiraQueue);
		// wait for the user to log into the jira queue.
		browser.sleep(20000);
	});
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
	});
	
	it('should have title Secure SDLC', function() {
		browser.sleep(15000);
		expect(browser.getTitle()).toEqual('SecurityRAT');
	});
	
	it('should have an error due to / in artifact name and generate button is disabled', function() {
		defineArtifact.click();
		var artifactName = element(by.model('starterForm.name'));
		artifactName.sendKeys("some artifact /");
		var list = element.all(by.id('falsePattern')); 
		expect(element(by.buttonText("Generate")).isEnabled()).toEqual(false);
	    expect(list.count()).toBe(1);
	});
	
});