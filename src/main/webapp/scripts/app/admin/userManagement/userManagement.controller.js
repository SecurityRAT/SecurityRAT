'use strict';

angular.module('sdlctoolApp')
    .controller('UserManagementController', function ($scope, UserManagement, Authorities, User) {
    	
    	
        $scope.authorities = [];
        $scope.userSet = [];
        
        $scope.searchArrayByValue = function(search, object) {
        	var bool = false;
        	angular.forEach(object, function(obj) {
        		angular.forEach(obj, function(value, key) {
        			if(value === search){
        				bool = true;
        			}
        		});
        	});
        	return bool;
        }
        
        $scope.loadAll = function(callback) {
        	Authorities.query(function(result) {
        		$scope.authorities = result;
        	});
        	UserManagement.query(function(result) {
               $scope.usersWithAuthorities = result;
               angular.forEach($scope.usersWithAuthorities, function(user) {
            	   $scope.userSet[user.login] = {};
       			})
               callback();
            });
        	
        }
        
        function callback() {
        	angular.forEach($scope.authorities, function(authority) {
        		angular.forEach($scope.usersWithAuthorities, function(user) {
        			if($scope.searchArrayByValue(authority.name, user.authorities)) {
        				$scope.userSet[user.login][authority.name] = true;
           			} else {
           				$scope.userSet[user.login][authority.name] = false;
           			}
        		})
        	});
        }
        $scope.loadAll(callback);
        $scope.delete = function (user) {
        	$scope.user = user;
        	$('#deleteUserConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDelete = function (id) {
            User.delete({login: id},
                function () {
                    $scope.loadAll(callback);
                    $('#deleteUserConfirmation').modal('hide');
                    $scope.clear();
                });
        };
        $scope.clear = function() {
        	$scope.user = {};
        }
        

    });
