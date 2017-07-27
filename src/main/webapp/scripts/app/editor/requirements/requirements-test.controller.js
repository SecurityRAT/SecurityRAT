'use strict'

angular.module('sdlctoolApp')
    .controller('TestRequirements', function (entity, $scope, $uibModalInstance, $filter, appConfig, $window, testAutomation, $q,
        authenticatorService, $uibModalStack, $timeout, $interval) {
        var STATECONSTANT = {
            INPROGRESS : 0,
            COMPLETE: 1
        };

        $scope.entity = entity;
        $scope.testObject = {
            testProperties: {}
        };

        $scope.testResults = {};
        $scope.urlPattern = urlpattern.javascriptStringRegex;

        $scope.displayProperties = {
            show: true,
            showTypes: 'Show selected requirements',
            myglyphicon: "glyphicon glyphicon-plus",
            showCloseButton: true
        }
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
            checkerUrl: "/api/account",
            authenticatorpromise: {}
        }

        $scope.error = {
            message: "",
            class: ""
        }

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
        ]

        $scope.templateInScope = {
            title: 'Test requirements',
            url: 'scripts/app/editor/requirements/testRequirementsTemplates/infoTemplate.html'
        };

        $scope.toggleShowHide = function () {
            $scope.displayProperties.show = !$scope.displayProperties.show;
            if ($scope.displayProperties.show) {
                $scope.displayProperties.showTypes = 'Show selected requirements';
                $scope.displayProperties.myglyphicon = "glyphicon glyphicon-plus";
            } else {
                $scope.displayProperties.showTypes = 'Hide selected requirements';
                $scope.displayProperties.myglyphicon = "glyphicon glyphicon-minus";
            }
        }

        $scope.parseEntity = function () {
            $scope.testObject.reqs = [];
            angular.forEach($scope.entity, function (req) {
                $scope.testObject.reqs.push(req.shortName);
            });
        }

        function cleanIntervalPromise() {
            if (angular.isDefined($scope.interval)) {
                $interval.cancel($scope.interval);
            }
        }

        function configureDisplay(actualTemplateName, showCloseButton, errorAlertType, errorMessage) {
            $scope.displayProperties.showCloseButton = showCloseButton;
            var template = $filter('filter')($scope.templates, {
                name: actualTemplateName
            }).pop()
            $scope.templateInScope.url = template.url;
            $scope.templateInScope.title = template.title;
            $scope.error.class = errorAlertType;
            $scope.error.message = errorMessage;
        }

        function fetchResult(resourceURI) {
            testAutomation.fetchResult(resourceURI).then(function (testResults) {
                configureDisplay('result', true, $scope.error.class, $scope.error.message)
                $scope.testResults.self = appConfig.securityCAT + testResults.self;
                var tempResults = testResults.requirements;

                angular.forEach(tempResults, function (result) {
                    if (angular.isUndefined(result.description)) {
                        var req = $filter('filter')(entity, {shortName: result.shortName}).pop();
                        result.description = req.description;
                        result.showOrder = req.showOrder;
                    }
                });

                $scope.testResults.reqs = tempResults;
            }).catch(function () {
                configureDisplay('error', true, 'alert alert-danger', "An error occurred when fetching the results.")
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
                    if(data.resourceURI !== null) {
                        $scope.displayProperties.showCloseButton = true;
                        if (angular.isUndefined($scope.testResults.reqs) || STATECONSTANT[data.state] === STATECONSTANT.INPROGRESS) {
                            fetchResult(data.resourceURI);
                            $scope.authenticationProperties.spinnerProperty.text = "Automated test still in progress...";
                            $scope.authenticationProperties.spinnerProperty.showSpinner = true;
                        } else if(STATECONSTANT[data.state] === STATECONSTANT.COMPLETE) {
                            fetchResult(data.resourceURI);
                            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
                            $interval.cancel($scope.interval);
                        }
                    }
                }).catch(function (response) {
                    if (response.status === 400 && response.data.state === "NONEXISTENT") {
                        cleanIntervalPromise()
                        $timeout(function () {
                            $uibModalStack.dismissAll();
                        })
                        configureDisplay('error', true, "alert alert-success", "The test automation was successfully cancelled")
                    }
                });
            }, 3000);
        }

        $scope.startTest = function () {
            $scope.authenticationProperties.authenticatorpromise.derefer = $q.defer();
            testAutomation.checkAuthentication($scope.authenticationProperties.checkerUrl, $scope.authenticationProperties.displayProperty,
                    $scope.authenticationProperties.spinnerProperty, $scope.authenticationProperties.authenticatorpromise).then(function (response) {
                    configureDisplay('loading', false, $scope.error.class, $scope.error.message)
                    $scope.animation = 'slide-animate'

                    // start the test automation
                    testAutomation.startTest($scope.testObject).then(function (checkURI) {
                        checkState(checkURI);
                    }, function (exception) {
                        configureDisplay('error', true, "alert alert-danger", "An error occurred when executing the test.")
                    });
                })
                .catch(function (exception) { // onRejected checker function
                    var errorMessage = "The authentication to the securityCAT tool was unsuccessful."
                    if (exception === "CORS") {
                        errorMessage = "Communication with the SecurityCAT Server was not possible due to Cross origin policy."
                    }
                    configureDisplay('error', true, "alert alert-danger", errorMessage)
                });
        }

        $scope.stopTest = function () {
            // stops the running checkstate operation.
            cleanIntervalPromise();
            testAutomation.stopTest($scope.checkStatePromise, $scope.testId).then(function () {
                //configureDisplay('error', true, "alert alert-success", "The test automation was successfully cancelled")
                $scope.clear();
            }).catch(function () {})

        }

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
        }

        $scope.pushCoordinates = function (event) {
            $scope.mouseX = event.clientX;
            $scope.mouseY = event.clientY;
        }

        $scope.clear = function () {
            authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
            cleanIntervalPromise();
            $uibModalInstance.dismiss();
        }
    });
