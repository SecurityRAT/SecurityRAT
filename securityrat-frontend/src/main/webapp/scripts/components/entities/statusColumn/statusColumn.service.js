'use strict';

angular.module('sdlctoolApp')
    .factory('StatusColumn', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/statusColumns/:id', {}, {
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
                        var message = "The Status Column could not be deleted because a Implementation Type entity is still referencing to that Status Column. Please delete the corresponding Implementation Type first.";
                        SDLCToolExceptionService.showWarning('Deletion of Status Column failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteStatusColumnConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteStatusColumnConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
