'use strict';

angular.module('sdlctoolApp')
    .factory('RequirementSkeleton', function ($resource, DateUtils, SDLCToolExceptionService) {
        return $resource('api/requirementSkeletons/:id', {}, {
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
                        var message = "The Requirement Skeleton could not be deleted because an Option Column Content or Alternative Instance entity is still referencing to that Requirement Skeleton. Please delete the corresponding Option Column Content or Alternative Instance first."; 
                        SDLCToolExceptionService.showWarning('Deletion of Requirement Skeleton failed due to dependencies', message, SDLCToolExceptionService.DANGER);
                        $('#deleteRequirementSkeletonConfirmation').modal('hide');
                        return null;
                    } else {
                        $('#deleteRequirementSkeletonConfirmation').modal('hide');
                        return data;
                    }
                }
            }
        });
    });
