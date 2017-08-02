'use strict'
angular.module('sdlctoolApp')
    .service('testAutomation', function (appConfig, apiFactory, authenticatorService, $q, $timeout) {

        var headerConfig = {
            'X-Securitycat-Csrf': 'nocheck',
            'Content-Type': 'application/json'
        }

        /**
         *
         */
        function checkAuthentication(url, displayProperty, spinnerProperty, promise) {
            apiFactory.testRequirementApi('GET', url, "", "", true).then(function (response) {
                if (response.status === 302) {
                    authenticatorService.startCheckAuthenticationProcess(url, displayProperty, spinnerProperty, promise, checkAuthentication);
                } else {
                    spinnerProperty.showSpinner = false;
                    promise.derefer.resolve(response);
                    authenticatorService.cancelPromises(promise);
                }
            }).catch(function (exception) {
                if (exception.status === 401 || exception.status === 302 || exception.status === -1) {
                    authenticatorService.startCheckAuthenticationProcess(url, displayProperty, spinnerProperty, promise, checkAuthentication);
                }
                /*else if(exception.status === -1) {

                  promise.derefer.reject("CORS")
                }*/
                else {
                    spinnerProperty.showSpinner = false;
                    promise.derefer.reject(exception);
                    authenticatorService.cancelPromises(promise);
                }
            })

            return promise.derefer.promise;
        }



        /**
         * Checks the state of the a running securityCAT test.
         */
        //var checkStatePromise = $q.defer()
        function checkState(restcall) {

            // apiFactory.testRequirementApi('GET', restcall, '', headerConfig, false).then(function (data) {
            //     checkStatePromise.resolve(data);
            //     // if (data.resourceURI !== null) {
            //     //     checkStatePromise.resolve(data);
            //     // } else {
            //     //     if (checkStatePromise.promise.$$state.status === 0) {
                        
            //     //         return checkState(restcall, checkStatePromise)
            //     //     }
            //     // }
            // }).catch(function (response) {

            //     checkStatePromise.reject(response)
            // });
            // return checkStatePromise.promise;
            return apiFactory.testRequirementApi('GET', restcall, '', headerConfig, false);
        }

        /**
         * Fetch the result of the running test.
         */
        function fetchResult(restcall) {
            return new Promise(function (resolve, reject) {
                apiFactory.testRequirementApi('GET', restcall, '', headerConfig, false).then(function (data) {
                    resolve(data);
                }).catch(function () {
                    reject("error")
                })
            })

        }

        /**
         * Start the securityCAT automated test.
         */
        function startTest(data) {
            return new Promise(function (resolve, reject) {
                apiFactory.testRequirementApi('POST', appConfig.securityCATStartTest, data, headerConfig, true).then(function (response) {
                    var headers = response.headers();
                    if (angular.isDefined(headers.location)) {
                        resolve(headers.location);
                    } else {
                        reject("error");
                    }
                }).catch(function (response) {
                    reject(response)
                });
            });
        }

        /**
         * Checks the state of the a running securityCAT test.
         */
        function stopTest(promise, id) {
            var stopPromise = $q.defer();
            apiFactory.testRequirementApi('POST', appConfig.securityCATStopTest, id, headerConfig, false).then(function (response) {
                stopPromise.resolve("cancelled");
            }, function (response) {
                stopPromise.reject("error")
            })
            return stopPromise.promise;
        }

        var testAutomation = {
            stopTest: stopTest,
            startTest: startTest,
            checkState: checkState,
            fetchResult: fetchResult,
            checkAuthentication: checkAuthentication
        }
        return testAutomation;
    });
