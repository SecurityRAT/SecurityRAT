'use strict';

angular.module('sdlctoolApp')
    .factory('CollectionCategory', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/collectionCategorys/:id', {}, {
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
                        var message = "The Collection Category could not be deleted because a Collection Instance entity is still referencing to that Collection Category. Please delete the corresponding Collection Instance first.";
                        SDLCToolExceptionService.showWarning('Deletion of Collection Category failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteCollectionCategoryConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteCollectionCategoryConfirmation').modal('hide');
                        return data;
                    }
                }
             }
            
        });
    });
