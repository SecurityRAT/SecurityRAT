describe('Protractor Security RAT general testsuite', function() {
	var account = element(by.partialLinkText('Account'));
	var login = "testuser";
	var password = "=Test2day";
	var changedPassword = "=Test2morrow";
	
	beforeEach(function() {
		browser.get(browser.params.testHost);
		
	});
	
	it('Test the registration', function() {
		account.click();
		element(by.partialLinkText('Register')).click();
		expect(element(by.partialButtonText('Register')).isEnabled()).toBe(false);
		element(by.id('firstName')).sendKeys(',firstName:<script>alert(1)</script>');
		element(by.id('lastName')).sendKeys(',lastName:<script>alert(1)</script>');
		element(by.id('login')).sendKeys(',test:<script>alert(1)</script>');
		expect(element(by.id('patternLoginError')).getText()).toEqual('Your login can only contain lower-case letters and digits.');
		element(by.id('login')).clear().then(function(){
			element(by.id('login')).sendKeys("system");
		});
		element(by.id('email')).sendKeys(browser.params.email);
		element(by.id('password')).sendKeys('=Test');
		expect(element(by.id('patternPassError')).isPresent()).toBe(true);
		expect(element(by.id('minlengthPass')).isPresent()).toBe(true);
		element(by.id('password')).sendKeys('2day');
		element(by.id('confirmPassword')).sendKeys('=2somePass');
		element(by.partialButtonText('Register')).click();
		browser.sleep(3000);
		expect(element(by.id('PassNotMatch')).isPresent()).toBe(true);
		element(by.id('password')).clear().then(function(){
			element(by.id('password')).sendKeys(password);
		});
		element(by.id('confirmPassword')).clear().then(function(){
			element(by.id('confirmPassword')).sendKeys(password);
		});
		element(by.partialButtonText('Register')).click();
		expect(element(by.id('userExist')).isPresent()).toBe(true);
		element(by.id('login')).clear().then(function(){
			element(by.id('login')).sendKeys(login);
		});
		element(by.id('password')).clear().then(function(){
			element(by.id('password')).sendKeys(password);
		});
		element(by.id('confirmPassword')).clear().then(function(){
			element(by.id('confirmPassword')).sendKeys(password);
		});
		element(by.partialButtonText('Register')).click();
		browser.sleep(2000);
		expect(element(by.id('successReg')).isPresent()).toBe(true);
		// waits for the user to check his email to activate his account.
		browser.sleep(25000);
		
	});
	it('Test for login', function() {
		element(by.id('username')).sendKeys(login);
		element(by.id('password')).sendKeys('=Testdefer');
		element(by.partialButtonText('Authenticate')).click();
		expect(element(by.id('loginError')).getText()).toBe('Authentication failed! Please check your credentials and try again.');
		element(by.id('username')).clear().then(function(){
			element(by.id('username')).sendKeys(login);
		});
		element(by.id('password')).clear().then(function(){
			element(by.id('password')).sendKeys(password);
		});
		element(by.partialButtonText('Authenticate')).click();
		browser.sleep(3000);
		expect(element(by.partialButtonText('Define a new artifact')).isPresent()).toBe(true);
		account.click();
		browser.sleep(2000);
		expect(element(by.partialLinkText('Settings')).isPresent()).toBe(true);
		expect(element(by.partialLinkText('Password')).isPresent()).toBe(true);
		expect(element(by.partialLinkText('Sessions')).isPresent()).toBe(true);
		expect(element(by.partialLinkText('Log out')).isPresent()).toBe(true);
		account.click();
		
	});
	it('Test for account settings', function() {
		account.click();
		element(by.partialLinkText('Settings')).click();
		browser.sleep(2000);
		expect(element(by.partialButtonText('Confirm')).isPresent()).toBe(true);
		element(by.id('password')).sendKeys('Testpassword');
		browser.sleep(2000);
		expect(element(by.className('wrongPassword')).isPresent()).toBe(true);
		element(by.id('password')).clear().then(function(){
			element(by.id('password')).sendKeys(password);
		});
		element(by.partialButtonText('Confirm')).click();
		browser.sleep(3000);
		element(by.id('lastName')).sendkeys(' modify');
		element(by.buttonText('Save')).click();
		browser.sleep(3000);
		expect(element(by.id('lastName')).getText()).toEqual(',lastName:<script>alert(1)</script> modify')
	});
	
	it('Test for password change', function() {
		account.click();
		element(by.partialLinkText('Settings')).click();
		browser.sleep(2000);
		expect(element(by.partialButtonText('Confirm')).isPresent()).toBe(true);
		element(by.id('password')).sendKeys('Testpassword');
		browser.sleep(2000);
		expect(element(by.className('wrongPassword')).isPresent()).toBe(true);
		element(by.id('password')).clear().then(function(){
			element(by.id('password')).sendKeys(password);
		});
		element(by.partialButtonText('Confirm')).click();
		browser.sleep(3000);
		element(by.id('password')).sendkeys(changedPassword);
		element(by.id('confirmPassword')).sendkeys(changedPassword);
		element(by.buttonText('Save')).click();
		browser.sleep(3000);
		expect(element(by.id('success')).getText()).toEqual('Password changed!');
	});
	
	it('Test log out function', function() {
		account.click();
		element(by.partialLinkText('Log out')).click();
		browser.sleep(2000);
		account.click();
		expect(element(by.partialLinkText('Log out')).isPresent()).toBe(false);
		
	});
	
});