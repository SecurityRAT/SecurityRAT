'use strict';

angular.module('sdlctoolApp')
    .factory('checkAuthentication', function(authenticatorService, apiFactory) {
        var checkRoutines = {};
        function jiraAuth(apiCall, displayProperty, spinnerProperty, promise) {
            apiFactory.getJIRAInfo(apiCall).then(function(response) {
                if (response.length === 0) {
                    authenticatorService.startCheckAuthenticationProcess(apiCall, displayProperty, spinnerProperty, promise, jiraAuth);
                } else {
                	if (angular.isDefined(spinnerProperty.authenticating)) { spinnerProperty.authenticating = false; }
                    spinnerProperty.showSpinner = false;
                    promise.derefer.resolve(response);
                    authenticatorService.cancelPromises(promise);
                }
            }).catch(function(exception) {
                // console.log(exception)
                if (exception.status === 401 || (exception.status === 403 && apiCall.indexOf('attachment/') !== -1)) {
                    if (angular.isDefined(exception.errorException) && exception.errorException.opened.$$state.status === 0) {
                        exception.errorException.opened.$$state.value = false;
                        exception.errorException.opened.$$state.status = 1;
                    }
                    // if (apiCall.indexOf(appConfig.jiraRestApi) === -1)
                    authenticatorService.startCheckAuthenticationProcess(apiCall, displayProperty, spinnerProperty, promise, jiraAuth);
                } else {
                	if (angular.isDefined(spinnerProperty.authenticating)){ spinnerProperty.authenticating = false; }
                    spinnerProperty.showSpinner = false;
                    promise.derefer.reject(exception);
                    authenticatorService.cancelPromises(promise);
                }
            });
            return promise.derefer.promise;
        }

        checkRoutines = {
            jiraAuth: jiraAuth
        };

        return checkRoutines;
    });
