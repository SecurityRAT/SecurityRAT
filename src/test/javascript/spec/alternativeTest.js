describe('Protractor Security RAT general testsuite', function() {
	var entities = element(by.partialLinkText('Entities'));
	var confirmDelete = element(by.css('button[ng-disabled="deleteForm.$invalid"]'));
	var AltSetRepeater = "alternativeSet in alternativeSets | filterCategoryForEntities : selectedOptColumns : 'optColumn' | orderBy: ['optColumn.showOrder','showOrder']";
	var AltInsRepeater = "alternativeInstance in alternativeInstances | filterCategoryForEntities: selectedAlternativeSets : 'alternativeSet'| orderBy: ['alternativeSet.showOrder', 'requirementSkeleton.reqCategory.showOrder', 'requirementSkeleton.showOrder']";
	beforeEach(function() {
		browser.get(browser.params.testHost);
		
	});
	var deleteCollectionInstance = function(repeaterValue, elem) {
		var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
		var instanceOrders = element.all(by.repeater(repeaterValue)
				.column(elem));
		instanceOrders.each(function(elem, indexElem) {
			elem.getText().then(function(elemText) {
				if(elemText === "1000") {
					deletes.get(indexElem).click();
					browser.sleep(2000);
					element.all(by.buttonText('Delete')).last().click();
					browser.sleep(1000);
				}
			}, function(){})
		});
	}
	var deleteContent = function() {
		var deletes = element.all(by.css('button[class="btn btn-danger btn-sm"]'));
		var contents = element.all(by.css("div[marked='alternativeInstance.content']"));
		contents.each(function(elem, indexElem) {
			elem.getText().then(function(elemText) {
				if(elemText === "test instance content modification <script>alert(1)</script>") {
					deletes.get(indexElem).click();
					browser.sleep(2000);
					element.all(by.buttonText('Delete')).last().click();
					browser.sleep(1000);
				}
			}, function(){})
		});
	}
	
	it('searching a alternative set', function() {
		entities.click();
		element(by.partialLinkText('Alternative Sets')).click();
		element(by.id('searchQuery')).sendKeys('Poseidon-based');
		element(by.id('searchButton')).click();
		expect(element.all(by.repeater(AltSetRepeater))
				.count()).toBe(1);
		browser.sleep(2000);
		element(by.id('searchQuery')).clear().then(function(){
		});
		element(by.partialButtonText('Search a Alternative Set')).click();		
		element(by.buttonText("Option Column")).click();
		element(by.linkText("More Information")).click();
		expect(element.all(by.repeater(AltSetRepeater))
				.count()).toBe(1);
		browser.sleep(2000);
		element(by.linkText("More Information")).click();
		element(by.buttonText("Option Column")).click();
	});
	
	
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
			element(by.cssContainingText('option', 'Motivation')).click();
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
		var statusColumn = element.all(by.repeater(AltSetRepeater)
		.column('alternativeSet.optColumn.name'));
		element(by.buttonText("Select")).click();
		element(by.linkText("Select all")).click();
		browser.sleep(1000);
		expect(element(by.buttonText("Bulk change with selected")).isPresent()).toBe(true);
		element(by.buttonText("Bulk change with selected")).click();
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText("Save")).click();
		browser.sleep(6000);
		element(by.buttonText("Select")).click();
		element(by.linkText("Select all")).click();
		browser.sleep(1000);
		expect(element(by.buttonText("Bulk change with selected")).isPresent()).toBe(true);
		element(by.buttonText("Bulk change with selected")).click();
		element(by.css('span[class="bootstrap-switch-label"]')).click();
		element(by.buttonText("Save")).click();
		selectButton.first().click();
		selectButton.get(1).click();
		element(by.buttonText("Bulk change with selected")).click();
		element(by.buttonText("Motivation")).click();
		element(by.buttonText("Save")).click();
		browser.sleep(2000);
		element.all(by.repeater(AltSetRepeater)
				.column('alternativeSet.name')).each(function(elem, index) {
					elem.getText().then(function(elemText) {
						if(elemText === "Poseidon-based application" || elemText === "Mail und Media Wicket Application") {
							expect(statusColumn.get(index).getText()).toBe("Motivation");
							selectButton.get(index).click();
						}
					})
				});
		element(by.buttonText("Bulk change with selected")).click();
		element(by.buttonText("More Information")).click();
		element(by.buttonText("Save")).click();
	});
	
	it('searching an alternative instances', function() {
		entities.click();
		element(by.partialLinkText('Alternative Instances')).click();
		element(by.id('searchQuery')).sendKeys('Poseidon-based application');
		element(by.id('searchButton')).click();
		expect(element.all(by.repeater(AltInsRepeater))
				.count()).toBeGreaterThan(1);
		browser.sleep(2000);
		element(by.id('searchQuery')).clear().then(function(){
		});
		element(by.id('searchButton')).click();		
	});
	
	it('administering an alternative instance', function() {
		entities.click();
		element(by.partialLinkText('Alternative Instances')).click();
		browser.sleep(2000);
		deleteContent();
		element.all(by.repeater(AltInsRepeater))
		.then(function(instanceArray) {
			var count = instanceArray.length;
			count++;
			element(by.buttonText('Create a new Alternative Instance')).click();
			browser.sleep(2000);
			expect(element(by.buttonText("Save")).isEnabled()).toBe(false);
			element(by.id('field_content')).sendKeys('test instance content <script>alert(1)</script>');
			element(by.cssContainingText('option', 'Testcase for trained monkeys')).click();
			element(by.cssContainingText('option', 'LC-01')).click();
			element(by.buttonText("Save")).click();
			browser.sleep(3000);
			expect(element.all(by.repeater(AltInsRepeater))
					.count()).toBe(count);
		});
		var contents = element.all(by.css('div[marked="alternativeInstance.content"]'));
		var edits = element.all(by.buttonText('Edit'));
		contents.each(function(element, index) {
			element.getText().then(function(elemText) {
				if(elemText === "test instance content <script>alert(1)</script>") {
					edits.get(index).click();
				}
			})
		});
		browser.sleep(2000);
		element(by.id('field_content')).clear().then(function(){
			element(by.id('field_content')).sendKeys('test instance content modification <script>alert(1)</script>');
		});
		element(by.cssContainingText('option', 'LC-02')).click();
		element(by.buttonText("Save")).click();
		browser.sleep(2000);
		deleteContent();
	});
		
	it('bulk change for alternative instances', function() {
		entities.click();
		element(by.partialLinkText('Alternative Instances')).click();
		var selectButton = element.all(by.model('alternativeInstance.selected'));
		var alternativeSet = element.all(by.repeater(AltInsRepeater)
							.column('alternativeInstance.alternativeSet.name'));
		var requirements = element.all(by.repeater(AltInsRepeater)
        					.column('alternativeInstance.requirementSkeleton.shortName'));
		
		selectButton.get(1).click();
		selectButton.get(2).click();
		element(by.buttonText("Bulk change with selected")).click();
		element(by.cssContainingText('option', 'SM-02')).click();
		element(by.buttonText("Save")).click();
		browser.sleep(2000);
		var count = 0;
		alternativeSet.each(function(elem, index) {
					elem.getText().then(function(elemText) {
						if(elemText ===  'Poseidon-based application') {
							expect(requirements.get(index).getText()).toBe('SM-02');
							count++;
							if(count === 1)
								selectButton.get(index).click();
						}
					})
				});
		element(by.buttonText("Bulk change with selected")).click();
		element(by.cssContainingText('option', 'AU-03')).click();
		element(by.buttonText('Save')).click();
	});

});