'use strict';
/* jshint undef: true, unused: true */
/* globals urlpattern */

angular.module('sdlctoolApp')
    .controller('TestRequirements', function (entity, $scope, $uibModalInstance, $filter, appConfig, $window, testAutomation, $q,
        authenticatorService, $uibModalStack, $timeout, $interval) {
        var STATECONSTANT = {
            IN_PROGRESS: 0,
            INPROGRESS: 0,
            COMPLETE: 1
        };

        var LETTERLIMIT = 200;

        $scope.entity = entity;

        $scope.testObject = {
            testProperties: {}
        };

        $scope.testResults = {};
        $scope.urlPattern = urlpattern.javascriptStringRegex;

        $scope.displayProperties = {
            show: true,
            showTypes: 'Show selected requirements',
            myglyphicon: 'glyphicon glyphicon-plus',
            showCloseButton: true,
            inProgressMessage: 'test running...'
        };

        $scope.authenticationProperties = {
            spinnerProperty: {
                fail: false,
                showSpinner: false,
                failed: '',
                text: 'SecurityCAT Authentication running...'
            },
            displayProperty: {
                url: appConfig.securityCAT,
                message: 'You are not authenticated, please click on the following link to authenticate yourself. You will have one minute after a click on the link.'
            },
            checkerUrl: '/api/account',
            authenticatorpromise: {}
        };

        $scope.error = {
            message: '',
            class: '',
            display: false
        };

        $scope.templates = [{
                name: 'info',
                url: 'scripts/app/editor/requirements/testRequirementsTemplates/infoTemplate.html',
                title: 'Test requirements'
            },
            {
                name: 'loading',
                url: 'scripts/app/editor/requirements/testRequirementsTemplates/loadingTemplate.html',
                title: 'Test requirements'
            },
            {
                name: 'result',
                url: 'scripts/app/editor/requirements/testRequirementsTemplates/resultTemplate.html',
                title: 'Test results'
            },
            {
                name: 'error',
                url: 'scripts/app/editor/requirements/testRequirementsTemplates/errorTemplate.html',
                title: 'Test requirements'
            }
        ];

        $scope.templateInScope = {
            title: 'Test requirements',
            url: 'scripts/app/editor/requirements/testRequirementsTemplates/infoTemplate.html'
        };

        $scope.toggleShowHide = function () {
            $scope.displayProperties.show = !$scope.displayProperties.show;
            if ($scope.displayProperties.show) {
                $scope.displayProperties.showTypes = 'Show selected requirements';
                $scope.displayProperties.myglyphicon = 'glyphicon glyphicon-plus';
            } else {
                $scope.displayProperties.showTypes = 'Hide selected requirements';
                $scope.displayProperties.myglyphicon = 'glyphicon glyphicon-minus';
            }
        };

        $scope.parseEntity = function () {
            $scope.testObject.reqs = [];
            $scope.testResults.reqs = [];
            angular.forEach($scope.entity, function (req) {
                $scope.testResults.reqs.push({
                    shortName: req.shortName,
                    showOrder: req.showOrder,
                    description: req.description,
                    state: 0
                });
                $scope.testObject.reqs.push(req.shortName);
            });
        };

        $scope.showLongdesc = function (result) {
            result.limitDesc = undefined;
        };

        $scope.hideLongdesc = function (result) {
            result.limitDesc = LETTERLIMIT;
        };

        function cleanIntervalPromise() {
            if (angular.isDefined($scope.interval)) {
                $interval.cancel($scope.interval);
            }
        }

        function configureDisplay(actualTemplateName, showCloseButton, errorAlertType, errorMessage) {
            $scope.displayProperties.showCloseButton = showCloseButton;
            var template = $filter('filter')($scope.templates, {
                name: actualTemplateName
            }).pop();
            $scope.templateInScope.url = template.url;
            $scope.templateInScope.title = template.title;
            $scope.error.class = errorAlertType;
            $scope.error.message = errorMessage;
        }

        function fetchResult(resultStateObj) {
            testAutomation.fetchResult(resultStateObj.resourceURI).then(function (response) {
                configureDisplay('result', true, $scope.error.class, $scope.error.message);
                $scope.testResults.self = appConfig.securityCAT + response.self;
                // var tempResults = testResults.requirements;

                /* jshint loopfunc: true */
                for (var i = 0; i < $scope.testResults.reqs.length; i++) {
                    var element = $scope.testResults.reqs[i];
                    if (element.state === 0) {
                        element.state = 1;
                        angular.extend(element, $filter('filter')(response.requirements, {
                            shortName: element.shortName
                        }).pop());
                        angular.forEach(element.results, function (result) {
                            result.limitDesc = LETTERLIMIT;
                            // marks a requirement as completely tested if all its tests have completed.
                            if (result.state === 0) {
                                element.state = 0;
                            }
                        });
                    }
                }

                if (STATECONSTANT[resultStateObj.state] === STATECONSTANT.IN_PROGRESS) {
                    $scope.authenticationProperties.spinnerProperty.text = 'Automated test still in progress...';
                    $scope.authenticationProperties.spinnerProperty.showSpinner = true;
                } else if (STATECONSTANT[resultStateObj.state] === STATECONSTANT.COMPLETE) {
                    $scope.authenticationProperties.spinnerProperty.showSpinner = false;
                    authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
                    cleanIntervalPromise();
                }
            }).catch(function () {
                if (($filter('filter')($scope.testResults.reqs, {
                        state: 1
                    })).length === 0) {
                    configureDisplay('error', true, 'alert alert-danger', 'An error occurred when fetching the results.');
                } else {
                    $scope.error.display = true;
                    configureDisplay('error', true, 'alert alert-danger', 'An error occurred when fetching the results.');
                }
                authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
                $scope.authenticationProperties.spinnerProperty.showSpinner = false;
                cleanIntervalPromise();
            });
        }

        function checkState(location) {
            // start a promise and get the queue Id of the test in case the test is stopped.
            $scope.checkStatePromise = $q.defer();
            $scope.testId = location.split('/').pop();
            // Checks the state every 3secs and fetches the available test results until the test is complete.
            $scope.interval = $interval(function () {
                testAutomation.checkState(location).then(function (data) {
                    if (data.resourceURI !== null) {
                        $scope.displayProperties.showCloseButton = true;
                        fetchResult(data);
                    }
                }).catch(function (response) {
                    if (response.status === 400 && response.data.state === 'NONEXISTENT') {
                        cleanIntervalPromise();
                        $timeout(function () {
                            $uibModalStack.dismissAll();
                        });
                        configureDisplay('error', true, 'alert alert-success', 'The test automation was successfully cancelled');
                    }
                });
            }, 10000);
        }

        $scope.startTest = function () {
            $scope.authenticationProperties.authenticatorpromise.derefer = $q.defer();
            testAutomation.checkAuthentication('/serviceapi/starttest', $scope.authenticationProperties.displayProperty,
                    $scope.authenticationProperties.spinnerProperty, $scope.authenticationProperties.authenticatorpromise).then(function () {
                    // TODO change loading display to result display should be shown
                    configureDisplay('loading', false, $scope.error.class, $scope.error.message);
                    $scope.animation = 'slide-animate';

                    // start the test automation
                    testAutomation.startTest($scope.testObject).then(function (checkURI) {
                        checkState(checkURI);
                    }, function () {
                        configureDisplay('error', true, 'alert alert-danger', 'An error occurred when executing the test.');
                    });
                })
                .catch(function (exception) { // onRejected checker function
                    var errorMessage = 'The authentication to the securityCAT tool was unsuccessful.';
                    if (exception === 'CORS') {
                        errorMessage = 'Communication with the SecurityCAT Server was not possible due to Cross origin policy.';
                    }
                    configureDisplay('error', true, 'alert alert-danger', errorMessage);
                });
        };

        $scope.stopTest = function () {
            // stops the running checkstate operation.
            cleanIntervalPromise();
            testAutomation.stopTest($scope.checkStatePromise, $scope.testId).then(function () {
                //configureDisplay('error', true, "alert alert-success", "The test automation was successfully cancelled")
                $scope.clear();
            }).catch(function () {});

        };

        $scope.getProgressbarType = function (value) {
            var type = '';
            if (value < 50) {
                type = 'danger';
            } else if (value < 80) {
                type = 'warning';
            } else if (value <= 100) {
                type = 'success';
            }
            return type;
        };

        $scope.pushCoordinates = function (event) {
            $scope.mouseX = event.clientX;
            $scope.mouseY = event.clientY;
        };

        $scope.clear = function () {
            authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
            cleanIntervalPromise();
            $uibModalInstance.dismiss();
        };
    });
