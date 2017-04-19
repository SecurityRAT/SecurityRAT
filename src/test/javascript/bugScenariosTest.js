// spec.js
describe('Protractor Security RAT Testsuite', function() {
	var entities = element(by.partialLinkText('Entities'));
	var defineArtifact = element(by.id('defineArtifact'));
	var importArtifact = element(by.id('importArtifact'));
	var restoreSession = element(by.id('restoreSession'));
	var deleteSession = element(by.id('deleteSession'));
	var restoreSession = element(by.id('restoreSession'));
	var tagsRepeater = element.all(by.repeater("instances in categories.tagInstances | orderBy:'showOrder'");
	var moreInfo = "More Information";
	var closeButton = "Close";
	var exportButton = "Export";
	var SaveButton = "Save";
	
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
		entities.click();
		element(by.partialLinkText('Requirement Skeletons')).click();
		browser.sleep(2000);
		deleteSkeleton();
		element.all(by.repeater(skeletonRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Requirement Skeleton')).click();
			browser.sleep(2000);
			expect(element(by.buttonText("Save")).isEnabled()).toBe(false);
			element(by.cssContainingText('option', 'Lifecycle')).click();
			element(by.id('field_shortName')).sendKeys('BUGTAGAID-01');
			element(by.id('field_description')).sendKeys('test skeleton description <script>alert(1)</script>');
			element(by.id('field_showOrder')).sendKeys('10000');
			var tagInstanceCheckboxes = element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.tagInstances, tagInstance)"]'));
			var collInstanceCheckboxes = element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.collectionInstances, collectionInstance)"]'));
			var typeCheckboxes = element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.projectTypes, projectType)"]'));
			tagInstanceCheckboxes.first().click();
			tagInstanceCheckboxes.get(3).click();
			collInstanceCheckboxes.first().click();
			collInstanceCheckboxes.get(3).click();
			typeCheckboxes.first().click();
			element(by.buttonText("Save")).click();
			browser.sleep(3000);
		});

		browser.get(browser.params.testHost).then(function() {}, function(){
			browser.switchTo().alert().accept();
		});
		browser.sleep(1500)
		defineArtifact.click();
		var artifactName = element(by.model('starterForm.name'));
		artifactName.sendKeys("-+.:()[],!#$%'*=?`{}~;@&some artifact");

		element.all(by.buttonText('Select')).last().click();
		browser.sleep(500);
		(element(by.linkText('Internal'))).click();
		
		(element(by.buttonText("Generate"))).click();
		browser.sleep(3000);
	});
	
	it('Issue where taginstance ids are not locally updated on import.', function() {
		browser.refresh().then(function(){}, function() {
			browser.switchTo().alert().accept();
		});
		//create new tag instance
		entities.click();
		element(by.partialLinkText('Tag Instances')).click();
		browser.sleep(2000);
		element.all(by.repeater("tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: 'tagCategory' | orderBy: ['tagCategory.showOrder','showOrder']"))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Tag Instance')).click();
			browser.sleep(2000);
			expect(element(by.buttonText("Save")).isEnabled()).toBe(false);
			element(by.id('field_name')).sendKeys('Tag id bug');
			element(by.id('field_description')).sendKeys('test Instance description bug issue');
			element(by.id('field_showOrder')).sendKeys('1000');
			element(by.cssContainingText('option', 'Requirement Owner')).click();
			element(by.buttonText("Save")).click();
			browser.sleep(3000);
			expect(element.all(by.repeater("tagInstance in tagInstances | filterCategoryForEntities: selectedCategory: 'tagCategory' | orderBy: ['tagCategory.showOrder','showOrder']"))
					.count()).toBe(count);
		});
		entities.click();
		element(by.partialLinkText('Requirement Skeletons')).click();
		browser.sleep(2000);
		var instanceOrders = element.all(by.repeater(skeletonRepeater)
				.column('requirementSkeleton.shortName'));
		var edits = element.all(by.buttonText('Edit'));
		instanceOrders.each(function(element, index) {
			element.getText().then(function(elemText) {
				if(elemText === "BUGTAGAID-01") {
					edits.get(index).click();
				}
			})
		});
		browser.sleep(2000);
		var tagInstanceCheckboxes = element.all(by.css('input[ng-click="toggleSelection(requirementSkeleton.tagInstances, tagInstance)"]'));
		tagInstanceCheckboxes.each(function(element, index) {
			element.getText().then(function(elemText) {
				if(elemText === "Tag id bug") {
					tagInstanceCheckboxes.get(index).click();
				}
			})
		});
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText("Save")).click();

		// restoring locally stored session
		browser.get(browser.params.testHost);
		restoreSession.click();
		
		browser.sleep(5000);
		element(by.buttonText("Close")).click();
		browser.sleep(3000);
		element(by.linkText("Tags")).click();
		tagsRepeater.each(function(elemText, index) {
			if(elemText === "Tag id bug") {
				tagsRepeater.get(index).click()
			}
		})
		browser.sleep(6000);
		
	});
});
