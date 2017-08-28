'use strict';

angular.module('sdlctoolApp')
    .controller('TagCategoryDetailController', function ($scope, $rootScope, $stateParams, entity, TagCategory) {
        $scope.tagCategory = entity;
        $scope.load = function (id) {
            TagCategory.get({id: id}, function(result) {
                $scope.tagCategory = result;
            });
        };
        $rootScope.$on('sdlctoolApp:tagCategoryUpdate', function(event, result) {
            $scope.tagCategory = result;
        });
    });
