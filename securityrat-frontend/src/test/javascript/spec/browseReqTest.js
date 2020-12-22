'use strict';
/* jshint undef:true */
/* globals describe, browser, element, by, expect, beforeEach, it */

describe('Protractor Security RAT browse requirements view testsuite', function() {
	var browseLink = element(by.partialLinkText('Browse'));
	var constantRepeater = 'requirementSkeleton in requirementSkeletons | filterByTagForReqSkeletons : selectedTags | filterByCollsForReqSkeletons : selectedColls| filterByTypesForReqSkeletons : selectedTypes| orderBy : [\'reqCategory.showOrder\',\'showOrder\'] | filter: searchQuery | limitTo:numberToDisplay track by requirementSkeleton.id';
    var deleteCookie = function () {
        browser.getAllWindowHandles().then(function (handles) {
            expect(handles.length).toBeGreaterThan(1);
            browser.switchTo().window(handles[handles.length - 1]).then(function () {
                browser.manage().getCookie('JSESSIONID').then(function () {
                    browser.manage().deleteCookie('JSESSIONID');
                    if (browser.params.jiraLogoutUrl) {
                        browser.waitForAngularEnabled(false);
                        browser.get(browser.params.jiraLogoutUrl);
                        browser.close().then();
                        browser.waitForAngularEnabled(true);
                    }
                    browser.sleep(1000);
                    browser.switchTo().window(handles[0]).then();
                });
            });
        });
    };

	beforeEach(function() {
		browser.get(browser.params.testHost);

	});

	it('test suite for browse requirements', function() {
		browseLink.click();
		element(by.partialLinkText('Requirements')).click();
		element(by.id('fesearchQuery')).sendKeys('AU-01');
		browser.sleep(3000);
		expect(element.all(by.repeater(constantRepeater)).count()).toBe(1);
		element(by.buttonText('View')).click();
		browser.sleep(6000);
		element(by.buttonText('Back')).click();
	});
	it('Test for the feedback feature', function() {
		deleteCookie();
		browser.sleep(5000);
		browseLink.click();
		element(by.partialLinkText('Requirements')).click();
		element.all(by.id('feedbackIcon')).get(1).click();
		element(by.model('comment')).sendKeys('Feedback test submitted by automatic test. <script>alert(1)</script>');
		element(by.buttonText('Submit')).click();
		browser.sleep(2000);
		element(by.binding('jira.url')).click();
		browser.getAllWindowHandles().then(function(handles) {
			browser.switchTo().window(handles[0]).then();
		});
		browser.sleep(65000);
		expect(element.all(by.css('div[marked]')).last().getText()).toBe('You could not authenticate yourself within the time interval! Please try later.');
		element(by.buttonText('Close')).click();
		browser.sleep(3000);
		element(by.buttonText('Submit')).click();
		browser.sleep(2000);
		element(by.binding('jira.url')).click();
		browser.wait(function(){
			return element(by.partialLinkText(browser.params.jiraHost)).isPresent();
		});
		browser.sleep(2000);
	});
	it('Test Requirement browser loses CSS after refresh', function() {
		browser.get(browser.params.testHost + '/reqId/2');
		browser.sleep(5000);
	});
});