// spec.js

'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach, it */

describe('Protractor Security RAT bug Scenarios Testsuite', function() {
	var entities = element(by.partialLinkText('Entities'));
	var defineArtifact = element(by.id('defineArtifact'));
	var restoreSession = element(by.id('restoreSession'));
	var skeletonRepeater = 'requirementSkeleton in requirementSkeletons | filterCategoryForEntities : selectedCategory:\'reqCategory\'| filterByTagForReqSkeletons : selectedTags | filterByCollsForReqSkeletons : selectedColls| filterByTypesForReqSkeletons : selectedTypes | filter:searchString | orderBy : [\'reqCategory.showOrder\',\'showOrder\'] | limitTo:numberToDisplay'; 
	var optColumnContentRepeater = 'optColumnContent in optColumnContents | filterCategoryForEntities : selectedOptColumns : \'optColumn\'| filter:searchString | orderBy: [\'requirementSkeleton.reqCategory.showOrder\', \'requirementSkeleton.showOrder\', \'optColumn.showOrder\'] | limitTo:numberToDisplay';
	var optColumnRepeater = 'optColumn in optColumns | orderBy: \'showOrder\' | filter:searchString';
	var SaveButton = 'Save';
	
	var refreshBrowser = function()	 {
		browser.refresh().then(function() {}, function(){
			browser.sleep(3000);
			browser.switchTo().alert().accept();
		});
	};

	var generateRequirementSet = function(artifactName, impType) {
		defineArtifact.click();
		element(by.model('starterForm.name')).sendKeys(artifactName);
		element.all(by.buttonText('Select')).last().click();
		browser.sleep(500);
		(element(by.linkText(impType))).click();
		
		(element(by.buttonText('Generate'))).click();
		browser.sleep(5000);
	};

	var switchActiveButtonForOptColumn = function(name) {
		browser.get(browser.params.testHost);
		entities.click();
		element(by.partialLinkText('Optional Columns')).click();
		browser.sleep(1000);
		var instanceOrders = element.all(by.repeater(optColumnRepeater)
				.column('optColumn.name'));
		var edits = element.all(by.buttonText('Edit'));
		instanceOrders.each(function(element, index) {
			element.getText().then(function(elemText) {
				if(elemText === name) {
					edits.get(index).click();
				}
			});
		});
		element(by.css('span[class="bootstrap-switch-label"]')).click();
	};

	beforeEach(function() {
		browser.get(browser.params.testHost);
	});

	it('Issue where taginstance ids are not locally updated on import.', function() {
		entities.click();
		element(by.partialLinkText('Requirement Skeletons')).click();
		browser.sleep(2000);
		element.all(by.repeater(skeletonRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Requirement Skeleton')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.cssContainingText('option', 'Lifecycle')).click();
			element(by.id('field_shortName')).sendKeys('BUGTAGAID-01');
			element(by.id('field_description')).sendKeys('test skeleton description');
			element(by.id('field_showOrder')).sendKeys('10000');
			element(by.css('span[class="bootstrap-switch-label"]')).click();
			var tagInstanceCheckboxes = element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.tagInstances, tagInstance)"]'));
			var collInstanceCheckboxes = element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.collectionInstances, collectionInstance)"]'));
			var typeCheckboxes = element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.projectTypes, projectType)"]'));
			tagInstanceCheckboxes.first().click();
			tagInstanceCheckboxes.get(3).click();
			collInstanceCheckboxes.first().click();
			collInstanceCheckboxes.get(3).click();
			typeCheckboxes.each(function(element) {
				element.click();
			});
			// typeCheckboxes.first().click();
			element(by.buttonText('Save')).click();
			browser.sleep(3000);
		});
		browser.get(browser.params.testHost);
		generateRequirementSet('-+.:()[],!#$%\'*=?`{}~;@&some artifact', 'Internal');
		refreshBrowser();
		browser.get(browser.params.testHost);
		//create new tag instance
		entities.click();
		element(by.partialLinkText('Tag Instances')).click();
		browser.sleep(2000);
		element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\']'))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Tag Instance')).click();
			browser.sleep(2000);
			expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
			element(by.id('field_name')).sendKeys('Tag id bug');
			element(by.id('field_description')).sendKeys('test Instance description bug issue');
			element(by.id('field_showOrder')).sendKeys('0');
			element(by.css('span[class="bootstrap-switch-label"]')).click();
			element(by.cssContainingText('option', 'Requirement Owner')).click();
			element(by.buttonText('Save')).click();
			browser.sleep(3000);
			expect(element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\']'))
					.count()).toBe(count);
		});
		browser.get(browser.params.testHost);
		entities.click();
		element(by.partialLinkText('Requirement Skeletons')).click();
		browser.sleep(2000);
		var instanceOrders = element.all(by.repeater(skeletonRepeater).column('requirementSkeleton.shortName'));
		var edits = element.all(by.buttonText('Edit'));
		instanceOrders.each(function(element, index) {
			element.getText().then(function(elemText) {
				if(elemText === 'BUGTAGAID-01') {
					edits.get(index).click();
				}
			});
		});
		browser.sleep(2000);
		element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.tagInstances, tagInstance)"]')).first().click();
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		// restoring locally stored session
		browser.get(browser.params.testHost);
		restoreSession.click();
		
		browser.sleep(5000);
		element(by.buttonText('Close')).click();
		browser.sleep(3000);
		element(by.linkText('Tags')).click();
		element.all(by.name('tagInstances')).first().click();
		browser.sleep(6000);
		
 	});

	it('Dropdown list in exported file is filled with empty values.', function() {
		generateRequirementSet('test artifact', 'External');
		element(by.id('selectAll')).click();
		element(by.partialButtonText('Action with selected')).click();
		element(by.linkText('Create spreadsheet')).click();
		browser.sleep(2000);
		element(by.buttonText('Create')).click();
		browser.sleep(2000);
		refreshBrowser();
	});

	it('Test bug where view in editor is broken due to optColumn contents', function() {
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
			element(by.id('field_content')).sendKeys('test broken view in editor');
			element(by.cssContainingText('option', 'More Information')).click();
			allOptions.each(function(elem) {
				elem.getText().then(function(text) {
					if(text.indexOf('LC-01') !== -1) {
						element(by.model('optColumnContent.requirementSkeleton')).sendKeys(text);
					}
				});
			});
			element(by.buttonText('Save')).click();
			browser.sleep(2000);
		});

		browser.get(browser.params.testHost);
		generateRequirementSet('test artifact', 'External');
		element(by.buttonText('Search')).click();
		element(by.model('search')).sendKeys('test broken view in editor');
		browser.sleep(2000);
		expect(element(by.binding('filterRequirements()).length')).getText()).toBe('1');

		// clean up
		refreshBrowser();
		browser.get(browser.params.testHost);
		entities.click();
		element(by.partialLinkText('Optional Column Contents')).click();
		browser.sleep(4000);
		var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
		var contents = element.all(by.id('content'));
		contents.each(function(elem, indexElem) {
			elem.getText().then(function(elemText) {
				if(elemText === 'test broken view in editor') {
					deletes.get(indexElem).click();
					browser.sleep(2000);
					element.all(by.buttonText('Delete')).last().click();
					browser.sleep(1000);
				}
			}, function(){});
		});
		browser.sleep(3000);
		switchActiveButtonForOptColumn('Motivation');
		element(by.buttonText('Save')).click();
		browser.sleep(2000);
		browser.get(browser.params.testHost);
		restoreSession.click();
		browser.sleep(5000);

		// cleanup
		switchActiveButtonForOptColumn('Motivation');
	});

	it('Test bug where update available in not working', function() {
		browser.get(browser.params.impTestAttachmentUrl + browser.params.attachmentUrls[3]).then(function() {}, function(){
			browser.switchTo().alert().accept();
		});
		browser.sleep(5000);
		(element(by.buttonText('Close'))).click();
		browser.sleep(3000);
		element(by.buttonText('Updates available')).isPresent().then(function(){ 
		    element(by.buttonText('Updates available')).click();
		    browser.wait(function() {
				return element(by.buttonText('Close')).isPresent();
			});
		    browser.sleep(3000);
		    element(by.buttonText('Close')).click();
		    browser.sleep(3000);
		    element(by.buttonText('Updates available')).isPresent().then(function() {
		    	var acceptReq = element.all(by.id('acceptReq'));
		    	expect(acceptReq.count()).toBeGreaterThan(0);
		    	expect(element.all(by.id('removeReq')).count()).toBeGreaterThan(0);
		    	
			    element.all(by.id('acceptReq')).isPresent().then(function() {
				    expect(element(by.buttonText('Updates available')).isEnabled()).toBe(false);
				    expect(element(by.buttonText(SaveButton)).isEnabled()).toBe(false);
				    var acceptList = element.all(by.id('acceptReq'));
				    
				    acceptList.each(function(element) {
			    		element.click();
				    });
				    browser.sleep(5000);
				});
			});
		});
		refreshBrowser();
		browser.get(browser.params.impTestAttachmentUrl + browser.params.attachmentUrls[3]).then(function() {}, function(){
			browser.switchTo().alert().accept();
		});
		browser.sleep(5000);
		(element(by.buttonText('Close'))).click();
		browser.sleep(3000);
		element(by.buttonText('Updates available')).isPresent().then(function(){ 
		    element(by.buttonText('Updates available')).click();
		    browser.wait(function() {
				return element(by.buttonText('Close')).isPresent();
			});
		    browser.sleep(3000);
		    element(by.buttonText('Close')).click();
		    browser.sleep(3000);
		    element(by.buttonText('Updates available')).isPresent().then(function() {
				var acceptReq = element.all(by.id('acceptReq'));
		    	expect(acceptReq.count()).toBeGreaterThan(0);
		    	expect(element.all(by.id('acceptReq')).count()).toBeGreaterThan(0);
		    	
			    element.all(by.id('removeReq')).isPresent().then(function() {
				    expect(element(by.buttonText('Updates available')).isEnabled()).toBe(false);
				    expect(element(by.buttonText(SaveButton)).isEnabled()).toBe(false);
				    var removeList = element.all(by.id('removeReq'));
				    
				    removeList.each(function(element) {
			    		element.click();
				    });
				    browser.sleep(5000);
				});
			});
		});

	});
});