'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach, it */

describe('Protractor Security RAT option column contents/types entities testsuite', function() {
	var entities = element(by.partialLinkText('Entities'));
	var optColumnRepeater = 'optColumn in optColumns | orderBy: \'showOrder\' | filter:searchString';
	var optColumnContentRepeater = 'optColumnContent in optColumnContents | filterCategoryForEntities : selectedOptColumns : \'optColumn\'| filter:searchString | orderBy: [\'requirementSkeleton.reqCategory.showOrder\', \'requirementSkeleton.showOrder\', \'optColumn.showOrder\'] | limitTo:numberToDisplay';

	beforeEach(function() {
		browser.get(browser.params.testHost);

	});
	var deleteCollectionInstance = function() {
		var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
		var instanceOrders = element.all(by.repeater('optColumn in optColumns | orderBy: \'showOrder\' | filter:searchString')
				.column('optColumn.showOrder'));
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
	var deleteContent = function() {
		var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
		var contents = element.all(by.id('content'));
		contents.each(function(elem, indexElem) {
			elem.getText().then(function(elemText) {
				if(elemText === 'test optColumn content modification') {
					deletes.get(indexElem).click();
					browser.sleep(2000);
					element.all(by.buttonText('Delete')).last().click();
					browser.sleep(1000);
				}
			}, function(){});
		});
	};

	it('administering an option column type', function() {
		entities.click();
		element(by.partialLinkText('Optional Column Types')).click();
		element.all(by.repeater('optColumnType in optColumnTypes'))
		.then(function(categoryArray) {
			var count = categoryArray.length;
			count++;
			element(by.buttonText('Create a new Optional Column Type')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.id('field_name')).sendKeys('test option column type name <script>alert(1)</script>');
			element(by.id('field_description')).sendKeys('test option column type  description <script>alert(1)</script>');
			element(by.buttonText('Save')).click();
			browser.sleep(3000);
			expect(element.all(by.repeater('optColumnType in optColumnTypes')).count()).toBe(count);
		});
		element.all(by.buttonText('Edit')).last().click();
		browser.sleep(2000);
		element(by.id('field_description')).clear().then(function(){
			element(by.id('field_description')).sendKeys('test option column type  description modification <script>alert(1)</script>');
		});

		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		element.all(by.buttonText('Delete')).last().click();
		browser.sleep(2000);
		element.all(by.buttonText('Delete')).last().click();
		browser.sleep(1500);
	});

//	it('searching a option column', function() {
//		entities.click();
//		element(by.partialLinkText('Option Columns')).click();
//		element(by.id('searchQuery')).sendKeys('More Information');
//		element(by.id('searchButton')).click();
//		expect(element.all(by.repeater(optColumnRepeater)).count()).toBe(1);
//		browser.sleep(2000);
//		element(by.id('searchQuery')).clear().then(function(){
//		});
//		element(by.id('searchButton')).click();
//	});

	it('administering a opticon column', function() {
		entities.click();
		element(by.partialLinkText('Optional Columns')).click();
		browser.sleep(2000);
		element.all(by.repeater(optColumnRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Optional Column')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.id('field_name')).sendKeys('test optColumn name <script>alert(1)</script>');
			element(by.id('field_description')).sendKeys('test optColumn description <script>alert(1)</script>');
            element(by.id('field_showOrder')).sendKeys('1000');
            element.all(by.options("optColumnType as optColumnType.name for optColumnType in optcolumntypes track by optColumnType.id")).get(1).click();
			element(by.buttonText('Save')).click();
			browser.sleep(3000);
			expect(element.all(by.repeater(optColumnRepeater))
					.count()).toBe(count);
		});
		var instanceOrders = element.all(by.repeater(optColumnRepeater)
				.column('optColumn.showOrder'));
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
			element(by.id('field_description')).sendKeys('test optColumn description modification <script>alert(1)</script>');
		});
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		deleteCollectionInstance();
	});

	it('bulk change option column', function() {
		entities.click();
		element(by.partialLinkText('Optional Columns')).click();
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
	});

	it('administering a opticon column content', function() {
		entities.click();
		element(by.partialLinkText('Optional Column Contents')).click();
		browser.sleep(2000);
		element.all(by.repeater(optColumnContentRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			var allOptions = element.all(by.tagName('option'));
			element(by.buttonText('Create a new Optional Column Content')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.id('field_content')).sendKeys('test optColumn content <script>alert(1)</script>');
			element(by.cssContainingText('option', 'More Information')).click();
			allOptions.each(function(elem) {
				elem.getText().then(function(text) {
					if(text.indexOf('LC-01') !== -1) {
						element(by.model('optColumnContent.requirementSkeleton')).sendKeys(text);
					}
				});
			});
			element(by.buttonText('Save')).click();
			browser.sleep(5000);
			expect(element.all(by.repeater(optColumnContentRepeater))
					.count()).toBe(count);
		});

		var contents = element.all(by.id('content'));
		var edits = element.all(by.buttonText('Edit'));
		contents.each(function(element, index) {
			element.getText().then(function(elemText) {
				if(elemText === 'test optColumn content') {
					edits.get(index).click();
				}
			});
		});
		browser.sleep(3000);
		var allOptions = element.all(by.tagName('option'));
		element(by.id('field_content')).clear().then(function(){
			element(by.id('field_content')).sendKeys('test optColumn content modification <script>alert(1)</script>');
		});
		allOptions.each(function(elem) {
			elem.getText().then(function(text) {
				if(text.indexOf('LC-02') !== -1) {
					element(by.model('optColumnContent.requirementSkeleton')).sendKeys(text);
				}
			});
		});
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		deleteContent();
	});

});