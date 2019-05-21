// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            'main/webapp/bower_components/angular/angular.js',
            'main/webapp/bower_components/angular-animate/angular-animate.js',
            'main/webapp/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'main/webapp/bower_components/angular-cache-buster/angular-cache-buster.js',
            'main/webapp/bower_components/angular-cookies/angular-cookies.js',
            'main/webapp/bower_components/angular-local-storage/dist/angular-local-storage.js',
            'main/webapp/bower_components/angular-resource/angular-resource.js',
            'main/webapp/bower_components/angular-route/angular-route.js',
            'main/webapp/bower_components/angular-sanitize/angular-sanitize.js',
            'main/webapp/bower_components/angular-ui-router/release/angular-ui-router.js',
            'main/webapp/bower_components/jquery/dist/jquery.js',
            'main/webapp/bower_components/jquery-ui/jquery-ui.js',
            'main/webapp/bower_components/angular-ui-sortable/sortable.js',
            'main/webapp/bower_components/angularjs-dropdown-multiselect/src/angularjs-dropdown-multiselect.js',
            'main/webapp/bower_components/bootstrap/dist/js/bootstrap.js',
            'main/webapp/bower_components/js-yaml/dist/js-yaml.js',
            'main/webapp/bower_components/json3/lib/json3.js',
            'main/webapp/bower_components/modernizr/modernizr.js',
            'main/webapp/bower_components/ng-file-upload/ng-file-upload.js',
            'main/webapp/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'main/webapp/bower_components/marked/lib/marked.js',
            'main/webapp/bower_components/angular-marked/dist/angular-marked.js',
            'main/webapp/bower_components/file-saver.js/FileSaver.js',
            'main/webapp/bower_components/spin.js/spin.js',
            'main/webapp/bower_components/angular-spinner/angular-spinner.js',
            'main/webapp/bower_components/jszip/dist/jszip.js',
            'main/webapp/bower_components/js-xlsx/dist/xlsx.js',
            'main/webapp/bower_components/angular-disable-all/dist/angular-disable-all.js',
            'main/webapp/bower_components/angular-ui-indeterminate/dist/indeterminate.js',
            'main/webapp/bower_components/angular-confirm-modal/angular-confirm.js',
            'main/webapp/bower_components/highlightjs/highlight.pack.js',
            'main/webapp/bower_components/jstree/dist/jstree.js',
            'main/webapp/bower_components/bootstrap-switch/dist/js/bootstrap-switch.js',
            'main/webapp/bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch.js',
            'main/webapp/bower_components/angular-mocks/angular-mocks.js',
            // endbower
	    'main/webapp/scripts/app/editor/config.js',
	    'main/webapp/scripts/app/app.js',
            'main/webapp/scripts/app/app.constants.js',
	    'main/webapp/scripts/app/editor/*.js',
            'main/webapp/scripts/app/**/*.js',
            'main/webapp/scripts/components/**/*.{js,html}',
            'test/javascript/**/!(karma.conf).js',
//            'test/javascript/spec/controller/*.js'
        ],


        // list of files / patterns to exclude
        exclude: [],

        preprocessors: {
            './**/*.js': ['coverage']
        },

//        reporters: ['dots', 'jenkins', 'coverage', 'progress'],
	reporters: ['spec'],

        jenkinsReporter: {
            
            outputFile: '../target/test-results/karma/TESTS-results.xml'
        },

        coverageReporter: {
            
            dir: '../target/test-results/coverage',
            reporters: [
                {type: 'lcov', subdir: 'report-lcov'}
            ]
        },

        // web server port
        port: 9876,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
