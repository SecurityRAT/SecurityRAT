'use strict';

angular.module('sdlctoolApp')
    .controller('RequirementSkeletonDetailController', function ($scope, $rootScope, $stateParams, entity, RequirementSkeleton, OptColumnContent, AlternativeInstance, ReqCategory, TagInstance, CollectionInstance, ProjectType) {
        $scope.requirementSkeleton = entity;
        $scope.load = function (id) {
            RequirementSkeleton.get({id: id}, function(result) {
                $scope.requirementSkeleton = result;
            });
        };
        $rootScope.$on('sdlctoolApp:requirementSkeletonUpdate', function(event, result) {
            $scope.requirementSkeleton = result;
        });
    });
