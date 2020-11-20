'use strict';
/* jshint undef: true, unused: true */
/* globals urlpattern, re_weburl */

angular.module('sdlctoolApp')
    .controller('TestRequirements', function (entity, $scope, $uibModalInstance, $filter, appConfig, $window, testAutomation, $q,
        authenticatorService, $uibModalStack, $timeout, AlertService) {
        var stopped = false;
        $scope.STATUSCONSTANT = {
            'ERROR': -1,
            'IN_PROGRESS': 0,
            'PASSED': 1,
            'FAILED': 2
        };

        var LETTERLIMIT = 200;

        var PUNCT = ['.', ':', '.', ';', ' ', '\n', '\t', '\r'];

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
                title: 'Error'
            }
        ];

        $scope.templateInScope = {
            title: 'Test requirements',
            url: 'scripts/app/editor/requirements/testRequirementsTemplates/infoTemplate.html'
        };

        $scope.stopTimeout = function () {
            if (angular.isDefined($scope.fetchResultInterval)) {
                $timeout.cancel($scope.fetchResultInterval);
            }
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

        $scope.removeReq = function (reqShortName) {
            for (var i = 0; i < $scope.entity.length; i++) {
                if ($scope.entity[i].shortName === reqShortName) {
                    $scope.entity.splice(i, 1);
                    break;
                }
            }
        };

        $scope.init = function() {
            stopped = false;
            $scope.error.display = false;
            $scope.authenticationProperties.showSpinner = false;
        }

        $scope.parseEntity = function () {
            $scope.testObject.requirements = [];
            $scope.testResults.reqs = [];
            angular.forEach($scope.entity, function (req) {
                req.remove = false;
                $scope.testResults.reqs.push({
                    shortName: req.shortName,
                    showOrder: req.order,
                    description: req.description,
                    testResults: [],
                    status: 0
                });
                $scope.testObject.requirements.push(req.shortName);
            });
        };

        $scope.showLongdesc = function (result) {
            result.backUpLimitDesc = result.limitDesc;
            result.limitDesc = undefined;
        };

        $scope.hideLongdesc = function (result) {
            result.limitDesc = result.backUpLimitDesc;
        };

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

        function fetchResult(location) {
            testAutomation.fetchResult(location, $scope.acceptedHeaderConfig).then(function (response) {
                configureDisplay('result', true, $scope.error.class, $scope.error.message);
                $scope.testResults.self = location;
                var testComplete = true;
                // var tempResults = testResults.requirements;

                /* jshint loopfunc: true */
                for (var i = 0; i < $scope.testResults.reqs.length; i++) {
                    var element = $scope.testResults.reqs[i];
                    if (element.status === 0) {
                        var requirement = $filter('filter')(response, {
                            requirement: element.shortName
                        }).pop();
                        if (angular.isDefined(requirement) && element.testResults.length === 0) {
                            angular.copy(requirement.testResults, element.testResults);
                        }
                        element.status = 1;
                        angular.forEach(requirement.testResults, function (remoteResult) {
                            angular.forEach(element.testResults, function (result) {
                                if (remoteResult.tool === result.tool && remoteResult.message !== '' && angular.isUndefined(result.complete) && !result.complete) {
                                    result.confidenceLevel = remoteResult.confidenceLevel;
                                    result.status = remoteResult.status;
                                    result.message = remoteResult.message;
                                    result.complete = true

                                    var split = result.message.split('`');
                                    // set default.
                                    result.limitDesc = LETTERLIMIT;
                                    result.backUpLimitDesc = result.limitDesc;
                                    if (split.length > 1) {
                                        var charactersCounter = 0;
                                        var codeDelimiterCounter = 0; // must always be a multiple of 2.
                                        for (var j = 0; j < split.length; j++) {
                                            charactersCounter += split[j].length;
                                            if (charactersCounter < LETTERLIMIT || codeDelimiterCounter % 2 === 1) {
                                                if (j < split.length - 1) {
                                                    codeDelimiterCounter++;
                                                    charactersCounter += 1; // for the code markdown delimeter
                                                } else if ((j === split.length - 1) && angular.equals(split[j], '')) {
                                                    // needed to properly display the code snippet
                                                    // in case the return to new line is not present at the end.
                                                    result.message += '\n';
                                                }
                                            } else {
                                                result.limitDesc = charactersCounter - split[j].length;
                                                result.backUpLimitDesc = result.limitDesc;
                                                break;
                                            }
                                        }
                                    }
                                    while (PUNCT.indexOf(result.message[result.limitDesc]) === -1 && result.limitDesc < result.message.length) {
                                        result.limitDesc++;
                                    }
                                    result.backUpLimitDesc = result.limitDesc;

                                }
                            });
                            // marks a requirement as completely tested if all its tests have completed.
                            if ($scope.STATUSCONSTANT[remoteResult.status] === $scope.STATUSCONSTANT.IN_PROGRESS) {
                                element.status = 0;
                                testComplete = false;
                            }
                        });
                    }
                }

                if (testComplete || stopped) {
                    // console.log('Test stopped');
                    $scope.authenticationProperties.spinnerProperty.showSpinner = false;
                    // console.log($scope.testResults);
                    $scope.stopTimeout();
                    authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
                } else {
                    $scope.authenticationProperties.spinnerProperty.text = 'Automated test still in progress...';
                    $scope.authenticationProperties.spinnerProperty.showSpinner = true;
                    $scope.fetchResultInterval = $timeout(function () {
                        if (!stopped) {
                            fetchResult(location);
                        }
                    }, 5000);
                }
            }).catch(function (location) {
                if (angular.isDefined(location.data[0]) && location.data[0].requirement == null) {
                    configureDisplay('error', true, 'alert alert-danger', location.data[0].testResults[0].message);
                } else if (($filter('filter')($scope.testResults.reqs, {
                        status: 1
                    })).length === 0) {
                    configureDisplay('error', true, 'alert alert-danger', 'An error occurred when fetching the results.');
                } else {
                    AlertService.clear();
                    AlertService.error('An error occurred when fetching the remaining results.', '');
                    configureDisplay('result', true, '', '');
                }
                $scope.stopTimeout();
                authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
                $scope.authenticationProperties.spinnerProperty.showSpinner = false;
            });
        }

        function successCallbackAfterStart(headers) {
            $scope.animation = 'slide-animate';
            $scope.testId = headers.location.split('/').pop();
            var url = '';
            $scope.acceptedHeaderConfig = headers.config;
            if (!re_weburl.test(headers.location)) {
                url = $scope.authenticationProperties.displayProperty.url;
                url = url.endsWith('/') ? url.substr(0, url.length - 1) : url;
            }
            url += headers.location;
            fetchResult(url);
        }

        $scope.startTest = function (form) {
            $scope.parseEntity();
            $scope.error.display = false;
            $scope.authenticationProperties.authenticatorpromise.derefer = $q.defer();
            $scope.authenticationProperties.spinnerProperty.showSpinner = true;
            testAutomation.headerConfig.withCredentials = false;
            // check authentication by running sending the request to start the test.
            testAutomation.startTest($scope.testObject, $scope.authenticationProperties.displayProperty.url)
                .then(successCallbackAfterStart)
                .catch(function (exception) {
                    if (exception.status !== 500 && exception.status !== 403) {
                        testAutomation.checkAuthentication($scope.testObject, $scope.authenticationProperties.displayProperty,
                                $scope.authenticationProperties.spinnerProperty, $scope.authenticationProperties.authenticatorpromise)
                            .then(successCallbackAfterStart)
                            .catch(function (authFailException) { // onRejected checker function
                                form.$submitted = false;
                                if (authFailException !== 'Ex001') {
                                    var errorMessage = 'The authentication to the securityCAT tool was unsuccessful. ' +
                                        'This can sometimes be due to wrong CORS header configurations. Please check this and try again.';
                                    if (authFailException === 'CORS') {
                                        errorMessage = 'Communication with the SecurityCAT Server was not possible due to Cross origin policy. Please make sure this is properly set.';
                                    }
                                    configureDisplay('error', true, 'alert alert-danger', errorMessage);
                                }

                            });
                    } else {
                        $scope.error.display = true;
                        $scope.error.class = 'alert alert-danger';
                        $scope.error.message = 'An error occured when starting the test.';
                    }
                });

        };

        function callbackAfterStop() {

            if (($filter('filter')($scope.testResults.reqs, {
                    status: 1
                })).length === 0) {
                $scope.clear();
            } else {
                // stop timeout to fetch the test results
                $scope.stopTimeout();
                configureDisplay('result', true, '', '');
            }
        }

        $scope.stopTest = function () {
            stopped = true;
            // stops the running checkstate operation.
            testAutomation.stopTest($scope.testId, $scope.acceptedHeaderConfig, $scope.authenticationProperties.displayProperty.url).then(function () {
                AlertService.success('The test was successfully cancelled.', '');
                callbackAfterStop();
            }).catch(function () {
                AlertService.add({
                    type: 'danger',
                    msg: 'The running test could not be cancelled.',
                    params: []
                });
                callbackAfterStop();

            });
            $scope.displayProperties.inProgressMessage = 'N/A';
            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
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

        $scope.backToInfo = function () {
            stopped = false;
            $scope.testResults = {};
            $scope.displayProperties.inProgressMessage = 'test running...';
            $scope.parseEntity();
            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
            configureDisplay('info', true, '', '');
        };

        $scope.pushCoordinates = function (event) {
            $scope.mouseX = event.clientX;
            $scope.mouseY = event.clientY;
        };

        $scope.clear = function () {
            $scope.stopTimeout();
            authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
            $uibModalInstance.dismiss();
        };

    });
