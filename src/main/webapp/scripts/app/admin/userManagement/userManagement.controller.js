'use strict';

angular.module('sdlctoolApp')
    .controller('UserManagementController', function($scope, UserManagement, User, UserManagementSearch, Helper, Account) {
        $scope.usersWithAuthorities = [];
        $scope.activeUser = {}

        Account.get(function(response) {
            $scope.activeUser = response.data;
        })

        $scope.loadAll = function() {
            UserManagement.query(function(users) {
                $scope.usersWithAuthorities = users;
            });
        }

        $scope.removeRolePrefix = function(value) {
            return value.replace('ROLE_', '');
        }

        $scope.loadAll();

        var onSaveFinished = function(result) {
            $scope.$emit('sdlctoolApp:UserManagementUpdate', result);
        };

        $scope.updateUserActivation = function(user) {
            user.activated = !user.activated;
            User.update(user, onSaveFinished);
        }

        $scope.delete = function(user) {
            $scope.user = user;
            $('#deleteUserConfirmation').appendTo("body").modal('show');
        };

        $scope.confirmDelete = function(id) {
            User.delete({ login: id },
                function() {
                    $('#deleteUserConfirmation').modal('hide');
                    $scope.loadAll();
                    $scope.clear();
                });
        };
        $scope.clear = function() {
            $scope.user = {};
        }


    });
