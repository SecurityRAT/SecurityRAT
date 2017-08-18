'use strict';

angular.module('sdlctoolApp')
    .controller('ReqCategoryDetailController', function ($scope, $rootScope, $stateParams, entity, ReqCategory) {
        $scope.reqCategory = entity;
        $scope.load = function (id) {
            ReqCategory.get({id: id}, function(result) {
                $scope.reqCategory = result;
            });
        };
        $rootScope.$on('sdlctoolApp:reqCategoryUpdate', function(event, result) {
            $scope.reqCategory = result;
        });
    });
