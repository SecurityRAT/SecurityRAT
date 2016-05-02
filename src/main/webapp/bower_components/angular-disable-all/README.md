disable-all directive for AngularJS
========================

This directive allows to disable a given element and all buttons, inputs and other form controls will be disabled.

Open samples/index.html to see the example how to use this directive.

**Installation**

1. Run `bower install angular-disable-all --save`

    * (or add manually into your bower.json dependencies and run bower-install)
    * (or download ZIP from github and extract files in the case if you don't use bower)
    
2. Include `bower_components/angular-disable-all/dist/angular-disable-all.js` in your `index.html` file

3. Add a new dependency in your module
```javascript
angular.module('yourApp', ['disableAll', ...])
```

**How to use it**

Lets say you have a div with a form and inputs and buttons inside: 

```html
<div disable-all="true">

    <form>
        <input name="name" type="text">
        <button>submit</button>
    </form>
    
    <!-- This will not be disabled -->
    <a href="http://google.com" do-not-disable>google</a>

</div>
```

You can specify boolean variable to `disable-all`, directive will watch it and disable / enable div when variable changes.

```html
<div disable-all="isDisabled">

    <form>
        <input name="name" type="text">
        <button>submit</button>
    </form>

</div>
```

**TODO-s (for contributors)**:

 * refactor some parts of code and make it easier to understand and maintain
 * better documentation and more examples if possible
 * cover sources with unit-tests
 * research in performance optimizations
 * search for bugs and fix them
 * star this project and get people to know about this plugin in angular community