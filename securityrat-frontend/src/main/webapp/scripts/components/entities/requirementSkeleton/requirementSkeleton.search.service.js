'use strict';

angular.module('sdlctoolApp')
    .factory('RequirementSkeletonSearch', function ($resource) {
        return $resource('api/_search/requirementSkeletons/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
