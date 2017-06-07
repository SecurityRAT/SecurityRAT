'use strict';

angular.module('sdlctoolApp')
    .factory('SlideTemplateSearch', function ($resource) {
        return $resource('api/_search/slideTemplates/:query', {}, {
            'query': { method: 'GET', isArray: true}
        });
    });
