'use strict';

angular.module('sdlctoolApp')
    .factory('CollectionInstance', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/collectionInstances/:id', {}, {
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
                        var message = "The Collection Instance could not be deleted because a Requirement Skeleton entity is still referencing to that Collection Instance. Please delete the corresponding Requirement Skeleton first.";
                        SDLCToolExceptionService.showWarning('Deletion of Collection Instance failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteCollectionInstanceConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteCollectionInstanceConfirmation').modal('hide');
                        return data;
                    }
                }
            }

        });
    });
