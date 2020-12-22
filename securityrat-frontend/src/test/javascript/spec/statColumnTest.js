'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach, it */

describe('Protractor Security RAT statuscolumn values entities testsuite', function() {
	var entities = element(by.partialLinkText('Entities'));
	var statValueRepeater = 'statusColumnValue in statusColumnValues | filterCategoryForEntities: selectedColumns: \'statusColumn\'| filter:searchString | orderBy: [\'statusColumn.showOrder\',\'showOrder\']';
	var statusColumRepeater = 'statusColumn in statusColumns | orderBy: \'showOrder\' | filter:searchString';
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

	it('administering a status column', function() {
		entities.click();
		element(by.partialLinkText('Status Columns')).click();
		browser.sleep(2000);
		deleteCollectionInstance(statusColumRepeater, 'statusColumn.showOrder');
		element.all(by.repeater(statusColumRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Status Column')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.id('field_name')).sendKeys('test statColumn name <script>alert(1)</script>');
			element(by.id('field_description')).sendKeys('test statColumn description <script>alert(1)</script>');
			element(by.id('field_showOrder')).sendKeys('1000');
			element(by.buttonText('Save')).click();
			browser.sleep(3000);
			expect(element.all(by.repeater(statusColumRepeater))
					.count()).toBe(count);
		});
		var instanceOrders = element.all(by.repeater(statusColumRepeater)
				.column('statusColumn.showOrder'));
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
			element(by.id('field_description')).sendKeys('test statColumn description modification <script>alert(1)</script>');
		});
		element.all(by.css('span[class="bootstrap-switch-label"]')).each(function(elem) {
			elem.click();
		});
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		deleteCollectionInstance(statusColumRepeater, 'statusColumn.showOrder');
	});

	it('bulk change for status column', function() {
		entities.click();
		element(by.partialLinkText('Status Columns')).click();
		element(by.id('selectAll')).click();
		browser.sleep(1000);
		expect(element(by.buttonText('Bulk change with selected')).isPresent()).toBe(true);
		element(by.buttonText('Bulk change with selected')).click();
		element.all(by.css('span[class="bootstrap-switch-label"]')).first().click();
		element(by.buttonText('Save')).click();
		browser.sleep(6000);
		element(by.id('selectAll')).click();
		browser.sleep(1000);
		expect(element(by.buttonText('Bulk change with selected')).isPresent()).toBe(true);
		element(by.buttonText('Bulk change with selected')).click();
		element.all(by.css('span[class="bootstrap-switch-label"]')).first().click();
		element(by.buttonText('Save')).click();
		browser.sleep(1500);
	});

	it('adminisetring status column value', function() {
		entities.click();
		element(by.partialLinkText('Status Column Values')).click();
		browser.sleep(2000);
		deleteCollectionInstance(statValueRepeater,'statusColumnValue.showOrder');
		element.all(by.repeater(statValueRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Status Column Value')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.id('field_name')).sendKeys('test Value name <script>alert(1)</script>');
			element(by.id('field_description')).sendKeys('test Value description <script>alert(1)</script>');
			element(by.id('field_showOrder')).sendKeys('1000');
			element(by.cssContainingText('option', browser.params.defaultStatColumn)).click();
			element(by.buttonText('Save')).click();
			browser.sleep(3000);
			expect(element.all(by.repeater(statValueRepeater))
					.count()).toBe(count);
		});
		var instanceOrders = element.all(by.repeater(statValueRepeater)
				.column('statusColumnValue.showOrder'));
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
			element(by.id('field_description')).sendKeys('test Value description modification <script>alert(1)</script>');
		});
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		deleteCollectionInstance(statValueRepeater, 'statusColumnValue.showOrder');
	});

	it('bulk change for status columns values', function() {

		entities.click();
		element(by.partialLinkText('Status Column Values')).click();
		var selectButton = element.all(by.model('statusColumnValue.selected'));
		var statusColumn = element.all(by.repeater(statValueRepeater)
		.column('statusColumnValue.statusColumn.name'));
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
		selectButton.first().click();
		selectButton.get(1).click();
		element(by.buttonText('Bulk change with selected')).click();
		element(by.buttonText(browser.params.defaultStatColumn)).click();
		element(by.buttonText('Save')).click();
		browser.sleep(1500);
	});

});