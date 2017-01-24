'use strict';

angular.module('sdlctoolApp')
    .factory('ReqCategory', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/reqCategorys/:id', {}, {
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
                        var message = "The Requirement Category could not be deleted because a Requirement Skeleton entity is still referencing to that Requirement Category. Please delete the corresponding Requirement Skeleton first.";
                        SDLCToolExceptionService.showWarning('Deletion of Requirement Category failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteReqCategoryConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteReqCategoryConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
