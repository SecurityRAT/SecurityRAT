'use strict';

angular.module('sdlctoolApp')
    .factory('OptColumn', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/optColumns/:id', {}, {
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
                        var message = "The Option Column could not be deleted because a Implementation Type entity is still referencing to that Option Column. Please delete the corresponding Implementation Type first.";
                        SDLCToolExceptionService.showWarning('Deletion of Option Column failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteOptColumnConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteOptColumnConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
