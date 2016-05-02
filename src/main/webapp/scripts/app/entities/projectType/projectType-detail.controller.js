'use strict';

angular.module('sdlctoolApp')
    .controller('ProjectTypeDetailController', function ($scope, $rootScope, $stateParams, entity, ProjectType, StatusColumn, OptColumn, RequirementSkeleton) {
        $scope.projectType = entity;
        $scope.load = function (id) {
            ProjectType.get({id: id}, function(result) {
                $scope.projectType = result;
            });
        };
        $rootScope.$on('sdlctoolApp:projectTypeUpdate', function(event, result) {
            $scope.projectType = result;
        });
    });
