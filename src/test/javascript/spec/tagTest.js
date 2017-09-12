'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach, it */

describe('Protractor Security RAT tag category/instances entities testsuite', function () {
    var entities = element(by.partialLinkText('Entities'));

    beforeEach(function () {
        browser.get(browser.params.testHost);

    });
    var deleteTagInstance = function () {
        var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
        var instanceOrders = element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\'] | filter:searchString')
            .column('tagInstance.showOrder'));
        instanceOrders.each(function (elem, indexElem) {
            elem.getText().then(function (elemText) {
                if (elemText === '1000') {
                    deletes.get(indexElem).click();
                    browser.sleep(2000);
                    element.all(by.buttonText('Delete')).last().click();
                    browser.sleep(1000);
                }
            }, function () {});
        });
    };

    //	it('searching a tag category', function() {
    //		entities.click();
    //		element(by.partialLinkText('Tag Categories')).click();
    //		element(by.id('searchQuery')).sendKeys('QA');
    //		element(by.id('searchButton')).click();
    //		expect(element.all(by.repeater('tagCategory in tagCategorys | orderBy : 'showOrder'')).count()).toBe(1);
    //		
    //	});

    it('administring a tag category', function () {
        entities.click();
        element(by.partialLinkText('Tag Categories')).click();
        element.all(by.repeater('tagCategory in tagCategorys | orderBy : \'showOrder\''))
            .then(function (categoryArray) {
                var count = categoryArray.length;
                count++;
                element(by.buttonText('Create a new Tag Category')).click();
                browser.sleep(2000);
                expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
                element(by.id('field_name')).sendKeys('test Category name <script>alert(1)</script>');
                element(by.id('field_description')).sendKeys('test Category description <script>alert(1)</script>');
                element(by.id('field_showOrder')).sendKeys('1000');
                element(by.buttonText('Save')).click();
                browser.sleep(3000);
                expect(element.all(by.repeater('tagCategory in tagCategorys | orderBy : \'showOrder\'')).count()).toBe(count);
            });
        browser.sleep(1500);
        element.all(by.buttonText('Edit')).last().click();
        browser.sleep(2000);
        element(by.id('field_description')).clear().then(function () {
            element(by.id('field_description')).sendKeys('test Category description modification <script>alert(1)</script>');
        });
        element(by.css('span[class="bootstrap-switch-label"]')).click();

        element(by.buttonText('Save')).click();
        browser.sleep(2000);
        element.all(by.buttonText('Delete')).last().click();
        browser.sleep(2000);
        element.all(by.buttonText('Delete')).last().click();
        browser.sleep(1500);
    });

    it('bulk change collection category', function () {
        entities.click();
        element(by.partialLinkText('Tag Categories')).click();
        element(by.id('selectAll')).click();
        browser.sleep(1000);
        expect(element(by.buttonText('Bulk change with selected')).isPresent()).toBe(true);
        element(by.buttonText('Bulk change with selected')).click();
        element(by.css('span[class="bootstrap-switch-label"]')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(5000);
        element(by.id('selectAll')).click();
        browser.sleep(1000);
        expect(element(by.buttonText('Bulk change with selected')).isPresent()).toBe(true);
        element(by.buttonText('Bulk change with selected')).click();
        element(by.css('span[class="bootstrap-switch-label"]')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(1500);
    });

    //	it('searching a tag Instance', function() {
    //		entities.click();
    //		element(by.partialLinkText('Tag Instances')).click();
    //		element(by.id('searchQuery')).sendKeys('Requirement Owner');
    //		element(by.id('searchButton')).click();
    //		expect(element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: 'tagCategory' | orderBy: ['tagCategory.showOrder','showOrder']')).count()).toBeGreaterThan(3);
    //		browser.sleep(2000);
    //		element(by.id('searchQuery')).clear().then(function(){});
    //		element(by.id('searchButton')).click();		
    //		element(by.buttonText('Tag Category')).click();
    //		element.all(by.linkText('Requirement Owner')).first().click();
    //		expect(element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: 'tagCategory' | orderBy: ['tagCategory.showOrder','showOrder']')).count()).toBeGreaterThan(3);
    //		browser.sleep(2000);
    //		element.all(by.linkText('Requirement Owner')).first().click();
    //		element(by.buttonText('Tag Category')).click();
    //	});


    it('administring a tag Instances', function () {
        entities.click();
        element(by.partialLinkText('Tag Instances')).click();
        browser.sleep(2000);
        deleteTagInstance();
        element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\']'))
            .then(function (instanceArray) {
                var count = instanceArray.length;
                count++;
                element(by.buttonText('Create a new Tag Instance')).click();
                browser.sleep(2000);
                expect(element(by.buttonText('Save')).isEnabled()).toBe(false);
                element(by.id('field_name')).sendKeys('test Instance name <script>alert(1)</script>');
                element(by.id('field_description')).sendKeys('test Instance description <script>alert(1)</script>');
                element(by.id('field_showOrder')).sendKeys('1000');
                element(by.cssContainingText('option', 'Requirement Owner')).click();
                element(by.buttonText('Save')).click();
                browser.sleep(3000);
                expect(element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\']'))
                    .count()).toBe(count);
            });
        var instanceOrders = element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\']')
            .column('tagInstance.showOrder'));
        var edits = element.all(by.buttonText('Edit'));
        instanceOrders.each(function (element, index) {
            element.getText().then(function (elemText) {
                if (elemText === '1000') {
                    edits.get(index).click();
                }
            });
        });
        browser.sleep(2000);
        element(by.id('field_description')).clear().then(function () {
            element(by.id('field_description')).sendKeys('test Instance description modification <script>alert(1)</script>');
        });
        element(by.css('span[class="bootstrap-switch-label"]')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(2000);
        deleteTagInstance();
    });

    it('bulk change collection instances', function () {
        entities.click();
        element(by.partialLinkText('Tag Instances')).click();
        var selectButton = element.all(by.model('tagInstance.selected'));

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
        element(by.buttonText('Documentation')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(5000);
        element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\']')
            .column('tagInstance.name')).each(function (elem, index) {
            elem.getText().then(function (elemText) {
                if (elemText === 'Product Manager' || elemText === 'Security Mentor') {
                    var categories = element.all(by.repeater('tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: \'tagCategory\' | orderBy: [\'tagCategory.showOrder\',\'showOrder\']')
                        .column('tagInstance.tagCategory.name'));
                    expect(categories.get(index).getText()).toBe('Documentation');
                    selectButton.get(index).click();
                }
            });
        });
		browser.sleep(3000);
        element(by.buttonText('Bulk change with selected')).click();
        element(by.buttonText('Requirement Owner')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(1500);
    });

});
