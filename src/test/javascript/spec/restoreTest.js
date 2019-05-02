'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach, it */

describe('Protractor Security RAT restoring session testsuite', function() {
	var defineArtifact = element(by.id('defineArtifact'));
	var restoreSession = element(by.id('restoreSession'));
	var deleteSession = element(by.id('deleteSession'));
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
	});
	 
	it('prepares restoring test.', function() {
		defineArtifact.click();
		var artifactName = element(by.model('starterForm.name'));
		artifactName.sendKeys('some artifact');
		element.all(by.buttonText('Select')).each(function(elemt) {
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
		(element(by.buttonText('Generate'))).click();
		browser.sleep(2000);
		var list = element.all(by.tagName('textarea'));
		list.first().sendKeys('restore session test.');
		browser.sleep(65000);
		browser.refresh().then(function(){}, function() {
			browser.switchTo().alert().accept();
		});
		
	});
	
	//restores previous session.
	it('Restores a previous session and html presentation', function() {
		element(by.id('restoreSession')).isPresent().then(function(v){ 
		    expect(v).toBe(true);
		});
		
		restoreSession.click();
		
		browser.sleep(5000);
		element(by.buttonText('Close')).click();
		browser.sleep(3000);
		// checks for the restored session according to the comment written before.
		// expect(list.first().getText()).toBe("restore session test.");
		element(by.id('selectAll')).click();
		element(by.buttonText('Action with selected')).click();
		element(by.partialLinkText('Create slides')).click();
		browser.sleep(3000);
		element(by.buttonText('Create')).click();
		browser.sleep(10000);
	});
	
	it('Delete local storage backup', function() {
		element(by.id('deleteSession')).isPresent().then(function(v){ 
		    expect(v).toBe(true);
		});
		deleteSession.click();
		element(by.buttonText('OK')).click();
		
		var value = browser.executeScript('return window.localStorage.getItem(\'sdlc.backup\');');
		expect(value).toEqual(null);
	});

});