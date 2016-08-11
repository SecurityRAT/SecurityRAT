// spec.js
describe('Protractor Security RAT Testsuite', function() {
	var defineArtifact = element(by.id('defineArtifact'));
	var importArtifact = element(by.id('importArtifact'));
	var restoreSession = element(by.id('restoreSession'));
	var deleteSession = element(by.id('deleteSession'));
	var moreInfo = "More Information";
	var poseidon = "Poseidon-based application";
	var closeButton = "Close";
	var exportButton = "Export";
	var SaveButton = "Save";
	
	var deleteCookie = function() {
		browser.getAllWindowHandles().then(function(handles) {
			expect(handles.length).toBeGreaterThan(1);
			browser.switchTo().window(handles[1]).then(function() {
				browser.manage().getCookie("JSESSIONID").then(function(cookie) {
					browser.manage().deleteCookie("JSESSIONID");
					browser.switchTo().window(handles[0]).then();
				});				
			});
		});
	}
	
	var removeRibbon = function() {
		browser.executeScript(function() {
			var div = document.getElementsByClassName('development');
			div.ribbon.style["z-index"] = 0;
		});
	}
	var switchToTab0 = function() {
		browser.getAllWindowHandles().then(function(handles) {
			browser.switchTo().window(handles[0]).then();
		});
	}
		
	beforeEach(function() {
		browser.get(browser.params.testHost);
		defineArtifact.click();
		var artifactName = element(by.model('starterForm.name'));
		artifactName.sendKeys("-+.:()[],!#$%'*=?`{}~;@&some artifact");

		element.all(by.buttonText('Select')).last().click();
		(element(by.linkText('Internal'))).click();
		element.all(by.buttonText('Select')).each(function(elem, index) {
			elem.click().then(function() {
				element(by.linkText('High')).isPresent().then(function(present){
					if(present) {
						element(by.linkText('High')).click();
					}else {
						elem.click();
					}
					
				}, function(err) {
//					elem.click().then(next);
				});
			});
		});
		
		(element(by.buttonText("Generate"))).click();
		browser.sleep(3000);
	});
	
	it('new Internal Artifact with High criticality should have more than 50 requirements and alternative sets applies filters.', function() {
		
		expect(element(by.binding('requirements.length')).getText()).toBeGreaterThan('50');
		expect(element.all(by.buttonText(moreInfo)).count()).toBe(1);
		element(by.buttonText('Category')).click();
		element(by.linkText('Lifecycle')).click();
		browser.sleep(3000);
		var requirementInRed = element(by.id("requirementInRed"));
		expect(requirementInRed.getText()).toBeGreaterThan('10');
		
		element(by.linkText('Lifecycle')).click(); 
		element(by.buttonText('Category')).click();
		//clicks on Action with selected and check if the buttons are grey
		element(by.buttonText("Action with selected")).click();
		expect(element.all(by.className("disabledButton")).count()).toBe(4)
		element(by.buttonText(moreInfo)).click();
		element(by.linkText(poseidon)).click();
		element(by.buttonText('Search')).click();
		element(by.model('search')).sendKeys('Poseidon');
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
		browser.sleep(6000);
		element(by.buttonText('Close')).click();
		browser.sleep(2000);
		element(by.buttonText("Action with selected")).click();
		browser.sleep(1000);
		element(by.buttonText("Action with selected")).click();
		expect(element.all(by.className('positionChevron')).count()).toBe(2);
		element.all(by.className('positionChevron')).first().click();
		browser.sleep(2000);
		element.all(by.className('positionChevron')).first().click();
		
		browser.get(browser.params.testHost).then(function() {
		}, function(){
			browser.sleep(2000);
			browser.switchTo().alert().accept();
		})
		
	});
	
	it('add, edit and removes a new custom requirement.', function() {
		var requirements = element(by.binding('requirements.length')).getText();
		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Add')).click();
		
		// set the value in custom requirement modal.
		(element(by.model('requirement.description'))).sendKeys("custom description");
		element(by.id('content1')).sendKeys("custom More Information");
		element(by.id('content2')).sendKeys("custom motivation");
		
		element(by.model('reqStat.value')).sendKeys("Custom comment");
		element.all(by.options("value as value.name for value in statusColumn.values | orderBy: 'showOrder'")).get(3).click();
		
		element(by.buttonText('Add requirement')).click();
		browser.sleep(8000);
		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Add')).click();
		
		// set the value in custom requirement modal.
		(element(by.model('requirement.description'))).sendKeys("custom description");
		element(by.id('content1')).sendKeys("custom some More Information");
		element(by.id('content2')).sendKeys("custom some motivation");
		
		element(by.model('reqStat.value')).sendKeys("Custom some comment");
		element.all(by.options("value as value.name for value in statusColumn.values | orderBy: 'showOrder'")).get(2).click();
		
		element(by.buttonText('Add requirement')).click();
		browser.sleep(8000);
		expect(element(by.binding('requirements.length')).getText()).toBeGreaterThan(requirements);
		var count = 0;
		
		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Edit')).click();
		element(by.model('reqStat.value')).sendKeys("Edited custom comment");
		element(by.buttonText('Edit requirement')).click();
		browser.sleep(8000);
		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Edit')).click();
		element.all(by.options("requirement.id as requirement.description for requirement in crObject.requirements")).get(1).click();
		element.all(by.options("value as value.name for value in statusColumn.values | orderBy: 'showOrder'")).get(3).click();
		element(by.buttonText('Edit requirement')).click();
		browser.sleep(8000);
		count = 0;
		element(by.buttonText('Custom requirements')).click();
		element(by.linkText('Remove')).click();
		element(by.buttonText('Delete requirement')).click();
		
		expect(element(by.binding('requirements.length')).getText()).toBeGreaterThan('30');
		browser.refresh().then(function() {}, function(){
			browser.sleep(2000);
			browser.switchTo().alert().accept();
		})
	});
	
	it('exports to JIRA by creating a ticket in the queue and create ticket with first requirement and checks if when selected after creation the confirms modal pops up', function() {
		(element(by.buttonText(moreInfo))).click();
		(element(by.linkText(poseidon))).click();

		(element(by.buttonText(SaveButton))).click();
		element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue + "-100000");
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		(element(by.buttonText("Close"))).click();
		expect(element(by.binding('exportProperty.failed')).getText()).toBe('You have entered an invalid ticket. Please provide a valid one.');
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		});
		(element(by.buttonText(exportButton))).click();
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		element(by.model('fields.summary')).sendKeys("<script>alert(1)</script>");
		element(by.model('fields.description')).sendKeys("<script>alert(1)</script>");
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000)
		var list = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list.count()).toBe(1);

		(element(by.buttonText("Close"))).click();
		browser.sleep(3000);
		(element(by.buttonText(SaveButton))).click();
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		var list2 = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list2.count()).toBe(1);
		
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		removeRibbon();
		(element.all(by.className('accordion-toggle'))).first().click();
		var list3 = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list3.count()).toBe(1);
		
		browser.sleep(3000);
		
		//export to excel.
		element(by.buttonText("Select")).click();
		element(by.linkText("Select all")).click();
		element(by.buttonText("Action with selected")).click();
		element(by.linkText("Create excel")).click();
		
		//deselects all
		element(by.buttonText("Select")).click();
		element(by.linkText("Deselect all")).click();
		var requirements = element.all(by.model("reqs.selected"));
		
		requirements.first().click();
		
		element(by.buttonText("Action with selected")).click();
		element(by.linkText("Create JIRA tickets")).click();
		
		element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue + "-700");
		(element(by.buttonText("Create tickets"))).click();
		browser.sleep(3000);
		expect(element(by.binding("exportProperty.failed")).getText()).toBe("You have entered a ticket. Please provide a queue.");
		
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		});
		(element(by.buttonText("Create tickets"))).click();
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		element(by.model('label.labelValue')).sendKeys('myNew Label');
		element(by.id('addLabel')).click();
		
		element(by.model('label.labelValue')).sendKeys('<script>alert(1)</script>');
		element(by.id('addLabel')).click();
		
		(element(by.buttonText("Create tickets"))).click();
		browser.sleep(3000);
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		
		//checks the status column is present after the ticket is created.
		element(by.buttonText('Status')).isPresent().then(function(v){ 
		    expect(v).toBe(true);
		});
		//should filter the requirement set.
		element(by.buttonText('Status')).click();
		element.all(by.linkText('Open')).first().click();
		browser.sleep(5000);
		element(by.buttonText('Open')).click();
		
		// modal pops up to warn the existence of a ticket for the selected requirement.
		element(by.buttonText("Action with selected")).click();
		element(by.linkText("Create JIRA tickets")).click();
		browser.sleep(5000);
		element(by.buttonText("Cancel")).click();
	});
	
	it('try to export with wrong URL and then enters a non existing project', function() {
		(element(by.buttonText(moreInfo))).click();
		(element(by.linkText(poseidon))).click();
		
		//non valid URL
		(element(by.buttonText(SaveButton))).click();
		element(by.model('jiraUrl.url')).sendKeys("gsfdgsdfgsfgsfdgsdfg");
		(element(by.buttonText(exportButton))).click();
		browser.sleep(2000);
		expect(element(by.binding('exportProperty.failed')).getText()).toBe('Invalid Url. Please specify URL like https://www.example-jira.com/browse/DUMBQ');
		
		//wrong project
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraHost + "SSDi");
		});
		
		(element(by.buttonText(exportButton))).click();
		browser.sleep(6000);
		expect(element(by.binding('exportProperty.failed')).getText()).toBe('You have entered a wrong queue. Please select a valid queue and click on Export again.')
		
		element(by.model('fields.project.key')).sendKeys('SSDLC');
		(element(by.buttonText(exportButton))).click();
		
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[1]);
		browser.sleep(3000);
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		
		element(by.model('fields.summary')).sendKeys("<script>alert(1)</script>");
		element(by.model('fields.description')).sendKeys("<script>alert(1)</script>");
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000)
		var list = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list.count()).toBe(1);
		
		if(list.count() === 1) {
			list.first().click();
		}
		
		(element(by.buttonText("Close"))).click();
	});
	
	it('Export a requirement set which has already be exported into a new ticket (by giving the ticket URL or queue). Check if a warning modal pops up', function() {
		(element(by.buttonText(moreInfo))).click();
		(element(by.linkText(poseidon))).click();
		
		
		(element(by.buttonText(SaveButton))).click();
//		browser.sleep(3000);
		
		element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		(element(by.buttonText(exportButton))).click();
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		element(by.model('fields.summary')).sendKeys("<script>alert(1)</script>");
		element(by.model('fields.description')).sendKeys("<script>alert(1)</script>");
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		
		var list = element.all(by.partialLinkText(browser.params.jiraQueue));
		expect(list.count()).toBe(1);
		browser.sleep(5000);
		(element(by.buttonText("Close"))).click();
		browser.sleep(3000);
		var requirements = element.all(by.model("reqs.selected"));
		
		requirements.first().click();
		
		element(by.buttonText("Action with selected")).click();
		element(by.linkText("Create JIRA tickets")).click();
		
		element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue + "-700");
		(element(by.buttonText("Create tickets"))).click();
		browser.sleep(3000);
		expect(element(by.binding("exportProperty.failed")).getText()).toBe("You have entered a ticket. Please provide a queue.");
		
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		});
		(element(by.buttonText("Create tickets"))).click();
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		element(by.model('label.labelValue')).sendKeys('myNew Label');
		element(by.id('addLabel')).click();
		
		element(by.model('label.labelValue')).sendKeys('<script>alert(1)</script>');
		element(by.id('addLabel')).click();
		
		(element(by.buttonText("Create tickets"))).click();
		browser.sleep(3000);
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		
		
		(element(by.buttonText(SaveButton))).click();
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		});
		
		(element(by.buttonText(exportButton))).click();
		element(by.model('fields.issuetype.name')).sendKeys('Test');
		element(by.model('fields.summary')).sendKeys("<script>alert(1)</script>");
		element(by.model('fields.description')).sendKeys("<script>alert(1)</script>");
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		element(by.buttonText("OK")).click();
		browser.sleep(2000);
		element(by.buttonText("Yes")).click();
		browser.sleep(3000);
		expect(element.all(by.partialLinkText(browser.params.jiraQueue)).count()).toBe(1);
		(element(by.buttonText("Close"))).click();
		browser.sleep(2000);
		(element(by.buttonText(SaveButton))).click();
		element(by.model('jiraUrl.url')).clear().then(function(){
			element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue + browser.params.issueNumbers[0]);
		});
		
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		element(by.buttonText("OK")).click();
		browser.sleep(2000);
		element(by.buttonText("No")).click();
		browser.sleep(2000);
	});	
	
	it('Export to ticket and create a ticket without being authenticated', function() {
		
		(element(by.buttonText(moreInfo))).click();
		(element(by.linkText(poseidon))).click();
		element.all(by.buttonText("Task")).first().click();
		(element(by.linkText('Refused'))).click();
		deleteCookie();
		browser.sleep(3000);
		(element(by.buttonText(SaveButton))).click();
//		browser.sleep(3000);
		
		element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		(element(by.buttonText(exportButton))).click();
		browser.sleep(1000);
		element(by.binding('jira.url')).click();
		browser.getAllWindowHandles().then(function(handles) {
			browser.switchTo().window(handles[0]).then();
		});
		browser.sleep(65000);
		expect(element.all(by.css('div[marked]')).last().getText()).toBe('You could not authenticate yourself within the time interval! Please try later.');
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		(element(by.buttonText(exportButton))).click();
		browser.sleep(1000);
		element(by.binding('jira.url')).click();
		browser.sleep(15000);
		element(by.model('fields.issuetype.name')).sendKeys(browser.params.issuetypes[0]);
		element(by.model('fields.summary')).sendKeys("<script>alert(1)</script>");
		element(by.model('fields.description')).sendKeys("<script>alert(1)</script>");
		(element(by.buttonText(exportButton))).click();
		browser.sleep(3000);
		
		expect(element.all(by.partialLinkText(browser.params.jiraQueue)).count()).toBe(1);
		browser.sleep(3000);
		element(by.buttonText('Close')).click();
		browser.sleep(3000);
		element.all(by.model("reqs.selected")).get(1).click();
		deleteCookie();
		browser.sleep(3000);
		element(by.buttonText("Action with selected")).click();
		element(by.linkText("Create JIRA tickets")).click();
		
		element(by.model('jiraUrl.url')).sendKeys(browser.params.jiraQueue);
		(element(by.buttonText("Create tickets"))).click();
		browser.sleep(1000);
		element(by.binding('jira.url')).click();
		browser.getAllWindowHandles().then(function(handles) {
			browser.switchTo().window(handles[0]).then();
		});
		browser.sleep(65000);
		expect(element.all(by.css('div[marked]')).last().getText()).toBe('You could not authenticate yourself within the time interval! Please try later.');
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		(element(by.buttonText("Create tickets"))).click();
		browser.sleep(1000);
		element(by.binding('jira.url')).click();
		browser.sleep(20000);
		element(by.model('fields.issuetype.name')).sendKeys('Test');
		element(by.model('label.labelValue')).sendKeys('myNew Label');
		element(by.id('addLabel')).click();
		(element(by.buttonText("Create tickets"))).click();
		expect(element.all(by.partialLinkText(browser.params.jiraQueue)).count()).toBe(1);
		browser.sleep(3000);
		element(by.buttonText('Close')).click();
	});	
	
	it('Test for the feedback feature', function() {
		deleteCookie();
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
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		element(by.buttonText('Submit')).click();
		browser.sleep(2000);
		element(by.binding('jira.url')).click();
		browser.wait(function(){
			return element(by.partialLinkText(browser.params.jiraHost)).isPresent();
		});
		browser.sleep(2000);
	});
});
