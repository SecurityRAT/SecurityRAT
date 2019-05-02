'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, document, beforeEach, beforeAll, it, window */

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
					  e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
					  return e;
			  }(document.createEvent('MouseEvents'))));}(document.createElement('a')));
			}, browser.params.jiraQueue);
		// wait for the user to log into the jira queue.
		browser.sleep(15000);
		browser.driver.executeScript(function(jiraRemoteLinkQueue) {
			  (function(a){
				  // append a link to the jira queue to the DOM and clicks it. 
				  document.body.appendChild(a);
				  a.setAttribute('href', jiraRemoteLinkQueue);
				  a.setAttribute('target', 'blank');
				  a.dispatchEvent((function(e){
					  e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
					  return e;
			  }(document.createEvent('MouseEvents'))));}(document.createElement('a')));
			}, browser.params.jiraRemoteLinkQueue);
		// wait for the user to log into the jira queue.
		browser.sleep(15000);
		// browser.get(browser.params.testHost);
		// element(by.id('username')).clear().then(function(){
		// 	element(by.id('username')).sendKeys(browser.params.admin.user);
		// });
		// element(by.id('password')).clear().then(function(){
		// 	element(by.id('password')).sendKeys(browser.params.admin.password);
		// });
		// element(by.partialButtonText('Authenticate')).click();
		// browser.sleep(2000);
	});
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
	});
	
	it('should have title Secure SDLC', function() {
		browser.sleep(3000);
		expect(browser.getTitle()).toEqual('SecurityRAT');
	});

	it('should have an error due to / in artifact name and generate button is disabled', function() {
		defineArtifact.click();
		var artifactName = element(by.model('starterForm.name'));
		artifactName.sendKeys('some artifact /');
		var list = element.all(by.id('falsePattern'));
		expect(element(by.buttonText('Generate')).isEnabled()).toEqual(false);
	    expect(list.count()).toBe(1);
	});
	
});
