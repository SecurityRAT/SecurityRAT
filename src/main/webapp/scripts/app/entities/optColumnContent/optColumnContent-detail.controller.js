'use strict';

angular.module('sdlctoolApp')
    .controller('OptColumnContentDetailController', function ($scope, $rootScope, $stateParams, entity, OptColumnContent) {
        $scope.optColumnContent = entity;
        $scope.load = function (id) {
            OptColumnContent.get({id: id}, function(result) {
                $scope.optColumnContent = result;
            });
        };
        $rootScope.$on('sdlctoolApp:optColumnContentUpdate', function(event, result) {
            $scope.optColumnContent = result;
        });
    });
