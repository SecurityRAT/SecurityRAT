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
            angular.forEach(result, function(authority) {
            	if($scope.user.authorities.length > 0) {
            		$scope.userSet[authority.name] = "No";
	            	angular.forEach($scope.user.authorities, function(role) {
	            		if(angular.equals(authority.name, role.name))
	            			$scope.userSet[authority.name] = "Yes";
	            	})
            	} else
            		$scope.userSet[authority.name] = "No";
            })
        	
        })
        
        
        $rootScope.$on('sdlctoolApp:userManagementUpdate', function(event, result) {
            $scope.user = result;
        });
    });
