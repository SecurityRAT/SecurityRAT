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
            $scope.testObject.requirements = [];
            $scope.testResults.reqs = [];
            angular.forEach($scope.entity, function (req) {
                $scope.testResults.reqs.push({
                    shortName: req.shortName,
                    showOrder: req.order,
                    description: req.description,
                    testResults: [],
                    status: 0
                });
                $scope.testObject.requirements.push(req.shortName);
            });
            stopped = false;
            $scope.error.display = false;
            $scope.authenticationProperties.showSpinner = false;
        };

        $scope.showLongdesc = function (result) {
            result.limitDesc = undefined;
        };

        $scope.hideLongdesc = function (result) {
            result.limitDesc = LETTERLIMIT;
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
                        if (angular.isDefined(requirement)) {
                            angular.copy(requirement.testResults, element.testResults);
                        }
                        element.status = 1;
                        angular.forEach(element.testResults, function (result) {
                            result.limitDesc = LETTERLIMIT;
                            // marks a requirement as completely tested if all its tests have completed.
                            if ($scope.STATUSCONSTANT[result.status] === $scope.STATUSCONSTANT.IN_PROGRESS) {
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
                    authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
                } else {
                    $scope.authenticationProperties.spinnerProperty.text = 'Automated test still in progress...';
                    $scope.authenticationProperties.spinnerProperty.showSpinner = true;
                    $timeout(function () {
                        if (!stopped) {
                            fetchResult(location);
                        }
                    }, 3000);
                }
            }).catch(function () {
                if (($filter('filter')($scope.testResults.reqs, {
                        status: 1
                    })).length === 0) {
                    configureDisplay('error', true, 'alert alert-danger', 'An error occurred when fetching the results.');
                } else {
                    AlertService.clear();
                    AlertService.error('An error occurred when fetching the remaining result.', '');
                    configureDisplay('result', true, '', '');
                }
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
                url += appConfig.securityCAT.endsWith('/') ? appConfig.securityCAT.substr(0, appConfig.securityCAT.length - 1) : appConfig.securityCAT;
            }
            url += headers.location;
            fetchResult(url);
        }

        $scope.startTest = function () {
            $scope.error.display = false;
            $scope.authenticationProperties.authenticatorpromise.derefer = $q.defer();
            testAutomation.headerConfig.withCredentials = false;
            // check authentication by running sending the request to start the test.
            testAutomation.startTest($scope.testObject)
                .then(successCallbackAfterStart)
                .catch(function (exception) {
                    if (exception.status !== 500 && exception.status !== 403) {
                        testAutomation.checkAuthentication($scope.testObject, $scope.authenticationProperties.displayProperty,
                                $scope.authenticationProperties.spinnerProperty, $scope.authenticationProperties.authenticatorpromise)
                            .then(successCallbackAfterStart)
                            .catch(function (exception) { // onRejected checker function
                                var errorMessage = 'The authentication to the securityCAT tool was unsuccessful. ' +
                                    'This can sometimes be due to wrong CORS header configurations. Please check this and try again.';
                                if (exception === 'CORS') {
                                    errorMessage = 'Communication with the SecurityCAT Server was not possible due to Cross origin policy. Please make sure this is properly set.';
                                }
                                configureDisplay('error', true, 'alert alert-danger', errorMessage);
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
                configureDisplay('result', true, '', '');
            }
        }

        $scope.stopTest = function () {
            stopped = true;
            // stops the running checkstate operation.
            testAutomation.stopTest($scope.testId, $scope.acceptedHeaderConfig).then(function () {
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
            $scope.parseEntity();
            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
            configureDisplay('info', true, '', '');
        };

        $scope.pushCoordinates = function (event) {
            $scope.mouseX = event.clientX;
            $scope.mouseY = event.clientY;
        };

        $scope.clear = function () {
            authenticatorService.cancelPromises($scope.authenticationProperties.authenticatorpromise);
            $scope.authenticationProperties.spinnerProperty.showSpinner = false;
            $uibModalInstance.dismiss();
        };

    });
