'use strict';

angular.module('sdlctoolApp')
    .controller('UserManagementController', function ($scope, UserManagement, Authorities, User, 
        UserManagementSearch, Helper, Account) {
        $scope.authorities = [];
        $scope.userSet = {};
        $scope.usersWithAuthorities = [];
        $scope.activeUser = {}

        Account.get(function(response) {
            $scope.activeUser = response.data;
        })
        function callback(user) {
        	angular.forEach($scope.authorities, function(authority) {
    			if(Helper.searchArrayByValue(authority.name, user.authorities)) {
    				$scope.userSet[user.login][authority.name] = true;
       			} else {
       				$scope.userSet[user.login][authority.name] = false;
       			}
        	});
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

        $scope.removeRolePrefix = function(value) {
            return value.replace('ROLE_', '');
        }
                
        $scope.loadAll(callback);

         var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:UserManagementUpdate', result);
        };

        $scope.updateUserActivation = function(user) {
            user.activated = !user.activated;
            User.update(user, onSaveFinished);
        }

        $scope.delete = function (user) {
        	$scope.user = user;
        	$('#deleteUserConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDelete = function (id) {
            User.delete({login: id},
                function () {
                    $('#deleteUserConfirmation').modal('hide');
                    $scope.loadAll(callback);
                    $scope.clear();
                });
        };
        $scope.clear = function() {
        	$scope.user = {};
        }
        

    });
