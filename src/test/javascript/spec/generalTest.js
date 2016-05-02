describe('Protractor Secure SDLC Tool general testsuite', function() {
	var defineArtifact = element(by.id('defineArtifact'));
	
	beforeAll(function() {
		browser.driver.executeScript(function(jiraQueue) {
			  (function(a){
				  document.body.appendChild(a);
				  a.setAttribute('href', jiraQueue);
				  a.setAttribute('target', 'blank');
				  a.dispatchEvent((function(e){
					  e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
					  return e;
			  }(document.createEvent('MouseEvents'))))}(document.createElement('a')));
			}, browser.params.jiraQueue);
		browser.sleep(15000);
	});
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
	});
	
	it('should have title Secure SDLC', function() {
		browser.sleep(5000);
		expect(browser.getTitle()).toEqual('Secure SDLC');
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