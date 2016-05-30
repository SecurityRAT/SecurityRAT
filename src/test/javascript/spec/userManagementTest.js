describe('Protractor Security RAT general testsuite', function() {
	var admin = element(by.partialLinkText('Administration'));
	var userRepeater = "user in usersWithAuthorities  | orderBy :['firstname', 'lastname']";
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
		
	});
	
	it('Administering User', function() {
		admin.click();
		element(by.partialLinkText('User Management')).click();
		expect(element.all(by.repeater(userRepeater)).count()).toBeGreaterThan(3);
		element.all(by.buttonText('View')).get(0).click();
		browser.sleep(2000);
		element(by.buttonText('Back')).click();
		element.all(by.repeater(userRepeater)).then(function(usersArray) {
			var count = usersArray.length;
			count++;
			element(by.partialButtonText('Add a new User')).click();
			browser.sleep(2000);
			expect(element(by.partialButtonText('Save')).isEnabled()).toBe(false);
			element(by.id('fieldLogin')).clear().then(function(){
				element(by.id('fieldLogin')).sendKeys("Test user.<script>alert(1)</script>").then(function() {
					expect(element(by.id('falsePattern')).isPresent()).toBe(true);
				});
			});
			element(by.id('fieldLogin')).clear().then(function(){
				element(by.id('fieldLogin')).sendKeys("testusername")
			});
			element(by.id('field_firstName')).clear().then(function(){
				element(by.id('field_firstName')).sendKeys("zzzzz user.<script>alert(1)</script>");
			});
			element(by.id('field_lastName')).clear().then(function(){
				element(by.id('field_lastName')).sendKeys("zzzzz user last name.<script>alert(1)</script>");
			});
			element(by.id('field_email')).clear().then(function(){
				element(by.id('field_email')).sendKeys("testuser@testuser");
			});
			expect(element(by.partialButtonText('Save')).isEnabled()).toBe(true);
			var roles = element.all(by.options('authority as authority.name for authority in authorities track by authority.name'));
			expect(roles.count()).toBeGreaterThan(0);
			roles.get(0).click();
			roles.get(1).click();
			element(by.partialButtonText('Save')).click();
			browser.sleep(2000);
			expect(element.all(by.repeater(userRepeater)).count()).toBe(count);
		})
		element.all(by.buttonText("Edit")).last().click();
		browser.sleep(2000);
		element(by.id('fieldLogin')).clear().then(function(){
			element(by.id('fieldLogin')).sendKeys("testusername2");
		});
		
		element(by.buttonText("Save")).click();
		browser.sleep(2000);
		element.all(by.buttonText("Delete")).last().click();
		browser.sleep(2000);
		element.all(by.buttonText("Delete")).last().click();
	});
	
	it('Csrf test User Management', function() {
		browser.executeScript(function() {
			// test for server side input validation.
			var jqxhr = $.post('admin-api/users',
					{"login":"csrfTest","firstName":"csrfFirstname","lastName":"csrfLastname","email":"adsf@asdf"})
					.fail(function() {
						alert('csrf test successful')
					})
					.done(function() {
						alert('csrf test unsuccessful')
					})
		});
	})
	
});