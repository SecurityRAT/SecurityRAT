'use strict';

angular.module('sdlctoolApp')
    .controller('TagInstanceDetailController', function ($scope, $rootScope, $stateParams, entity, TagInstance) {
        $scope.tagInstance = entity;
        $scope.load = function (id) {
            TagInstance.get({id: id}, function(result) {
                $scope.tagInstance = result;
            });
        };
        $rootScope.$on('sdlctoolApp:tagInstanceUpdate', function(event, result) {
            $scope.tagInstance = result;
        });
    });
