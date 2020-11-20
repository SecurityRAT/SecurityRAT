'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach,  it */

describe('Protractor Security RAT implementation type entity testsuite', function() {
	var entities = element(by.partialLinkText('Entities'));
	var projectTypeRepeater = 'projectType in projectTypes | filter:searchString | orderBy:\'showOrder\'';
	beforeEach(function() {
		browser.get(browser.params.testHost);
		
	});
	var deleteCollectionInstance = function(repeaterValue, elem) {
		var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
		var instanceOrders = element.all(by.repeater(repeaterValue)
				.column(elem));
		instanceOrders.each(function(elem, indexElem) {
			elem.getText().then(function(elemText) {
				if(elemText === '1000') {
					deletes.get(indexElem).click();
					browser.sleep(2000);
					element.all(by.buttonText('Delete')).last().click();
					browser.sleep(1000);
				}
			}, function(){});
		});
	};
	
//	it('searching a implementation type', function() {
//		entities.click();
//		element(by.partialLinkText('Implementation Types')).click();
//		element(by.id('searchQuery')).sendKeys('internal');
//		element(by.id('searchButton')).click();
//		expect(element.all(by.repeater(projectTypeRepeater))
//				.count()).toBe(1);
//		browser.sleep(2000);
//		element(by.id('searchQuery')).clear().then(function(){
//		});
//		element(by.id('searchButton')).click();		
//	});
	
	
	it('adminisetring an implementation type', function() {
		entities.click();
		element(by.partialLinkText('Implementation Types')).click();
		browser.sleep(2000);
		deleteCollectionInstance(projectTypeRepeater,'projectType.showOrder');
		element.all(by.repeater(projectTypeRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Implementation Type')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.id('field_name')).sendKeys('test set name <script>alert(1)</script>');
			element(by.id('field_description')).sendKeys('test set description <script>alert(1)</script>');
			element(by.id('field_showOrder')).sendKeys('1000');
			element(by.cssContainingText('option', 'Motivation')).click();
			element(by.cssContainingText('option', 'Strategy')).click();
			element(by.buttonText('Save')).click();
			browser.sleep(3000);
			expect(element.all(by.repeater(projectTypeRepeater))
					.count()).toBe(count);
		});
		var instanceOrders = element.all(by.repeater(projectTypeRepeater)
				.column('projectType.showOrder'));
		var edits = element.all(by.buttonText('Edit'));
		instanceOrders.each(function(element, index) {
			element.getText().then(function(elemText) {
				if(elemText === '1000') {
					edits.get(index).click();
				}
			});
		});
		browser.sleep(2000);
		element(by.id('field_description')).clear().then(function(){
			element(by.id('field_description')).sendKeys('test set description modification <script>alert(1)</script>');
		});
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		deleteCollectionInstance(projectTypeRepeater, 'projectType.showOrder');
	});
	
	it('bulk change for implementation type', function() {
		
		entities.click();
		element(by.partialLinkText('Implementation Types')).click();
		var selectButton = element.all(by.model('projectType.selected'));
		element(by.id('selectAll')).click();
		browser.sleep(1000);
		expect(element(by.buttonText('Bulk change with selected')).isPresent()).toBe(true);
		element(by.buttonText('Bulk change with selected')).click();
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText('Save')).click();
		browser.sleep(6000);
		element(by.id('selectAll')).click();
		browser.sleep(1000);
		expect(element(by.buttonText('Bulk change with selected')).isPresent()).toBe(true);
		element(by.buttonText('Bulk change with selected')).click();
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText('Save')).click();
		browser.sleep(1500);
		selectButton.first().click();
		selectButton.get(1).click();
		element(by.buttonText('Bulk change with selected')).click();
		var optColumnCheckboxes = element.all(by.model('selectedOptColumns[optColumn.id].value'));
		var statColumnCheckboxes = element.all(by.model('selectedStatusColumns[statColumn.id].value'));
		optColumnCheckboxes.get(1).click(); // Motivation checkbox clicked.
		statColumnCheckboxes.first().click(); // Strategy checkbox clicked.
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		element.all(by.repeater(projectTypeRepeater).column('projectType.name')).each(function(elem, index) {
			elem.getText().then(function(elemText) {
				if(elemText === 'Internal') {
				} else if(elemText === 'External'){
					selectButton.get(index).click();
				}
			});
		});
		browser.sleep(1000);
		selectButton.first().click();
		selectButton.get(1).click();
		element(by.partialButtonText('Bulk change with selected')).click();
		optColumnCheckboxes.get(1).click(); // Motivation checkbox clicked.
		statColumnCheckboxes.first().click(); // Strategy checkbox clicked.
		element(by.buttonText('Save')).click();
		browser.sleep(1500);
	});
	
});