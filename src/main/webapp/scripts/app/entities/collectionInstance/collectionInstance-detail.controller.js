'use strict';

angular.module('sdlctoolApp')
    .controller('CollectionInstanceDetailController', function ($scope, $rootScope, $stateParams, entity, CollectionInstance) {
        $scope.collectionInstance = entity;
        $scope.load = function (id) {
            CollectionInstance.get({id: id}, function(result) {
                $scope.collectionInstance = result;
            });
        };
        $rootScope.$on('sdlctoolApp:collectionInstanceUpdate', function(event, result) {
            $scope.collectionInstance = result;
        });
    });
