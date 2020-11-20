'use strict';

angular.module('sdlctoolApp')
    .factory('ProjectType', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/projectTypes/:id', {}, {
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
                        var message = "The Implementation Type could not be deleted because a Requirement Skeleton entity is still referencing to that Implementation Type. Please delete the corresponding Requirement Skeleton first.";
                        SDLCToolExceptionService.showWarning('Deletion of Implementation Type failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteProjectTypeConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteProjectTypeConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
