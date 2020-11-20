'use strict';

angular.module('sdlctoolApp')
    .factory('TagCategory', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/tagCategorys/:id', {}, {
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
                        var message = "The Tag Category could not be deleted because a Tag Instance entity is still referencing to that Tag Category. Please delete the corresponding Tag Instance first.";
                        SDLCToolExceptionService.showWarning('Deletion of Tag Category failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteTagCategoryConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteTagCategoryConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
