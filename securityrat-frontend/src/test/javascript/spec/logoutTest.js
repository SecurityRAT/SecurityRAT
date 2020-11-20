'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, beforeEach,  it */

describe('Protractor Security RAT logout CAS testsuite', function() {
	beforeEach(function() {
		browser.get(browser.params.testHost);
	});
	 
	it('log out test.', function() {
		element(by.partialLinkText('Account')).click();
		element(by.partialLinkText('Log out')).click();
		browser.sleep(5000);
	});
	
});