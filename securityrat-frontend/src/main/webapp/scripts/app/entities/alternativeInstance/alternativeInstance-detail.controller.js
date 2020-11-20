'use strict';

angular.module('sdlctoolApp')
    .controller('AlternativeInstanceDetailController', function ($scope, $rootScope, $stateParams, entity, AlternativeInstance) {
        $scope.alternativeInstance = entity;
        $scope.load = function (id) {
            AlternativeInstance.get({id: id}, function(result) {
                $scope.alternativeInstance = result;
            });
        };
        $rootScope.$on('sdlctoolApp:alternativeInstanceUpdate', function(event, result) {
            $scope.alternativeInstance = result;
        });
    });
