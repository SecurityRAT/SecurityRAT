'use strict';

angular.module('sdlctoolApp')
    .controller('UserManagementController', function ($scope, UserManagement, Authorities, User) {
        $scope.authorities = [];
        $scope.userSet = {};
        $scope.usersWithAuthorities = [];
        
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
        	Authorities.query(function(authorities) {
        		$scope.authorities = authorities;
        		UserManagement.query(function(users) {
                    $scope.usersWithAuthorities = users;
                    angular.forEach(users, function(user) {
                 	   $scope.userSet[user.login] = {};
                 	   callback(user);
            			})
                    
                 });
        	});
        }
        $scope.search = function () {
            UserManagement.query({query: $scope.searchQuery}, function(result) {
                $scope.userWithAuthorities = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };
        
        function callback(user) {
        	angular.forEach($scope.authorities, function(authority) {
    			if($scope.searchArrayByValue(authority.name, user.authorities)) {
    				$scope.userSet[user.login][authority.name] = true;
       			} else {
       				$scope.userSet[user.login][authority.name] = false;
       			}
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
