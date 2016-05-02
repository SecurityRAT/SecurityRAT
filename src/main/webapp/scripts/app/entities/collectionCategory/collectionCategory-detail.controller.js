'use strict';

angular.module('sdlctoolApp')
    .controller('CollectionCategoryDetailController', function ($scope, $rootScope, $stateParams, entity, CollectionCategory, CollectionInstance) {
        $scope.collectionCategory = entity;
        $scope.load = function (id) {
            CollectionCategory.get({id: id}, function(result) {
                $scope.collectionCategory = result;
            });
        };
        $rootScope.$on('sdlctoolApp:collectionCategoryUpdate', function(event, result) {
            $scope.collectionCategory = result;
        });
    });
