'use strict';
/* jshint undef: true */
/* globals document, re_weburl, XMLHttpRequest, hljs, jiraApiPrefix, jiraAttachment, jiraApiIssueType, importPrefix, jiraComment, jiraApiProject, jiraRestApi, localStorageKey, securityCATTestApi */

angular.module('sdlctoolApp', ['LocalStorageModule',
        'ui.bootstrap', // for modal dialogs
        'ngResource', 'ui.router', 'ngCookies', 'ngCacheBuster', 'ngFileUpload', 'infinite-scroll',
        'ngAnimate', // editor stuff from here on...
        'ngRoute',
        'ngSanitize',
        'ui.sortable',
        'angularjs-dropdown-multiselect',
        'angular-confirm',
        'angularSpinner',
        'hc.marked',
        'disableAll',
        'frapontillo.bootstrap-switch',
        'ui.indeterminate'
    ])
    /* jshint unused: false*/
    .run(function ($rootScope, $location, $window, $http, $state, Auth, Principal, ENV, VERSION, Account, $confirm) {
        $rootScope.ENV = ENV;
        $rootScope.VERSION = VERSION;
        $rootScope.AUTHENTICATIONTYPE = '';
        $rootScope.REGISTRATIONTYPE = '';
        $http.get('api/authentication_config').then(function (result) {
            $rootScope.AUTHENTICATIONTYPE = result.data.type === 'CAS' ? true : false;
            $rootScope.REGISTRATIONTYPE = result.data.registration;
            if (result.data.type === 'CAS') {
                $rootScope.CASLOGOUTURL = result.data.casLogout;
            }
        });

        $rootScope.back = function () {
            var notValidState = ['activate', 'logout', 'finishReset', 'requestReset'];
            // If previous state is 'activate' or do not exist go to 'editor'
            if (notValidState.indexOf($rootScope.previousStateName) !== -1 || $state.get($rootScope.previousStateName) === null) {
                $state.go('editor');
            } else {
                $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
            }
        };

        function callbackOnClean($rootScope, toState, toStateParams, Principal, Auth) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;
            var a = document.getElementById('redirect');
            if (a !== null) {
                document.body.removeChild(a);
            }
            if (Principal.isIdentityResolved()) {
                Auth.authorize();
            }
        }
        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromParams) {
            if (angular.isDefined(fromParams.isDirty) && fromParams.isDirty) {
                event.preventDefault();
                $confirm({
                        text: 'You have unsaved Changes. Are you sure you want to leave the page without saving?',
                        title: 'Confirm',
                        isDirty: fromParams.isDirty,
                        ok: 'Ignore Changes',
                        cancel: 'Cancel'
                    }, {
                        templateUrl: 'scripts/app/editor/confirm-modal.html'
                    })
                    .then(function () {
                        fromParams.isDirty = false;
                        $state.go(toState.name, toStateParams);
                        // $scope.onRouteChangeOff = '';
                        // $scope.requirementProperties.requirementsEdited = false;
                        // window.onbeforeunload = function (e) {};
                        // window.location.href = $location.url(newUrl).hash();
                    }, function () {
                        event.preventDefault();
                    });
            } else {
                callbackOnClean($rootScope, toState, toStateParams, Principal, Auth);
            }

        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var titleKey = 'SecurityRAT';
            $rootScope.previousStateName = fromState.name;
            $rootScope.previousStateParams = fromParams;
            // Set the page title key to the one configured in state or use default one
            if (toState.data.pageTitle) {
                titleKey = toState.data.pageTitle;
            }
            $window.document.title = titleKey;
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, httpRequestInterceptorCacheBusterProvider,
        $provide, markedProvider, localStorageServiceProvider, appConfig) {
        function getConstants() {
            var constants = [];
            var ajax = new XMLHttpRequest();
            ajax.open('GET', 'admin-api/configConstants', true);
            ajax.setRequestHeader('Accept', 'application/json, text/plain, */*');
            ajax.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        constants = JSON.parse(this.responseText);
                        angular.forEach(constants, function (constant) {
                            switch (constant.name) {
                                case 'customRequirementName':
                                    appConfig.customRequirement = constant.value;
                                    break;
                                default:
                                    appConfig[constant.name] = constant.value;
                                    break;
                            }
                        });
                    }
                    //                      else (this.status >= 400){
                    ////                            constants = this.statusText;
                    //                          
                    //                      }
                }
            };
            ajax.send(null);
        }
        getConstants();
        $locationProvider.html5Mode({
            enabled: true
        });
        localStorageServiceProvider.setPrefix('sdlc');
        //enable CSRF
        $httpProvider.defaults.xsrfCookieName = 'CSRF-TOKEN';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';

        //Cache everything except rest api requests
        httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/, /.*protected.*/], true);

        $urlRouterProvider.otherwise('/');
        $stateProvider.state('site', {
            'abstract': true,
            views: {
                'navbar@': {
                    templateUrl: 'scripts/components/navbar/navbar.html',
                    controller: 'NavbarController'
                }
            },
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ]
            }
        });

        $httpProvider.interceptors.push('errorHandlerInterceptor');
        $httpProvider.interceptors.push('authExpiredInterceptor');
        $httpProvider.interceptors.push('notificationInterceptor');

        $provide.decorator('$state', function ($delegate, $stateParams) {
            $delegate.forceReload = function () {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });

        markedProvider.setOptions({
            gfm: true,
            highlight: function (code, lang) {
                if (lang) {
                    return hljs.highlight(lang, code, true).value;
                } else {
                    return hljs.highlightAuto(code).value;
                }
            }
        });
        markedProvider.setRenderer({
            link: function (href, title, text) {
                return '<a href=\'' + href + '\'' + (title ? ' title=\'' + title + '\'' : '') + ' target=\'_blank\'>' + text + '</a>';
            }
        });
    })

    //factory purely for communication with the Rest API
    .factory('apiFactory', function ($http, $q, SDLCToolExceptionService, $timeout, appConfig) {

        var apiFactory = {};
        var apiPrefix = '/frontend-api/';
        var responseHeadersNeeded = false;

        apiFactory.testRequirementApi = function (method, restcall, data, headerConfig, headersNeeded, instanceUrl) {
            var url = '';
            if (!re_weburl.test(restcall)) {
                url = angular.isDefined(instanceUrl) && instanceUrl !== '' ? instanceUrl : appConfig.securityCAT;
                url = url.endsWith('/') ? url.substr(0, url.length - 1) : url;
            }

            url += restcall;
            responseHeadersNeeded = headersNeeded;
            return this.execute(method, url, data, headerConfig.config, headerConfig.withCredentials);
        };
        apiFactory.getJIRAInfo = function (url) {
            return this.execute('GET', url);
        };
        apiFactory.postExport = function (url, data, headerConfig) {
            return this.execute('POST', url, data, headerConfig);
        };
        apiFactory.putExport = function (url, data, headerConfig) {
            return this.execute('PUT', url, data, headerConfig);
        };
        apiFactory.deleteExport = function (url, data, headerConfig) {
            return this.execute('DELETE', url, data, headerConfig);
        };
        apiFactory.getAll = function (api) {
            return this.execute('GET', apiPrefix + api);
        };

        apiFactory.getDetails = function (api, id1, id2) {
            return this.execute('GET', apiPrefix + api + '/' + id1 + '/' + id2);
        };

        apiFactory.getById = function (api, id) {
            return this.execute('GET', apiPrefix + api + '/' + id);
        };

        apiFactory.getByQuery = function (api, query, requestParam) {
            return this.execute('GET', apiPrefix + api + '/' + query + '?' + requestParam);
        };


        apiFactory.execute = function (method, path, data, headerConfig, withCredentials) {

            return $http({
                    'method': method,
                    'url': path,
                    'data': data,
                    'withCredentials': angular.isDefined(withCredentials) ? withCredentials : true,
                    'headers': headerConfig
                })
                .then(
                    // 200 OK
                    function (response) {
                        if (responseHeadersNeeded) {
                            return response;
                        }
                        return response.data;
                    },
                    // Error
                    /* jshint undef: false*/
                    function (response) {

                        if (400 === parseInt(response.status, 10)) {
                            response.errorException = SDLCToolExceptionService.showWarning('Bad Request', 'The request could not be understood by the server due to malformed syntax.', SDLCToolExceptionService.DANGER);
                            return $q.reject(response);
                        }

                        if (401 === parseInt(response.status, 10)) {
                            //                          SDLCToolExceptionService.showPersistentWarning('Unauthorized', 'Login session has expired. Please reload the page in order to login again.', SDLCToolExceptionService.DANGER);
                            self.blockRequests = true;
                            return $q.reject(response);
                        }
                        if (-1 === response.status) {
                            self.blockRequests = true;
                            return $q.reject(response);
                        }

                        if (403 === parseInt(response.status, 10)) {
                            //                          $location.url("/noaccess");
                            //                          SDLCToolExceptionService.showPersistentWarning('Forbidden', 'You do not have permission to access this resource.', SDLCToolExceptionService.DANGER);
                            self.blockRequests = true;
                            return $q.reject(response);
                        }

                        if (404 === parseInt(response.status, 10)) {
                            response.errorException = SDLCToolExceptionService.showWarning('404 Not Found', 'The ressource you have entered was not found on the server. Please change the ressource to a valid one.', SDLCToolExceptionService.DANGER);

                            return $q.reject(response);
                        }

                        if (408 === parseInt(response.status, 10)) {
                            response.errorException = SDLCToolExceptionService.showWarning('Connection Timed Out', 'Server timed out waiting for the request. Please repeat the request without modifications at any later time.', SDLCToolExceptionService.DANGER);
                            return $q.reject(response);
                        }

                        if (500 === parseInt(response.status, 10)) {
                            response.errorException = SDLCToolExceptionService.showWarning('Internal Server Error', 'The server encountered an unexpected condition which prevented it from fulfilling the request.', SDLCToolExceptionService.DANGER);
                            return $q.reject(response);
                        }
                        if (0 === parseInt(response.status, 10)) {
                            return $q.reject(response);
                        }

                        response.errorException = SDLCToolExceptionService.showWarning('Service Unavailable', 'Service is not available for the moment. Please try again later.', SDLCToolExceptionService.DANGER);
                        return $q.reject(response);
                    });
        };
        return apiFactory;
    })
    .constant('appConfig', {
        jiraApiPrefix: jiraApiPrefix,
        jiraAttachment: jiraAttachment,
        jiraApiIssueType: jiraApiIssueType,
        importPrefix: importPrefix,
        jiraComment: jiraComment,
        jiraApiProject: jiraApiProject,
        jiraRestApi: jiraRestApi,
        jiraBrowseUrlPathName: jiraBrowseUrlPathName,
        localStorageKey: localStorageKey,
        securityCATTestApi: securityCATTestApi
    })

    .service('sharedProperties', function () {

        var property;
        return {
            getProperty: function () {
                return property;
            },
            setProperty: function (value) {
                property = value;
            }
        };
    })
    .service('getRequirementsFromImport', function ($q) {
        var requirements;
        return {
            getProperty: function () {
                return requirements;
            },
            setProperty: function (importObject) {
                var dereferred = $q.defer();

                requirements = importObject;

                dereferred.resolve('Requirements imported.');
                return dereferred.promise;
            }
        };
    })
    .service('authenticatorService', function ($uibModal, $q, $interval, $uibModalStack, $timeout, SDLCToolExceptionService) {
        return {
            runAuthenticator: function (jira) {
                var returnValue = $q.defer();
                if (jira.url !== '') {
                    var modalInstance = $uibModal.open({
                        size: 'lg',
                        backdrop: 'static',
                        templateUrl: 'scripts/app/editor/authenticator.modal.html',
                        controller: 'AuthenticatorController',
                        resolve: {
                            jira: function () {
                                return jira;
                            }
                        }
                    });
                    modalInstance.result.then(function () {
                        returnValue.resolve('start');
                    }, function () {
                        returnValue.reject('Ex001'); // Ex001 code for authentication start process was not triggered.
                    });
                } else {
                    returnValue.reject('Ex001');
                }
                return returnValue.promise;
            },

            //cancel the interval promise want the time is up.
            startCountdown: function (promise, spinnerProperty, jira) {
                if (jira.url !== '') {
                    return $timeout(function () {
                        var header = 'Authentication timeout';
                        var message = 'You could not authenticate yourself within the time interval! Please try later.';
                        //                        $uibModalStack.dismissAll('close authentication modal');
                        $interval.cancel(promise.interval);
                        spinnerProperty.showSpinner = false;
                        if (angular.isDefined(spinnerProperty.authenticating)) {
                            spinnerProperty.authenticating = false;
                        }
                        if (promise.runningModalPromise !== undefined) {
                            promise.runningModalPromise.close();
                        }
                        if (promise.derefer) {
                            promise.derefer.reject('Authentication failed');
                        }

                        SDLCToolExceptionService.showWarning(header, message, SDLCToolExceptionService.DANGER);
                    }, 61000);
                } else {
                    return $timeout(function () {
                        $interval.cancel(promise.interval);
                    }, 90000);
                }
            },
            cancelPromises: function (promise) {
                if (angular.isDefined(promise.interval)) {
                    $interval.cancel(promise.interval);
                }
                if (angular.isDefined(promise.timeout)) {
                    $timeout.cancel(promise.timeout);
                }
                if (promise.runningModalPromise !== undefined && promise.runningModalPromise.close !== undefined) {
                    promise.runningModalPromise.close();
                }
            },
            startCheckAuthenticationProcess: function (apiCall, displayProperty, spinnerProperty, promise, callback) {
                var self = this;
                if (angular.isUndefined(promise.interval) || (promise.interval.$$state.status !== 0)) {
                    self.runAuthenticator(displayProperty).then(function (data) {
                        if (angular.isDefined(spinnerProperty.authenticating)) {
                            spinnerProperty.authenticating = true;
                        }
                        //run the init method every 10 sec.
                        promise.interval = $interval(function () {
                            callback(apiCall, displayProperty, spinnerProperty, promise);
                        }, 10000);
                        promise.timeout = self.startCountdown(promise, spinnerProperty, displayProperty);
                        if (data === 'start') {
                            spinnerProperty.showSpinner = true;
                            if (angular.isDefined(promise.runningModalPromise)) {
                                promise.runningModalPromise = promise.runningModalPromise();
                            }
                        }
                    }, function (reject) {
                        if (angular.isDefined(spinnerProperty.authenticating)) {
                            spinnerProperty.authenticating = false;
                        }
                        spinnerProperty.showSpinner = false;
                        promise.derefer.reject(reject);
                        self.cancelPromises(promise);
                    });
                }
            }
        };
    })
    .service('helperService', function () {
        return {
            unique: function (objectsArray, key) {
                var newarr = [];
                var unique = {};
                angular.forEach(objectsArray, function (item) {
                    if (!unique[item[key]]) {
                        newarr.push(item);
                        unique[item[key]] = item;
                    }
                });
                return newarr;
            }
        };
    })
    .service('SDLCToolExceptionService', function ($uibModal) {
        return {
            SUCCESS: 'success',
            INFO: 'info',
            WARNING: 'warning',
            DANGER: 'danger',
            showWarning: function (headerText, message, type) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'scripts/app/editor/modal-alert.html',
                    controller: 'ModalAlertController',
                    resolve: {
                        headerText: function () {
                            return headerText;
                        },
                        message: function () {
                            return message;
                        },
                        type: function () {
                            return type;
                        }
                    }
                });
                return modalInstance;
            },
            showPersistentWarning: function (headerText, message, type) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'scripts/app/editor/persistent-warning.html',
                    controller: 'ModalAlertController',
                    resolve: {
                        headerText: function () {
                            return headerText;
                        },
                        message: function () {
                            return message;
                        },
                        type: function () {
                            return type;
                        }
                    }
                });
                return modalInstance;
            }
        };
    })

    .filter('filterByTags', function () {
        return function (array, requirements) {
            if (requirements.length === 0) {
                return array;
            } else {
                //Requirements array contains error if no requirement matched the tag selection
                if (requirements.indexOf('ERROR') > -1) {
                    array = [];
                    return array;
                } else {
                    return requirements;
                }
            }

        };
    })

    .filter('filterByCategories', function () {
        return function (array, categories) {
            if (categories.length === 0) {

                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (requirement) {
                    angular.forEach(categories, function (cat) {
                        if (cat.category === requirement.category) {
                            newView.push(requirement);
                        }
                    });
                });
                return newView;
            }
        };
    })
    .filter('filterByCategoriesForReqSkeletons', function () {
        return function (array, categories) {
            if (categories.length === 0) {

                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (requirement) {
                    angular.forEach(categories, function (cat) {
                        if (cat.id === requirement.reqCategory.id) {
                            newView.push(requirement);
                        }
                    });
                });
                return newView;
            }
        };
    })
    .filter('filterByTagForReqSkeletons', function () {
        return function (array, tagInstances) {
            if (tagInstances.length === 0) {

                return array;
            } else {
                var newView = [];
                angular.forEach(tagInstances, function (tag) {
                    angular.forEach(array, function (requirement) {
                        angular.forEach(requirement.tagInstances, function (taginstance) {
                            if (tag.id === taginstance.id) {
                                if (newView.indexOf(requirement) === -1) {
                                    newView.push(requirement);
                                }
                            }
                        });
                    });
                });
                return newView;
            }
        };
    })
    .filter('filterByCollsForReqSkeletons', function () {
        return function (array, collsInstances) {
            if (collsInstances.length === 0) {

                return array;
            } else {
                var newView = [];
                angular.forEach(collsInstances, function (coll) {
                    angular.forEach(array, function (requirement) {
                        angular.forEach(requirement.collectionInstances, function (collsInstance) {
                            if (coll.id === collsInstance.id) {
                                if (newView.indexOf(requirement) === -1) {
                                    newView.push(requirement);
                                }
                            }
                        });
                    });
                });
                return newView;
            }
        };
    })
    .filter('filterByTypesForReqSkeletons', function () {
        return function (array, projectTypes) {
            if (projectTypes.length === 0) {

                return array;
            } else {
                var newView = [];
                angular.forEach(projectTypes, function (type) {
                    angular.forEach(array, function (requirement) {
                        angular.forEach(requirement.projectTypes, function (projectType) {
                            if (type.id === projectType.id) {
                                if (newView.indexOf(requirement) === -1) {
                                    newView.push(requirement);
                                }
                            }
                        });
                    });
                });
                return newView;
            }
        };
    })
    .filter('filterByStatus', function ($filter) {
        return function (array, selectedStatus, statusColumns) {
            var isFilterPresent = false;

            for (var i = 0; i < statusColumns.length; i++) {
                var element = statusColumns[i];
                if (element.isEnum && selectedStatus[element.id].length > 0) {
                    isFilterPresent = true;
                    break;
                }
            }

            // filter is empty return original array.
            if (!isFilterPresent) {
                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (requirement) {
                    for (var j = 0; j < requirement.statusColumns.length; j++) {
                        var statColumn = requirement.statusColumns[j];
                        if (statColumn.isEnum && $filter('filter')(selectedStatus[statColumn.id], {
                                id: statColumn.valueId,
                                name: statColumn.value
                            }).length > 0) {
                            newView.push(requirement);
                            break;
                        }
                    }
                });
                return newView;
            }
        };

    }).filter('filterTicketStatus', function ($filter) {
        return function (array, selectedTicketStatus) {
            if (selectedTicketStatus.length === 0) {
                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (requirement) {
                    for (var i = 0; i < selectedTicketStatus.length; i++) {
                        var element = selectedTicketStatus[i];
                        if (angular.equals(element.name.toLowerCase(), 'no ticket')) {
                            if (angular.isUndefined(requirement.linkStatus) || (angular.isDefined(requirement.linkStatus) && requirement.linkStatus.ticketStatus.length === 0)) {


                                newView.push(requirement);
                                break;
                            }
                        } else {
                            if (angular.isDefined(requirement.linkStatus)) {
                                if ($filter('filter')(requirement.linkStatus.ticketStatus, {
                                        name: element.name
                                    }).length > 0) {
                                    newView.push(requirement);
                                    break;
                                }
                            }
                        }
                    }
                });
                return newView;
            }
        };
    })

    .filter('filterUpdates', function () {
        return function (array, updateReqs) {
            if (array.length === 0 || !updateReqs) {
                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (requirement) {
                    if (angular.isDefined(requirement.needsUpdate)) {
                        if (requirement.needsUpdate) {
                            newView.push(requirement);
                        }

                    }
                });
                return newView;
            }
        };
    })

    .filter('filterCategoryByCategory', function () {
        return function (array, categories) {
            if (categories.length === 0) {
                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (category) {
                    angular.forEach(categories, function (value) {
                        if (angular.equals(category.label, value.category)) {
                            newView.push(category);
                        }
                    });
                });
                return newView;
            }
        };
    })
    .filter('filterCategoryForEntities', function () {
        return function (array, categories, selector) {
            if (categories.length === 0) {
                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (requirement) {
                    angular.forEach(categories, function (value) {
                        if (angular.equals(requirement[selector].id, value.id)) {
                            newView.push(requirement);
                        }
                    });
                });
                return newView;
            }
        };
    })
    .filter('filterCategoryForEntitiesObject', function () {
        /* jshint unused: false*/
        return function (array, categories, selector) {
            if (categories.length === 0) {
                return array;
            } else {
                var newView = [];
                angular.forEach(array, function (requirement) {
                    angular.forEach(categories, function (value, key) {
                        if (angular.equals(requirement[selector].id, value)) {
                            newView.push(requirement);
                        }
                    });
                });
                return newView;
            }
        };
    })
    .filter('trusted', function ($sce, marked) {
        return function (html) {
            if (angular.isDefined(html) && html !== null) {
                return marked(html);
            }
        };
    })
    .filter('filterOptColumnByText', function ($filter) {
        return function (array, textfilterObject, optColumns) {

            /* jshint loopfunc: true */
            if (!$.isEmptyObject(textfilterObject) && array.length > 0) {
                for (var i = 0; i < optColumns.length; i++) {
                    var element = optColumns[i];
                    if (angular.isDefined(textfilterObject[element.id]) && textfilterObject[element.id] !== '') {
                        // filter is present in object, so do filter.
                        var newArray = [];
                        angular.forEach(array, function (req) {
                            for (var j = 0; j < req.optionColumns.length; j++) {
                                var optColumn = req.optionColumns[j];
                                if (angular.isDefined(textfilterObject[optColumn.showOrder]) && textfilterObject[optColumn.id] !== '') {
                                    if ($filter('filter')(optColumn.content, {
                                            content: textfilterObject[optColumn.showOrder]
                                        }).length > 0) {
                                        newArray.push(req);
                                        // break is need to prevent duplicate requirements in new array.
                                        break;
                                    }
                                }
                            }
                        });
                        return newArray;
                    }
                }
            }

            return array;
        };
    })
    .filter('filterStatusColumnByText', function ($filter) {
        return function (array, textfilterObject, statusColumns) {
            /* jshint loopfunc: true */
            if (!$.isEmptyObject(textfilterObject) && array.length > 0) {
                for (var i = 0; i < statusColumns.length; i++) {
                    var element = statusColumns[i];
                    if (!element.isEnum && angular.isDefined(textfilterObject[element.id]) && textfilterObject[element.id] !== '') {
                        var newArray = [];
                        angular.forEach(array, function (req) {
                            for (var j = 0; j < req.statusColumns.length; j++) {
                                var statusColumn = req.statusColumns[j];
                                if (!statusColumn.isEnum && angular.isDefined(textfilterObject[statusColumn.id]) && textfilterObject[statusColumn.id] !== '' &&
                                    statusColumn.value.indexOf(textfilterObject[statusColumn.id]) !== -1) {
                                    newArray.push(req);
                                    // break is need to prevent duplicate requirements in new array.
                                    break;
                                }
                            }
                        });

                        return newArray;
                    }
                }
            }

            return array;
        };
    })
    .filter('sanitizeMarked', function ($sanitize) {
        return function (html) {
            return $sanitize(html);
        }
    });
