'use strict';

angular.module('sdlctoolApp')
    .controller('UserManagementDetailController', function ($scope, $rootScope, $stateParams, entity, UserManagement, Authorities) {
        $scope.user = entity;
        $scope.userSet = {};
        
        $scope.load = function (id) {
        	UserManagement.get({id: id}, function(result) {
        		$scope.user = result;
            });
        };
        Authorities.query(function(result) {
        	$scope.authorities = result;
            angular.forEach($scope.authorities, function(authority) {
            	if($scope.user.authorities.length > 0) {
	            	angular.forEach($scope.user.authorities, function(role) {
	            		$scope.userSet[authority.name] = angular.equals(authority, role) ? "Yes" : "No";
	            	})
            	} else
            		$scope.userSet[authority.name] = "No";
            })
        	
        })
        
        $rootScope.$on('sdlctoolApp:userManagementUpdate', function(event, result) {
            $scope.user = result;
        });
    });
