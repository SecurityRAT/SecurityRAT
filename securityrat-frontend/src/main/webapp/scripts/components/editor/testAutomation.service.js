'use strict';

angular.module('sdlctoolApp')
    .service('testAutomation', function (appConfig, apiFactory, authenticatorService) {

        var headerConfig = {
            config: {
                'X-Securitycat-Csrf': 'nocheck',
                'Content-Type': 'application/json'
            },
            'withCredentials': false
        };

        /**
         * Fetch the result of the running test.
         */
        function fetchResult(restcall, requestHeaderConfig) {
            return apiFactory.testRequirementApi('GET', restcall, '', {
                'withCredentials': requestHeaderConfig.withCredentials
            }, false);

        }

        /**
         * Start the securityCAT automated test.
         */
        function startTest(data, instanceUrl) {
            return new Promise(function (resolve, reject) {
                apiFactory.testRequirementApi('POST', appConfig.securityCATTestApi, data, headerConfig, true, instanceUrl).then(function (response) {
                    var headers = {
                        location: response.headers().location,
                        config: headerConfig
                    };

                    if (angular.isDefined(headers.location)) {
                        resolve(headers);
                    } else {
                        reject('error');
                    }
                }).catch(function (response) {
                    reject(response);
                });
            });
        }

        /**
         * Checks authentication by sending the request to start a test.
         */
        function checkAuthentication(testObject, displayProperty, spinnerProperty, promise) {
            headerConfig.withCredentials = true;
            startTest(testObject, displayProperty.url).then(function (response) {
                if (response.status === 302) {
                    authenticatorService.startCheckAuthenticationProcess(testObject, displayProperty, spinnerProperty, promise, checkAuthentication);
                } else {
                    spinnerProperty.showSpinner = false;
                    promise.derefer.resolve(response);
                    authenticatorService.cancelPromises(promise);
                }
            }).catch(function (exception) {
                if (exception.status === 401 || exception.status === 302 || exception.status === -1) {

                    authenticatorService.startCheckAuthenticationProcess(testObject, displayProperty, spinnerProperty, promise, checkAuthentication);
                } else {
                    spinnerProperty.showSpinner = false;
                    promise.derefer.reject(exception);
                    authenticatorService.cancelPromises(promise);
                }
            });

            return promise.derefer.promise;
        }

        /**
         * Stop a running test.
         */
        function stopTest(id, requestHeaderConfig, instanceUrl) {
            var restCall = appConfig.securityCATTestApi + '/' + id;
            return apiFactory.testRequirementApi('DELETE', restCall, '', requestHeaderConfig, false, instanceUrl);
        }

        var testAutomation = {
            stopTest: stopTest,
            startTest: startTest,
            fetchResult: fetchResult,
            checkAuthentication: checkAuthentication,
            headerConfig : headerConfig
        };
        return testAutomation;
    });
