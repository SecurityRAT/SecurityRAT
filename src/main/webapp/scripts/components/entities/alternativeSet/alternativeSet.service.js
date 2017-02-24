'use strict';

angular.module('sdlctoolApp')
    .factory('AlternativeSet', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/alternativeSets/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' },
            'delete': {
                method: 'DELETE',
                transformResponse: function (data) {
                     //check if dependency error in database
                     if (data.includes("hibernate.exception.ConstraintViolationException")) {
                        var message = "The Alternative Set could not be deleted because an Alternative Instance entity is still referencing to that Alternative Set. Please delete the corresponding Alternative Instance first.";
                        SDLCToolExceptionService.showWarning('Deletion of Alternative Set failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteAlternativeSetConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteAlternativeSetConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
