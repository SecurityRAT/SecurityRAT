'use strict';

angular.module('sdlctoolApp')
    .factory('TagInstance', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/tagInstances/:id', {}, {
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
                        var message = "The Tag Instance could not be deleted because a Requirement Skeleton entity is still referencing to that Tag Instance. Please delete the corresponding Requirement Skeleton first.";
                        SDLCToolExceptionService.showWarning('Deletion of Tag Instance failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteTagInstanceConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteTagInstanceConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
