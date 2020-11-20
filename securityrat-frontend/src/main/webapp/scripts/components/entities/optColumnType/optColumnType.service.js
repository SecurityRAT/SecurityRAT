'use strict';

angular.module('sdlctoolApp')
    .factory('OptColumnType', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/optColumnTypes/:id', {}, {
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
                        var message = "The Option Column Type could not be deleted because an Option Column entity is still referencing to that Option Column Type. Please delete the corresponding Option Column first.";
                        SDLCToolExceptionService.showWarning('Deletion of Option Column Type failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteOptColumnTypeConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteOptColumnTypeConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
