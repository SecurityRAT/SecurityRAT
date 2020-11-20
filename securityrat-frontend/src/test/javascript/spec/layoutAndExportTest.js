// spec.js
/* jshint undef:true */
/* globals describe, browser, element, by, expect, document, beforeEach, it */
'use strict';

describe('Protractor Security RAT editor and export testsuites', function () {
	var defineArtifact = element(by.id('defineArtifact'));
	var requirementRepeater = 'reqs in (filteredReqs = (requirements | orderBy:[\'categoryOrder\',\'order\'] | filterUpdates : updatedReqs | filterByTags : filteredRequirementsByTags | filter: {category: category.label, description: textFilters.description, shortName: textFilters.shortName} | filterByStatus : selectedStatusColumn: statusColumns | filterTicketStatus : jiraStatus.selectedStatus | filter:search | filterOptColumnByText: textFilters.optColumns : optColumns | filterStatusColumnByText: textFilters.statusColumns : statusColumns))';
	var moreInfo = 'More Information';
	var javaApp = 'JAVA Application';
	var closeButton = 'Close';
	var exportButton = 'Export';
	var SaveButton = 'Save';

	var deleteCookie = function () {
		browser.getAllWindowHandles().then(function (handles) {
			expect(handles.length).toBeGreaterThan(1);
			browser.switchTo().window(handles[1]).then(function () {
				browser.manage().getCookie('JSESSIONID').then(function () {
					browser.manage().deleteCookie('JSESSIONID');
					browser.switchTo().window(handles[0]).then();
				});
			});
		});
	};

	var deleteCookie1 = function () {
		browser.getAllWindowHandles().then(function (handles) {
			expect(handles.length).toBeGreaterThan(1);
			browser.switchTo().window(handles[2]).then(function () {
				browser.manage().getCookie('JSESSIONID').then(function () {
					browser.manage().deleteCookie('JSESSIONID');
					browser.switchTo().window(handles[0]).then();
				});
			});
		});
	};

	var removeRibbon = function () {
		browser.executeScript(function () {
			var div = document.getElementsByClassName('development');
			div.ribbon.style['z-index'] = 0;
		});
	};
	// var switchToTab0 = function() {
	// 	browser.getAllWindowHandles().then(function(handles) {
	// 		browser.switchTo().window(handles[0]).then();
	// 	});
	// };

	beforeEach(function () {
		browser.get(browser.params.testHost).then(function () { }, function () {
			browser.switchTo().alert().accept();
		});
		browser.sleep(1500);
		defineArtifact.click();
		var artifactName = element(by.model('starterForm.name'));
		artifactName.sendKeys('-+.:()[],!#$%\'*=?`{}~;@&some artifact');

		element.all(by.buttonText('Select')).each(function (elem) {
			elem.click().then(function () {
				element(by.linkText('High')).isPresent().then(function (present) {
					if (present) {
						element(by.linkText('High')).click();
					} else {
						elem.click();
					}

				}, function () {
					//					elem.click().then(next);
				});
			});
		});

		(element(by.buttonText('Generate'))).click();
		browser.sleep(3000);
	});

	it('Test requirements generation, apply alternative instances and change settings', function() {

		expect(element(by.binding('requirements.length')).getText()).toBeGreaterThan('50');
		element(by.buttonText('Category')).click();
		element(by.linkText('Lifecycle')).click();
		browser.sleep(3000);
		var requirementInRed = element(by.id('requirementInRed'));
		expect(requirementInRed.getText()).toBeGreaterThan(5);

		element(by.linkText('Lifecycle')).click();
		element(by.buttonText('Category')).click();
		//clicks on Action with selected and check if the buttons are grey
		element(by.buttonText('Action with selected')).click();
		expect(element.all(by.className('disabledButton')).count()).toBe(6);

		// Checks that alternative in
		element(by.partialButtonText(moreInfo)).isPresent().then(function(moreInfoLiteral) {
			if(moreInfoLiteral) {
				element(by.buttonText(moreInfo)).click();
				element(by.linkText(javaApp)).isPresent().then(function(javaAppLiteral) {
					if(javaAppLiteral) {
						element(by.linkText(javaApp)).click();
					}
				});
			}
		});
		browser.sleep(3000);
		element(by.buttonText('Search')).click();
		element(by.model('search')).sendKeys(javaApp);
		browser.sleep(5000);

		element(by.model('search')).clear();
		removeRibbon();
		(element.all(by.className('accordion-toggle'))).first().click();
		(element(by.buttonText('Change Settings'))).click();
		browser.sleep(1000);
		(element(by.buttonText('OK'))).click();
		browser.sleep(5000);
		element.all(by.buttonText('Select')).each(function(elemt, index) {
			if(index > 0) {
				elemt.click().then(function() {
					element(by.linkText('Internally')).isPresent().then(function(isInternally){
						if(isInternally) {
							element(by.linkText('Internally')).click();
						}else {
							element(by.linkText('Mobile App')).isPresent().then(function(isMobile){
								if(isMobile) {
									element(by.linkText('Mobile App')).click();
								}else {
									element(by.linkText('Centralized')).isPresent().then(function(isCentralized){
										if(isCentralized) {
											element(by.linkText('Centralized')).click();
										}else {
											element(by.linkText('Session IDs')).isPresent().then(function(isSession){
												if(isSession) {
													element(by.linkText('Session IDs')).click();
												}else {
													elemt.click();
												}
											});
										}
									});
								}
							});
						}
					});
				});
			}
		});
		(element(by.buttonText('Generate'))).click();
		browser.wait(function() {
			return element(by.buttonText('Close')).isPresent();
		});
		element(by.buttonText('Close')).click();
		browser.sleep(500);
		element(by.buttonText('Action with selected')).click();
		browser.sleep(1000);
		element(by.buttonText('Action with selected')).click();
		element.all(by.className('positionChevron')).first().click();
		browser.sleep(2000);

		browser.get(browser.params.testHost).then(function() {
		}, function(){
			browser.sleep(2000);
			browser.switchTo().alert().accept();
		});

	});

	it('add, edit and removes a new custom requirement.', function() {
		var requirements = element(by.binding('requirements.length')).getText();
		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Add')).click();

		// set the value in custom requirement modal.
		(element(by.model('requirement.description'))).sendKeys('custom description');
		element(by.id('content1')).isPresent().then(function(content) {
			if(content) {
				element(by.id('content1')).sendKeys('custom More Information');
			}
		});
		element(by.id('content2')).isPresent().then(function(content) {
			if(content) {
				element(by.id('content2')).sendKeys('custom motivation');
			}
		});

		element(by.model('reqStat.value')).sendKeys('Custom comment');
		element.all(by.options('value as value.name for value in statusColumn.values | orderBy: \'showOrder\'')).get(3).click();

		element(by.buttonText('Add requirement')).click();
		browser.sleep(8000);

		expect(element(by.binding('requirements.length')).getText()).toBeGreaterThan(requirements);
		var count = 0;

		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Edit')).click();
		element(by.model('reqStat.value')).clear().then(function() {
			element(by.model('reqStat.value')).sendKeys('Edited custom comment');
		});

		element(by.model('requirement.description')).clear().then(function() {
			(element(by.model('requirement.description'))).sendKeys('Edited custom description');
		});

		element(by.id('content1')).isPresent().then(function(content) {
			if(content) {
				element(by.id('content1')).sendKeys('Edited custom More Information');
			}
		});

		element(by.id('content2')).isPresent().then(function(content) {
			if(content) {
				element(by.id('content2')).sendKeys('Edited custom motivation');
			}
		});

		// element(by.buttonText('Edit requirement')).click();
		// browser.sleep(8000);
		// element(by.buttonText('Custom requirements')).click();
		// element(by.linkText('Edit')).click();
		element.all(by.options('category.id as category.label for category in categories')).get(4).click();
		element.all(by.options('value as value.name for value in statusColumn.values | orderBy: \'showOrder\'')).get(3).click();

		element(by.buttonText('Edit requirement')).click();
		browser.sleep(2000);
		element.all(by.repeater(requirementRepeater).column('reqs.shortName')).each(function (elem, index) {
			elem.getText().then(function(elemText) {
				var sn = browser.params.customRequirementShortName + '01';
				if(elemText === sn) {
					// tobe done.
					expect(element.all(by.id('description')).get(index).getText()).toBe('Edited custom description');
				}
			});
		});
		browser.sleep(8000);
		count = 0;
		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Add')).click();

		// set the value in custom requirement modal.
		(element(by.model('requirement.description'))).sendKeys('custom description');
		element(by.id('content1')).isPresent().then(function(content) {
			if(content) {
				element(by.id('content1')).sendKeys('custom More Information');
			}
		});

		element(by.id('content2')).isPresent().then(function(content) {
			if(content) {
				element(by.id('content2')).sendKeys('custom motivation');
			}
		});

		element(by.model('reqStat.value')).sendKeys('Custom some comment');
		element.all(by.options('value as value.name for value in statusColumn.values | orderBy: \'showOrder\'')).get(2).click();

		element(by.buttonText('Add requirement')).click();
		browser.sleep(8000);
		element(by.buttonText('Custom requirements')).click();
		element(by.partialLinkText('Remove')).click();
		element(by.buttonText('Delete requirement')).click();

		expect(element(by.binding('requirements.length')).getText()).toBeGreaterThan('30');
		browser.refresh().then(function() {}, function(){
			browser.sleep(2000);
			browser.switchTo().alert().accept();
		});
	});

	it('exports to JIRA by creating a ticket in the queue, check spreadsheet creation, create a ticket in bash mode and checks if when selected after creation the confirms modal pops up', function() {
		(element(by.buttonText(SaveButton))).click();
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue + '-100000');
		});

		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		(element(by.buttonText(closeButton))).click();
		expect(element(by.binding('exportProperty.failed')).getText()).toBe('You have entered an invalid ticket. Please provide a valid one.');
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		});
		(element(by.buttonText(exportButton))).click();
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		element(by.model('fields.summary')).sendKeys('<script>alert(1)</script>');
		element(by.model('fields.description')).sendKeys('<script>alert(1)</script>');
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		var list = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list.count()).toBe(1);

		(element(by.buttonText(closeButton))).click();
		browser.sleep(3000);
		(element(by.buttonText(SaveButton))).click();
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		var list2 = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list2.count()).toBe(1);

		element(by.buttonText(closeButton)).click();
		browser.sleep(3000);
		removeRibbon();
		expect(element(by.id('ticketUrl')).isPresent()).toBe(true);
		// (element.all(by.className('accordion-toggle'))).first().click();
		// var list3 = element.all(by.partialLinkText(browser.params.jiraQueue));
		// expect(list3.count()).toBe(1);

		browser.sleep(3000);

		//export to excel with status values.
		element(by.id('selectAll')).click();
		element(by.buttonText('Action with selected')).click();
		element(by.linkText('Create spreadsheet')).click();
		browser.sleep(2000);
		element(by.buttonText('Create')).click();
		browser.sleep(2000);

		//export to excel without status values.
		element(by.buttonText('Action with selected')).click();
		element(by.partialLinkText('Create spreadsheet')).click();
		browser.sleep(2000);
		element(by.css('span[class=\'bootstrap-switch-label\']')).click();
		browser.sleep(1000);
		element(by.buttonText('Create')).click();
		browser.sleep(2000);
		//deselects all
		element(by.id('selectAll')).click();
		var requirements = element.all(by.model('reqs.selected'));

		requirements.first().click();

		element(by.buttonText('Action with selected')).click();
		element(by.linkText('Create JIRA tickets')).click();

		element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue + '-700');
		(element(by.buttonText('Create tickets'))).click();
		browser.sleep(3000);
		expect(element(by.className('alert-danger')).getText()).toBe('You have entered a ticket. Please provide a queue.');

		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		});
		(element(by.buttonText('Create tickets'))).click();
		browser.sleep(2000);
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		element(by.model('label.labelValue')).sendKeys('myNew Label');
		element(by.id('addLabel')).click();

		element(by.model('label.labelValue')).sendKeys('<script>alert(1)</script>');
		element(by.id('addLabel')).click();

		(element(by.buttonText('Create tickets'))).click();
		browser.sleep(3000);
		element(by.buttonText(closeButton)).click();
		browser.sleep(3000);

		//checks the status column is present after the ticket is created.
		element(by.id('StatusFilter')).isPresent().then(function(v){
		    expect(v).toBe(true);
		});
		//should filter the requirement set.
		expect(element(by.id('StatusFilter')).isPresent()).toBe(true);

		// modal pops up to warn the existence of a ticket for the selected requirement.
		element(by.buttonText('Action with selected')).click();
		element(by.linkText('Create JIRA tickets')).click();
		browser.sleep(5000);
		element(by.buttonText('Cancel')).click();
	});

	it('try to export with wrong URL and then enters a non existing project', function () {
		//non valid URL
		(element(by.buttonText(SaveButton))).click();
		element(by.model('jiraUrl.url')).clear().then(function () {
			element(by.model('jiraUrl.url')).sendKeys('gsfdgsdfgsfgsfdgsdfg');
		});
		(element(by.buttonText(exportButton))).click();
		browser.sleep(2000);
		expect('Invalid URL. Please specify URL like https://www.example-jira.com/browse/DUMBQ').toBe(element(by.id('failUrlMessage')).getText());

		//wrong project
		element(by.model('jiraUrl.url')).clear().then(function () {
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraHost + 'SSDi');
		});

		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		expect(element(by.binding('exportProperty.failed')).getText()).toBe('You have entered a wrong queue. Please select a valid queue and click on Export again.');

		element(by.model('fields.project.key')).sendKeys(browser.params.jiraQueue.split('/').pop());
		browser.sleep(2000);
		(element(by.buttonText(exportButton))).click();

		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[1]);
		browser.sleep(1000);
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);

		element(by.model('fields.summary')).sendKeys('<script>alert(1)</script>');
		element(by.model('fields.description')).sendKeys('<script>alert(1)</script>');
		(element(by.buttonText(exportButton))).click();
		browser.sleep(1000);
		var list = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list.count()).toBe(1);

		if (list.count() === 1) {
			list.first().click();
		}

		(element(by.buttonText(closeButton))).click();
	});

		it('Export a requirement set which has already be exported into a new ticket (by giving the ticket URL or queue). Check if a warning modal pops up', function() {

			(element(by.buttonText(SaveButton))).click();
			browser.sleep(2000);

			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
			(element(by.buttonText(exportButton))).click();
			element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
			element(by.model('fields.summary')).sendKeys('<script>alert(1)</script>');
			element(by.model('fields.description')).sendKeys('<script>alert(1)</script>');
			(element(by.buttonText(exportButton))).click();
			browser.sleep(3000);

			var list = element.all(by.partialLinkText(browser.params.jiraQueue));
			expect(list.count()).toBe(1);
			browser.sleep(5000);
			(element(by.buttonText(closeButton))).click();
			browser.sleep(3000);
			var requirements = element.all(by.model('reqs.selected'));

			requirements.first().click();
			requirements.get(1).click();
			requirements.get(2).click();

			element(by.buttonText('Action with selected')).click();
			element(by.linkText('Create JIRA tickets')).click();

			element(by.model('jiraUrl.url')).clear().then(function(){
				element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraRemoteLinkQueue);
			});
			(element(by.buttonText('Create tickets'))).click();
			browser.sleep(1000);
			element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[2]);
			element(by.model('label.labelValue')).sendKeys('myNew Label');
			element(by.id('addLabel')).click();

			element(by.model('label.labelValue')).sendKeys('<script>alert(1)</script>');
			element(by.id('addLabel')).click();

			(element(by.buttonText('Create tickets'))).click();
			browser.sleep(3000);
			element(by.buttonText(closeButton)).click();
			browser.sleep(3000);


			(element(by.buttonText(SaveButton))).click();
			element(by.model('jiraUrl.url')).clear().then(function(){
				element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
			});

			(element(by.buttonText(exportButton))).click();
			element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
			element(by.model('fields.summary')).sendKeys('<script>alert(1)</script>');
			element(by.model('fields.description')).sendKeys('<script>alert(1)</script>');
			(element(by.buttonText(exportButton))).click();
			browser.sleep(3000);
			element(by.buttonText('OK')).click();
			browser.sleep(3000);
			element(by.buttonText('Yes')).click();
			browser.sleep(3000);
			expect(element.all(by.partialLinkText(browser.params.jiraQueue)).count()).toBe(1);
			(element(by.buttonText(closeButton))).click();
			browser.sleep(1000);
			(element(by.buttonText(SaveButton))).click();
			browser.sleep(1000);
			element(by.model('jiraUrl.url')).clear().then(function(){
				element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue + '-' + browser.params.issueNumbers[0]);
			});
			(element(by.buttonText(exportButton))).click();
			browser.sleep(3000);
			element(by.buttonText('OK')).click();
			browser.sleep(2000);
			element(by.buttonText('No')).click();
			browser.sleep(2000);
		});

		it('Export to ticket and create a ticket without being authenticated', function() {
			// deleteCookie1();
			deleteCookie();
			browser.sleep(3000);
			element.all(by.buttonText('Task')).first().click();
			(element(by.linkText('Refused'))).click();
			(element(by.buttonText(SaveButton))).click();
	//		browser.sleep(3000);

			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
			(element(by.buttonText(exportButton))).click();
			browser.sleep(3000);
			element(by.binding('jira.url')).click();
			browser.getAllWindowHandles().then(function(handles) {
				browser.switchTo().window(handles[0]).then();
			});
			browser.sleep(65000);
			expect(element.all(by.css('div[marked]')).last().getText()).toBe('You could not authenticate yourself within the time interval! Please try later.');
			element(by.buttonText(closeButton)).click();
			browser.sleep(3000);
			(element(by.buttonText(exportButton))).click();
			browser.sleep(1000);
			element(by.binding('jira.url')).click();
			browser.sleep(15000);
			element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
			element(by.model('fields.summary')).sendKeys('<script>alert(1)</script>');
			element(by.model('fields.description')).sendKeys('<script>alert(1)</script>');
			(element(by.buttonText(exportButton))).click();
			browser.sleep(3000);

			expect(element.all(by.partialLinkText(browser.params.jiraQueue)).count()).toBe(1);
			browser.sleep(3000);
			element(by.buttonText(closeButton)).click();
			browser.sleep(3000);
			element.all(by.model('reqs.selected')).get(1).click();
			// deleteCookie1();
			deleteCookie();
			browser.sleep(3000);
			element(by.buttonText('Action with selected')).click();
			element(by.linkText('Create JIRA tickets')).click();

			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
			(element(by.buttonText('Create tickets'))).click();
			browser.sleep(3000);
			element(by.binding('jira.url')).click();
			browser.getAllWindowHandles().then(function(handles) {
				browser.switchTo().window(handles[0]).then();
			});
			browser.sleep(65000);
			expect(element.all(by.css('div[marked]')).last().getText()).toBe('You could not authenticate yourself within the time interval! Please try later.');
			element(by.buttonText(closeButton)).click();
			browser.sleep(3000);
			(element(by.buttonText('Create tickets'))).click();
			browser.sleep(1000);
			element(by.binding('jira.url')).click();
			browser.sleep(20000);
			element(by.id('issueType')).sendKeys(browser.params.issuetypes[0]);
			element(by.model('label.labelValue')).sendKeys('myNew Label');
			element(by.id('addLabel')).click();
			(element(by.buttonText('Create tickets'))).click();
			expect(element.all(by.partialLinkText(browser.params.jiraQueue)).count()).toBe(1);
			browser.sleep(3000);
			element(by.buttonText(closeButton)).click();
		});	

		it('Test constraints in export form', function() {
			browser.sleep(1000);
			(element(by.buttonText(SaveButton))).click();
			browser.sleep(1000);
			expect(element(by.buttonText(exportButton)).isEnabled()).toBe(false);
			(element(by.linkText('Export into File'))).click();
			expect(element(by.buttonText(exportButton)).isEnabled()).toBe(true);
			(element(by.linkText('Export to JIRA'))).click();
			browser.sleep(1000);
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
			browser.sleep(1000);
			expect(element(by.buttonText(exportButton)).isEnabled()).toBe(true);
			(element(by.buttonText(exportButton))).click();
			browser.sleep(4000);
			browser.refresh().then(function() {}, function(){
				browser.sleep(2000);
				browser.switchTo().alert().accept();
			});
		});

		it('Test manual linking with and without being authenticated', function() {
			browser.sleep(3000);
			(element(by.buttonText(SaveButton))).click();
			browser.sleep(2000);
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
			(element(by.buttonText(exportButton))).click();
			browser.sleep(2000);
			element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
			element(by.model('fields.summary')).sendKeys('<script>alert(1)</script>');
			element(by.model('fields.description')).sendKeys('<script>alert(1)</script>');
			(element(by.buttonText(exportButton))).click();
			browser.sleep(3000);
			element(by.buttonText(closeButton)).click();
			browser.sleep(2000);

			// deleteCookie1();
			deleteCookie();
			// browser.sleep(3000);
			// element(by.id('toggleManualLink')).click();
			browser.sleep(3000);
			var list = element.all(by.id('addManualTicket'));
			var removeList = element.all(by.id('removeManualTicket')); 
			list.first().click();
			element(by.id('ticket_field')).sendKeys(browser.params.jiraQueue);
			element(by.id('addTicket')).click();
			browser.sleep(2000);
			element(by.id('ticket_field')).clear().then(function() {
				element(by.id('ticket_field')).sendKeys(browser.params.jiraTicket);
			});
			element(by.id('addTicket')).click();
			browser.sleep(3000);
			element(by.binding('jira.url')).click();
			browser.getAllWindowHandles().then(function(handles) {
				browser.switchTo().window(handles[0]).then();
			});
			browser.sleep(65000);
			expect(element.all(by.css('div[marked]')).last().getText()).toBe('You could not authenticate yourself within the time interval! Please try later.');
			element(by.buttonText(closeButton)).click();
			browser.sleep(3000);
			element(by.id('addTicket')).click();
			browser.sleep(3000);
			element(by.binding('jira.url')).click();
			// sleep for the user to authenticated.
			browser.sleep(20000);
			expect(removeList.count() + 1, element.all(by.id('removeManualTicket')).count());

			// add a second ticket to the requirement
			list.first().click();

			// Test adding already existing ticket to requirement.
			element(by.id('ticket_field')).sendKeys(browser.params.jiraTicket);
			element(by.id('addTicket')).click();
			expect(element(by.binding('manageTicketProperty.jhError.msg')).getText(9)).toBe('This ticket is already linked to this requirement. Please provide another one.');
			element(by.id('ticket_field')).clear().then(function() {
				element(by.id('ticket_field')).sendKeys(browser.params.jiraRemoteLinkTicket);
			});
			element(by.id('addTicket')).click();
			browser.sleep(3000);

			list.get(1).click();

			// Test that queue are not allowed
			element(by.id('ticket_field')).sendKeys(browser.params.jiraQueue);
			element(by.id('addTicket')).click();
			browser.sleep(5000);

			// test invalid ticket
			element(by.id('ticket_field')).clear().then(function() {
				element(by.id('ticket_field')).sendKeys(browser.params.jiraTicket + '-');
			});
			element(by.id('addTicket')).click();
			browser.sleep(5000);
			element(by.buttonText(closeButton)).click();
			expect(element(by.binding('manageTicketProperty.authenticationFailureMessage')).getText())
				.toBe('The request to the issue tracker responded with 404 Not found. Please make sure that the given ticket exist.');

			// Add an existing remote ticket.
			element(by.id('ticket_field')).clear().then(function() {
				element(by.id('ticket_field')).sendKeys(browser.params.jiraRemoteLinkTicket);
			});

			element(by.id('addTicket')).click();
			browser.sleep(5000);

			var removeList1 = element.all(by.id('removeManualTicket')); 
			list.get(2).click();

			// Test add existing ticket without linking the tickets.
			element(by.id('ticket_field')).sendKeys(browser.params.jiraRemoteLinkTicket);
			element(by.model('reqs.linkStatus.link')).click();
			element(by.id('addTicket')).click();
			browser.sleep(8000);
			var removeList2 = element.all(by.id('removeManualTicket'));
			expect(removeList1.count(), removeList2.count() - 1);

			removeList.first().click();
			browser.sleep(1000);
			element(by.id('removeTicket')).click();
			browser.sleep(5000);

		});

		it('Test for the feedback feature', function() {
			// deleteCookie1();
			deleteCookie();
			browser.sleep(3000);
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
			element(by.buttonText(closeButton)).click();
			browser.sleep(3000);
			element(by.buttonText('Submit')).click();
			browser.sleep(2000);
			element(by.binding('jira.url')).click();
			browser.wait(function(){
				return element(by.partialLinkText(browser.params.jiraHost)).isPresent();
			});
			browser.sleep(2000);
			browser.refresh().then(function() {}, function(){
				browser.sleep(2000);
				browser.switchTo().alert().accept();
			});
		});
});
