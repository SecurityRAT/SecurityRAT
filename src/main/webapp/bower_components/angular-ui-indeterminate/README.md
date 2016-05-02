# ui-indeterminate [![Build Status](https://travis-ci.org/angular-ui/ui-indeterminate.svg?branch=master)](https://travis-ci.org/angular-ui/ui-indeterminate)

Provides an easy way to toggle a checkbox input's special 'indeterminate' property. This is a visual toggle only and in no way affects the model or value outside of native browser behavior at this time.

## Requirements

- AngularJS

## Usage


You can get it from [Bower](http://bower.io/)

```sh
bower install angular-ui-indeterminate
```

Load the script files in your application:

```html
<script type="text/javascript" src="bower_components/angular/angular.js"></script>
<script type="text/javascript" src="bower_components/angular-ui-indeterminate/ui-indeterminate.js"></script>
```

Add the specific module to your dependencies:

```javascript
angular.module('myApp', ['ui.indeterminate', ...])
```

## Development

We use Karma and jshint to ensure the quality of the code.  The easiest way to run these checks is to use grunt:

```sh
npm install -g gulp-cli
npm install && bower install
gulp
```

The karma task will try to open Firefox and Chrome as browser in which to run the tests.  Make sure this is available or change the configuration in `karma.conf.js`


### Gulp watch

`gulp watch` will automatically test your code and build a release whenever source files change.

### How to release

Use npm to update version and create a tag, then push to GitHub:

````sh
gulp && git commit . # if necessary, build everything and commit latest changes
npm version [major | minor | patch] # let npm update package.json and create a tag
git push --tags origin master # push everything to GitHub
````

Travis will take care of testing and publishing to npm's registry (bower will pick up the change automatically). Finally [create a release on GitHub](https://github.com/angular-ui/ui-indeterminate/releases/new) from the tag created by Travis.
