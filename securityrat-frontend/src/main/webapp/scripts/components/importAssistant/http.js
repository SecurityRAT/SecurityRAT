'use strict';

angular.module('sdlctoolApp')
    .service('ImportAssistantHttp', function ($http, $q) {
        // Constants for the endpoint pathes

        var ENDPOINT_TYPES = '/frontend-api/importer/types';
        var ENDPOINT_APPLY = '/frontend-api/importer/apply';
        var ENDPOINT_INSTANCES = '/frontend-api/importer/instances/{typeIdentifier}';

        // A cache that may be used by the getTypes function for caching the
        // backend's response.

        var _typeCache = null;

        return {
            getTypes: function () {
                var deferred = $q.defer();

                if (!_typeCache) {
                    $http.get(ENDPOINT_TYPES)
                        .then(function (response) {
                            var types = response.data;

                            // Caching the response and resolving the promise.

                            _typeCache = types;
                            deferred.resolve(types);
                        })
                        .catch(function () {
                            deferred.reject('The server responded with an '
                                + 'invalid status code!');
                        });
                } else {
                    deferred.resolve(_typeCache);
                }

                return deferred.promise;
            },
        
            apply: function (objects) {
                var deferred = $q.defer();

                $http.post(ENDPOINT_APPLY, objects)
                    .then(function () {
                        deferred.resolve();
                    })
                    .catch(function() {
                        deferred.reject('The server responded with an '
                            + 'invalid status code!');
                    });

                return deferred.promise;
            },

            getInstances: function (typeIdentifier) {
                var deferred = $q.defer();

                $http.get(ENDPOINT_INSTANCES.replace(
                    '{typeIdentifier}',
                    typeIdentifier))
                    .then(function (response) {
                        deferred.resolve(response.data);
                    })
                    .catch(function () {
                        deferred.reject('The server responded with an '
                            + 'invalid status code!');
                    });

                return deferred.promise;
            }
        }
    });
