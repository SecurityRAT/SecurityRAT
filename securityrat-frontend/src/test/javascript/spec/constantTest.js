'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, beforeEach, it */

describe('Protractor Security RAT application constants testsuite', function() {
	var admin = element(by.partialLinkText('Administration'));
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
		
	});
	
//	it('searching for a constant', function() {
//		admin.click();
//		element(by.partialLinkText('Constants')).click();
//		element(by.id('searchQuery')).sendKeys('custom');
//		element(by.id('searchButton')).click();
//		expect(element.all(by.repeater(constantRepeater)).count()).toBe(1);
//		
//	});
	
	it('administering a constant', function() {
		admin.click();
		element(by.partialLinkText('Constants')).click();
		element.all(by.buttonText('Edit')).first().click();
		browser.sleep(2000);
		element(by.id('field_description')).clear().then(function(){
			element(by.id('field_description')).sendKeys('This is the short name representation for the custom requirements.<script>alert(1)</script>');
		});
		
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		element.all(by.buttonText('Edit')).first().click();
		browser.sleep(3000);
		element(by.id('field_description')).clear().then(function(){
			element(by.id('field_description')).sendKeys('This is the short name representation for the custom requirements.');
		});
		
		element(by.buttonText('Save')).click();
		browser.sleep(3000);
	});
	
	// test for server side input validation.
//	var formData = new FormData();
//	formData.append('id", "1');
//	formData.append('name", "customRequirementName');
//	formData.append('value", "CUS-');
//	formData.append('description", "This is the short name representation for the custom requirements.');
//	    		var constants = [];
//	    		var ajax = new XMLHttpRequest();
//	        	ajax.open('PUT","admin-api/configConstants",true);
//	        	ajax.onreadystatechange = function(){
//	        			if(this.readyState == 4){
//	        				if(this.status == 200){
//	                  alert(this.responseText);
//	                }
//	        					
//	        			}
//	        		}
//	          
//	          ajax.withCredentials = true;
//	ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;');
//	ajax.send(formData);
	
	
});