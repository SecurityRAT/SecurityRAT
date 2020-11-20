// spec.js

'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach, it */

describe('Protractor Security RAT bug Scenarios Testsuite', function () {
    var entities = element(by.partialLinkText('Entities'));
    var defineArtifact = element(by.id('defineArtifact'));
    var restoreSession = element(by.id('restoreSession'));
    var skeletonRepeater = 'requirementSkeleton in requirementSkeletons | filterCategoryForEntities : selectedCategory:\'reqCategory\'| filterByTagForReqSkeletons : selectedTags | filterByCollsForReqSkeletons : selectedColls| filterByTypesForReqSkeletons : selectedTypes | filter:searchString | orderBy : [\'reqCategory.showOrder\',\'showOrder\'] | limitTo:numberToDisplay';
    var optColumnContentRepeater = 'optColumnContent in optColumnContents | filterCategoryForEntities : selectedOptColumns : \'optColumn\'| filter:searchString | orderBy: [\'requirementSkeleton.reqCategory.showOrder\', \'requirementSkeleton.showOrder\', \'optColumn.showOrder\'] | limitTo:numberToDisplay';
    var optColumnRepeater = 'optColumn in optColumns | orderBy: \'showOrder\' | filter:searchString';
    var statusColumRepeater = 'statusColumn in statusColumns | orderBy: \'showOrder\' | filter:searchString';
    var projectType = 'projectType in projectTypes | filter:searchString | orderBy:\'showOrder\'';
    var SaveButton = 'Save';

    var refreshBrowser = function () {
        browser.refresh().then(function () {}, function () {
            browser.sleep(3000);
            browser.switchTo().alert().accept();
        });
    };

    var deleteEntityByShowOrder = function (repeaterValue, elem, showOrderValue) {
        var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
        var instanceOrders = element.all(by.repeater(repeaterValue)
            .column(elem));
        instanceOrders.each(function (elem, indexElem) {
            elem.getText().then(function (elemText) {
                if (elemText === showOrderValue) {
                    deletes.get(indexElem).click();
                    browser.sleep(2000);
                    element.all(by.buttonText('Delete')).last().click();
                    browser.sleep(1000);
                }
            }, function () {});
        });
    };

    var generateRequirementSet = function (artifactName, impType) {
        defineArtifact.click();
        element(by.model('starterForm.name')).sendKeys(artifactName);
        element.all(by.className('btn-default')).last().click();
        browser.sleep(500);
        (element(by.linkText(impType))).click();

        (element(by.buttonText('Generate'))).click();
        browser.sleep(5000);
    };

    var switchActiveButtonForOptColumn = function (name) {
        browser.get(browser.params.testHost);
        entities.click();
        element(by.partialLinkText('Optional Columns')).click();
        browser.sleep(1000);
        var instanceOrders = element.all(by.repeater(optColumnRepeater)
            .column('optColumn.name'));
        var edits = element.all(by.buttonText('Edit'));
        instanceOrders.each(function (element, index) {
            element.getText().then(function (elemText) {
                if (elemText === name) {
                    edits.get(index).click();
                }
            });
        });
        element(by.css('span[class="bootstrap-switch-label"]')).click();
    };

    beforeEach(function () {
        browser.get(browser.params.testHost);
    });

    it('Issue where taginstance ids are not locally updated on import.', function () {
        entities.click();
        element(by.partialLinkText('Requirement Skeletons')).click();
        browser.sleep(2000);
        element.all(by.repeater(skeletonRepeater))
            .then(function (instanceArray) {
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
                typeCheckboxes.each(function (element) {
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
            .then(function (instanceArray) {
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
        instanceOrders.each(function (element, index) {
            element.getText().then(function (elemText) {
                if (elemText === 'BUGTAGAID-01') {
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

    it('Dropdown list in exported file is filled with empty values.', function () {
        generateRequirementSet('test artifact', 'External');
        element(by.id('selectAll')).click();
        element(by.partialButtonText('Action with selected')).click();
        element(by.linkText('Create spreadsheet')).click();
        browser.sleep(2000);
        element(by.buttonText('Create')).click();
        browser.sleep(2000);
        refreshBrowser();
    });

    it('Test bug where view in editor is broken due to optColumn contents', function () {
        entities.click();
        element(by.partialLinkText('Optional Column Contents')).click();
        browser.sleep(2000);
        element.all(by.repeater(optColumnContentRepeater))
            .then(function (instanceArray) {
                var count = instanceArray.length;
                count++;
                var allOptions = element.all(by.tagName('option'));
                element(by.buttonText('Create a new Optional Column Content')).click();
                browser.sleep(2000);
                element(by.id('field_content')).sendKeys('test broken view in editor');
                element(by.cssContainingText('option', 'More Information')).click();
                allOptions.each(function (elem) {
                    elem.getText().then(function (text) {
                        if (text.indexOf('LC-01') !== -1) {
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
        expect(element(by.binding('filterRequirements().length')).getText()).toBe('1');

        // clean up
        refreshBrowser();
        browser.get(browser.params.testHost);
        entities.click();
        element(by.partialLinkText('Optional Column Contents')).click();
        browser.sleep(4000);
        var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
        var contents = element.all(by.id('content'));
        contents.each(function (elem, indexElem) {
            elem.getText().then(function (elemText) {
                if (elemText === 'test broken view in editor') {
                    deletes.get(indexElem).click();
                    browser.sleep(2000);
                    element.all(by.buttonText('Delete')).last().click();
                    browser.sleep(1000);
                }
            }, function () {});
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

    it('Export to excel breaks with no status column of type enum', function () {
        // create an inactive optional colum
        entities.click();
        element(by.partialLinkText('Optional Columns')).click();
        browser.sleep(2000);
        element(by.partialButtonText('Create a new Optional Column')).click();
        browser.sleep(1000);
        element(by.id('field_name')).sendKeys('TestInactiveOptColumns');
        element(by.id('field_description')).sendKeys('test description');
        element(by.id('field_showOrder')).sendKeys('1000');
        element(by.cssContainingText('option', 'ShortText')).click();
        element(by.buttonText('Save')).click();
        browser.sleep('3000');
        // creating the project type with the created optional column and the comment status column
        entities.click();
        element(by.partialLinkText('Implementation Types')).click();
        browser.sleep(2000);
        element(by.partialButtonText('Create a new Implementation Type')).click();
        browser.sleep(2000);
        element(by.id('field_name')).sendKeys('TestInactiveOptAndStatusColumns');
        element(by.id('field_description')).sendKeys('test description');
        element(by.id('field_showOrder')).sendKeys('100');
        element(by.cssContainingText('option', 'More Information')).click();
        element(by.cssContainingText('option', 'TestInactiveOptColumns')).click();
        element(by.cssContainingText('option', 'Comment')).click();
        element(by.css('span[class="bootstrap-switch-label"]')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(3000);
        // adding all requirements to the created project type
        entities.click();
        element(by.partialLinkText('Requirement Skeletons')).click();
        browser.sleep(4000);
        element(by.id('selectAll')).click();
        browser.sleep(1000);
        element(by.partialButtonText('Bulk change with selected')).click();
        browser.sleep(2000);
        var typeCheckboxes = element.all(by.model('selectedProjectTypes[projectType.id].value'));
        typeCheckboxes.last().click();
        element(by.partialButtonText(SaveButton)).click();
        browser.sleep(5000);

        // generating the requirement set.
        element(by.partialLinkText('Editor')).click();
        defineArtifact.click();
        element(by.id('inputName')).sendKeys('Test excel export bug with inactive enum status columns');
        element.all(by.className('dropdown-toggle')).last().click();
        browser.sleep(500);
        (element(by.linkText('TestInactiveOptAndStatusColumns'))).click();
        element(by.partialButtonText('Generate')).click();
        browser.sleep(3000);
        var list = element.all(by.tagName('textarea'));
        list.first().sendKeys('Some comment.');
        element(by.id('selectAll')).click();
        element(by.partialButtonText('Action with selected')).click();
        element(by.partialLinkText('Create spreadsheet')).click();
        element(by.buttonText('Create')).click();
        browser.sleep(2000);
        element(by.partialButtonText('Action with selected')).click();
        element(by.partialLinkText('Create spreadsheet')).click();
        element(by.css('span[class="bootstrap-switch-label"]')).click();
        element(by.buttonText('Create')).click();
        browser.sleep(2000);
        // undoing the operations
        entities.click();
        element(by.partialLinkText('Requirement Skeletons')).click();
        element(by.id('selectAll')).click();
        browser.sleep(1000);
        element(by.partialButtonText('Bulk change with selected')).click();
        browser.sleep(2000);
        typeCheckboxes.last().click();
        element(by.partialButtonText(SaveButton)).click();
        browser.sleep(5000);

        entities.click();
        element(by.partialLinkText('Implementation Types')).click();
        browser.sleep(2000);
        deleteEntityByShowOrder(projectType, 'projectType.showOrder', '100');
        browser.sleep(3000);
        entities.click();
        element(by.partialLinkText('Optional Columns')).click();
        deleteEntityByShowOrder(optColumnRepeater, 'optColumn.showOrder', '1000');
    });

    it('Test bug where update available in not working', function () {
        browser.get(browser.params.impTestAttachmentUrl + browser.params.attachmentUrls[3]).then(function () {}, function () {
            browser.switchTo().alert().accept();
        });
        browser.sleep(5000);
        (element(by.buttonText('Close'))).click();
        browser.sleep(3000);
        element(by.buttonText('Updates available')).isPresent().then(function () {
            element(by.buttonText('Updates available')).click();
            browser.wait(function () {
                return element(by.buttonText('Close')).isPresent();
            });
            browser.sleep(3000);
            element(by.buttonText('Close')).click();
            browser.sleep(3000);
            element(by.buttonText('Cancel the updates')).isPresent().then(function () {
                var acceptReq = element.all(by.id('acceptReq'));
                expect(acceptReq.count()).toBeGreaterThan(0);
                expect(element.all(by.id('removeReq')).count()).toBeGreaterThan(0);

                element.all(by.id('acceptReq')).isPresent().then(function () {
                    expect(element(by.buttonText(SaveButton)).isEnabled()).toBe(false);
                    var acceptList = element.all(by.id('acceptReq'));

                    acceptList.each(function (element) {
                        element.click();
                    });
                    browser.sleep(5000);
                });
            });
        });
        browser.sleep(5000);
        refreshBrowser();
        browser.get(browser.params.impTestAttachmentUrl + browser.params.attachmentUrls[3]).then(function () {}, function () {
            browser.switchTo().alert().accept();
        });
        browser.sleep(5000);
        (element(by.buttonText('Close'))).click();
        browser.sleep(3000);
        element(by.partialLinkText('Artifact Settings')).click();
        element(by.partialButtonText('Change Settings')).click();
        browser.sleep(2000);
        element(by.buttonText('OK')).click();
        element.all(by.buttonText('Select')).each(function (elem) {
            elem.click().then(function () {
                element(by.linkText('High')).isPresent().then(function (present) {
                    if (present) {
                        element(by.linkText('High')).click();
                    } else {
                        elem.click();
                    }
                }, function () {});
            });
        });
        element(by.partialButtonText('Generate')).click();
        browser.sleep(3000);
        browser.wait(function () {
            return element(by.buttonText('Close')).isPresent();
        });
//        element(by.buttonText('Close')).click();
        browser.sleep(1000);
        element(by.buttonText('Updates available')).isPresent().then(function () {
            element(by.buttonText('Updates available')).click();
            browser.wait(function () {
                return element(by.buttonText('Close')).isPresent();
            });
            browser.sleep(3000);
            element(by.buttonText('Close')).click();
            browser.sleep(3000);
            element(by.buttonText('Cancel the updates')).isPresent().then(function () {
                var removeReq = element.all(by.id('removeReq'));
                expect(removeReq.count()).toBeGreaterThan(0);
                expect(element.all(by.id('acceptReq')).count()).toBeGreaterThan(0);

                element.all(by.id('removeReq')).isPresent().then(function () {
                    expect(element(by.buttonText(SaveButton)).isEnabled()).toBe(false);
                    var removeList = element.all(by.id('removeReq'));

                    removeList.each(function (element) {
                        element.click();
                    });
                    browser.sleep(5000);
                });
            });
        });
//
        refreshBrowser();
        browser.get(browser.params.impTestAttachmentUrl + browser.params.attachmentUrls[3]).then(function () {}, function () {
            browser.switchTo().alert().accept();
        });
        browser.sleep(5000);
        (element(by.buttonText('Close'))).click();
        browser.sleep(3000);
        var requirementCounts = element(by.binding('requirements.length')).getText();

        element(by.buttonText('Updates available')).isPresent().then(function () {
            element(by.buttonText('Updates available')).click();
            browser.wait(function () {
                return element(by.buttonText('Close')).isPresent();
            });
            browser.sleep(3000);
            element(by.buttonText('Close')).click();
            browser.sleep(3000);
            element(by.buttonText('Cancel the updates')).isPresent().then(function () {
                var removeReq = element.all(by.id('removeReq'));
                expect(removeReq.count()).toBeGreaterThan(0);
                expect(element.all(by.id('acceptReq')).count()).toBeGreaterThan(0);

                removeReq.first().click();
                element(by.buttonText('Cancel the updates')).click();
                browser.sleep(3000);
                expect(element(by.binding('requirements.length')).getText()).toBe(requirementCounts);
            });
        });

        element(by.buttonText('Updates available')).isPresent().then(function () {
            element(by.buttonText('Updates available')).click();
            browser.wait(function () {
                return element(by.buttonText('Close')).isPresent();
            });
            browser.sleep(3000);
            element(by.buttonText('Close')).click();
            browser.sleep(3000);
            element(by.buttonText('Cancel the updates')).isPresent().then(function () {
                var acceptReq = element.all(by.id('acceptReq'));
                expect(acceptReq.count()).toBeGreaterThan(0);
                expect(element.all(by.id('acceptReq')).count()).toBeGreaterThan(0);

                acceptReq.first().click();
                element(by.buttonText('Cancel the updates')).click();
                browser.sleep(3000);
                expect(element(by.binding('requirements.length')).getText()).toBe(requirementCounts);
            });
        });

    });

    it('Test new optional or status column from database on requirement import', function () {
        entities.click();
        element(by.partialLinkText('Optional Columns')).click();
        browser.sleep(1000);
        element(by.partialButtonText('Create a new Optional Column')).click();
        browser.sleep(2000);
        element(by.id('field_name')).sendKeys('TestNewOptColumns');
        element(by.id('field_description')).sendKeys('test description');
        element(by.id('field_showOrder')).sendKeys('10000');
        element(by.cssContainingText('option', 'ShortText')).click();
        element(by.css('span[class="bootstrap-switch-label"]')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(2000);
        // create new status column
        entities.click();
        element(by.partialLinkText('Status Columns')).click();
        browser.sleep(1000);
        element(by.partialButtonText('Create a new Status Column')).click();
        element(by.id('field_name')).sendKeys('TestNewStatusColumns');
        element(by.id('field_description')).sendKeys('test statColumn description');
        element(by.id('field_showOrder')).sendKeys('10000');
        element.all(by.css('span[class="bootstrap-switch-label"]')).each(function (elem) {
            elem.click();
        });
        element(by.buttonText('Save')).click();
        browser.sleep(2000);
        // add newly created optional and status column to project type.
        entities.click();
        element(by.partialLinkText('Implementation Types')).click();
        browser.sleep(1000);
        var impType = element.all(by.buttonText('Edit'));
        impType.first().click();
        browser.sleep(1000);
        element(by.cssContainingText('option', 'TestNewOptColumns')).click();
        element(by.cssContainingText('option', 'TestNewStatusColumns')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(1000);
        browser.sleep(2000);
        browser.get(browser.params.impTestAttachmentUrl + browser.params.attachmentUrls[3]).then(function () {}, function () {
            browser.switchTo().alert().accept();
        });
        browser.sleep(3000);
        (element(by.buttonText('Close'))).click();
        browser.sleep(5000);
        entities.click();
        element(by.partialLinkText('Implementation Types')).click();
        browser.sleep(1000);
        impType.first().click();
        element(by.cssContainingText('option', 'TestNewOptColumns')).click();
        element(by.cssContainingText('option', 'TestNewStatusColumns')).click();
        element(by.buttonText('Save')).click();
        browser.sleep(3000);
        entities.click();
        element(by.partialLinkText('Optional Columns')).click();
        browser.sleep(1000);
        deleteEntityByShowOrder(optColumnRepeater, 'optColumn.showOrder', '10000');
        entities.click();
        element(by.partialLinkText('Status Columns')).click();
        browser.sleep(1000);
        deleteEntityByShowOrder(statusColumRepeater, 'statusColumn.showOrder', '10000');

    });
    it('Test requirements filtering after change settings', function () {
        generateRequirementSet('Test NO AUTHENTICATION filter after change settings', 'Internal');
        element(by.partialLinkText('Artifact Settings')).click();
        element(by.buttonText('Change Settings')).click();
        browser.sleep(500);
        element(by.buttonText('OK')).click();
        browser.sleep(500);
        element.all(by.buttonText('Select')).each(function (elem) {
            elem.click().then(function () {
                element(by.linkText('No Authentication')).isPresent().then(function (present) {
                    if (present) {
                        element(by.linkText('No Authentication')).click();
                    } else {
                        element(by.linkText('No Session Management')).isPresent().then(function (noSession) {
                            if (noSession) {
                                element(by.linkText('No Session Management')).click();
                            } else {
                                elem.click();
                            }
                        });
                    }
                });
            });
        });

        element(by.buttonText('Generate')).click();
        browser.wait(function () {
            return element(by.buttonText('Close')).isPresent();
        });
        element(by.buttonText('Close')).click();
        element(by.partialButtonText('Category')).click();
        expect(element(by.partialLinkText('Session Management')).isPresent()).toBe(false);
        element(by.partialLinkText('Authentication')).click();
        browser.sleep(500);
        expect(element(by.binding('filterRequirements().length')).getText()).toBe('1');
    });
});
