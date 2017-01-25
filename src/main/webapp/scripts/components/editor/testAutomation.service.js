'use strict'
angular.module('sdlctoolApp')
    .service('testAutomation', function( appConfig, apiFactory, authenticatorService, $q, $timeout) {

      var headerConfig = {
        'X-Securitycat-Csrf': 'nocheck',
        'Content-Type': 'application/json'
      }

      /**
      *
      */
      function checkAuthentication(url, displayProperty, spinnerProperty, promise) {
        apiFactory.testRequirementApi('GET', url, "", "", true).then(function(response) {
          if(response.status === 302) {
            authenticatorService.tempCheckAuthentication(url, displayProperty, spinnerProperty, promise, checkAuthentication);
          } else {
            spinnerProperty.showSpinner = false;
            promise.derefer.resolve(response);
            authenticatorService.cancelPromises(promise);
          }
        }, function(exception) {
          if(exception.status === 401 || exception.status === 302 || exception.status === -1) {
            authenticatorService.tempCheckAuthentication(url, displayProperty, spinnerProperty, promise, checkAuthentication);
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
      function checkState(restcall, checkStatePromise) {

        apiFactory.testRequirementApi('GET', restcall, '', headerConfig, false).then(function(data) {
          if(data.state === "COMPLETE") {
            checkStatePromise.resolve(data.resourceURI);
          } else {
            if(checkStatePromise.promise.$$state.status === 0) {
              return checkState(restcall, checkStatePromise)
            }
          }
        }, function(response) {

          checkStatePromise.reject(response)
        })
        return checkStatePromise.promise;
      }

      /**
      * Checks the state of the a running securityCAT test.
      */
      function fetchResult(restcall) {
        var promise = $q.defer();
        apiFactory.testRequirementApi('GET', restcall, '', headerConfig, false).then(function(data) {
          promise.resolve(data);
        }, function() {
          promise.reject("error")
        })
        return promise.promise;
      }

      /**
      * Start the securityCAT automated test.
      */
      function startTest(data) {
        var resultPromise = $q.defer();
        var checkStatePromise = $q.defer();
        apiFactory.testRequirementApi('POST', appConfig.securityCATStartTest, data, headerConfig, true).then(function(response) {
          var headers = response.headers();
          if(angular.isDefined(headers.location)) {
            resultPromise.resolve(headers.location);
//              checkState(headers.location, checkStatePromise).then(function(resourceURI) {
//                fetchResult(resourceURI).then(function(testResults) {
//                  resultPromise.resolve(testResults);
//                })
//              })
          } else {
            resultPromise.reject("error")
          }
        }, function(response) {
            resultPromise.reject(response)
        });
        return resultPromise.promise;
      }

      /**
      * Checks the state of the a running securityCAT test.
      */
      function stopTest(promise, id) {
        var stopPromise = $q.defer();
        apiFactory.testRequirementApi('POST', appConfig.securityCATStopTest, id, headerConfig, false).then(function(response) {
          stopPromise.resolve("cancelled");
        }, function(response) {
          stopPromise.reject("error")
        })
        return stopPromise.promise;
      }

      var testAutomation = {
        stopTest : stopTest,
        startTest : startTest,
        checkState : checkState,
        fetchResult : fetchResult,
        checkAuthentication: checkAuthentication
      }
      return testAutomation;
    });
