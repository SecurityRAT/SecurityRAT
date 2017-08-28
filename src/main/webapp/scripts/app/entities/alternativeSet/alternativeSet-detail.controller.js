'use strict';

angular.module('sdlctoolApp')
    .controller('AlternativeSetDetailController', function ($scope, $rootScope, $stateParams, entity, AlternativeSet) {
        $scope.alternativeSet = entity;
        $scope.load = function (id) {
            AlternativeSet.get({id: id}, function(result) {
                $scope.alternativeSet = result;
            });
        };
        $rootScope.$on('sdlctoolApp:alternativeSetUpdate', function(event, result) {
            $scope.alternativeSet = result;
        });
    });
