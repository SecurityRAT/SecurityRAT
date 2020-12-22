'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, document, beforeEach, it */

describe('Protractor Security RAT alternative set/instance entities testsuite', function () {
    var entities = element(by.partialLinkText('Entities'));
    var confirmDelete = element(by.css('button[ng-disabled="deleteForm.$invalid"]'));
    var AltSetRepeater = "alternativeSet in alternativeSets | filterCategoryForEntities : selectedOptColumns : 'optColumn' | filter:searchString | orderBy: ['optColumn.showOrder','showOrder']";
    var AltInsRepeater = "alternativeInstance in alternativeInstances | filterCategoryForEntities: selectedAlternativeSets : 'alternativeSet'| filter:searchString | orderBy: ['alternativeSet.showOrder', 'requirementSkeleton.reqCategory.showOrder', 'requirementSkeleton.showOrder']";
    beforeEach(function () {
        browser.get(browser.params.testHost);

    });
    var deleteCollectionInstance = function (repeaterValue, elem) {
        var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
        var instanceOrders = element.all(by.repeater(repeaterValue)
            .column(elem));
        instanceOrders.each(function (elem, indexElem) {
            elem.getText().then(function (elemText) {
                if (elemText === "1000") {
                    deletes.get(indexElem).click();
                    browser.sleep(2000);
                    element.all(by.buttonText('Delete')).last().click();
                    browser.sleep(1000);
                }
            }, function () { })
        });
    }
    var deleteContent = function () {
        var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
        var contents = element.all(by.id("content"));
        contents.each(function (elem, indexElem) {
            elem.getText().then(function (elemText) {
                if (elemText === "test instance content modification") {
                    deletes.get(indexElem).click();
                    browser.sleep(2000);
                    element.all(by.buttonText('Delete')).last().click();
                    browser.sleep(1000);
                }
            }, function () { })
        });
    }

    it('adminisetring a alternative set', function() {
    	entities.click();
    	element(by.partialLinkText('Alternative Sets')).click();
    	browser.sleep(2000);
    	deleteCollectionInstance(AltSetRepeater,'alternativeSet.showOrder');
    	element.all(by.repeater(AltSetRepeater))
    	.then(function(instanceArray) {
    		var count = instanceArray.length;
    		count++;
    		element(by.buttonText('Create a new Alternative Set')).click();
    		browser.sleep(2000);
    		expect(element(by.buttonText("Save")).isEnabled()).toBe(false);
    		element(by.id('field_name')).sendKeys('test set name <script>alert(1)</script>');
    		element(by.id('field_description')).sendKeys('test set description <script>alert(1)</script>');
    		element(by.id('field_showOrder')).sendKeys('1000');
    		element(by.cssContainingText('option', browser.params.defaultOptColumn)).click();
    		element(by.buttonText("Save")).click();
    		browser.sleep(3000);
    		expect(element.all(by.repeater(AltSetRepeater))
    				.count()).toBe(count);
    	});
    	var instanceOrders = element.all(by.repeater(AltSetRepeater)
    			.column('alternativeSet.showOrder'));
    	var edits = element.all(by.buttonText('Edit'));
    	instanceOrders.each(function(element, index) {
    		element.getText().then(function(elemText) {
    			if(elemText === "1000") {
    				edits.get(index).click();
    			}
    		})
    	});
    	browser.sleep(2000);
    	element(by.id('field_description')).clear().then(function(){
    		element(by.id('field_description')).sendKeys("test set description modification <script>alert(1)</script>");
    	});
    	element(by.css('span[class="bootstrap-switch-label"]')).click();
    	element(by.buttonText("Save")).click();
    	browser.sleep(2000);
    	deleteCollectionInstance(AltSetRepeater, 'alternativeSet.showOrder');
    });

    it('bulk change for alternative set', function() {

    	entities.click();
    	element(by.partialLinkText('Alternative Sets')).click();
    	var selectButton = element.all(by.model('alternativeSet.selected'));
    	var alternativeSet = element.all(by.repeater(AltSetRepeater)
    	.column('alternativeSet.optColumn.name'));
    	element(by.id("selectAll")).click();
    	browser.sleep(1000);
    	expect(element(by.buttonText("Bulk change with selected")).isPresent()).toBe(true);
    	element(by.buttonText("Bulk change with selected")).click();
    	element(by.css('span[class="bootstrap-switch-label"]')).click();
    	element(by.buttonText("Save")).click();
    	browser.sleep(6000);
    	element(by.id("selectAll")).click();
    	browser.sleep(1000);
    	expect(element(by.buttonText("Bulk change with selected")).isPresent()).toBe(true);
    	element(by.buttonText("Bulk change with selected")).click();
    	element(by.css('span[class="bootstrap-switch-label"]')).click();
    	element(by.buttonText("Save")).click();
    	browser.sleep(1500);
    	selectButton.each(function (elem, index) {
            if (index == 0 || index == 1) {
                elem.click();
            }
        })
    	element(by.buttonText("Bulk change with selected")).click();
    	element(by.buttonText(browser.params.defaultOptColumn)).click();
    	element(by.buttonText("Save")).click();
    	browser.sleep(2000);
    	element.all(by.repeater(AltSetRepeater)
    			.column('alternativeSet.showOrder')).each(function(elem, index) {
    				elem.getText().then(function(elemText) {
    					if(elemText > 10) {
    						expect(alternativeSet.get(index).getText()).toBe(browser.params.defaultOptColumn);
    						selectButton.get(index).click();
    					}
    				})
    			});
    });

    it('administering an alternative instance', function () {
        entities.click();
        element(by.partialLinkText('Alternative Instances')).click();
        browser.sleep(2000);
        deleteContent();
        element.all(by.repeater(AltInsRepeater))
            .then(function (instanceArray) {
                var count = instanceArray.length;
                count++;
                element(by.buttonText('Create a new Alternative Instance')).click();
                browser.sleep(2000);
                expect(element(by.buttonText("Save")).isEnabled()).toBe(false);
                element(by.id('field_content')).sendKeys('test instance content <script>alert(1)</script>');
                var allOptions = element.all(by.tagName('option'));
                element(by.model('alternativeInstance.alternativeSet')).sendKeys(allOptions.get(1).getText());
                // var allOptions = element.all(by.tagName('option'));
                allOptions.each(function (elem, index) {
                    elem.getText().then(function (text) {
                        if (text.indexOf('-01') !== -1) {
                            element(by.model('alternativeInstance.requirementSkeleton')).sendKeys(text);
                        }
                    })
                })
                element(by.buttonText("Save")).click();
                browser.sleep(3000);
                expect(element.all(by.repeater(AltInsRepeater))
                    .count()).toBe(count);
            });

        var contents = element.all(by.id('content'));
        var edits = element.all(by.buttonText('Edit'));
        contents.each(function (element, index) {
            element.getText().then(function (elemText) {
                if (elemText.indexOf("test instance content") !== -1) {
                    edits.get(index).click();
                }
            })
        });
        browser.sleep(2000);
        var allOptions = element.all(by.tagName('option'));
        element(by.id('field_content')).clear().then(function () {
            element(by.id('field_content')).sendKeys('test instance content modification');
        });
        element(by.model('alternativeInstance.alternativeSet')).sendKeys(allOptions.get(1).getText());
        allOptions.each(function (elem, index) {
            elem.getText().then(function (text) {
                if (text.indexOf('-02') !== -1) {
                    element(by.model('alternativeInstance.requirementSkeleton')).sendKeys(text);
                }
            })
        })
        element(by.buttonText("Save")).click();
        browser.sleep(2000);
        deleteContent();
    });

    it('bulk change for alternative instances', function () {
        entities.click();
        element(by.partialLinkText('Alternative Instances')).click();

        element(by.model('alternativeInstance.selected')).isPresent().then(function () {
            var selectButton = element.all(by.model('alternativeInstance.selected'));
            selectButton.each(function (elem, index) {
                if (index == 0 || index == 1) {
                    elem.click();
                }
            })
            element(by.buttonText("Bulk change with selected")).click();
            var allOptions = element.all(by.tagName('option'));
            allOptions.each(function (elem, index) {
                elem.getText().then(function (text) {
                    if (text.indexOf('-02') !== -1) {
                        element(by.model('selectedRequirementSkeleton.value')).sendKeys(text);
                    }
                })
            })
            element(by.buttonText("Save")).click();
        })
    });

});