'use strict';

angular.module('sdlctoolApp').controller('UserManagementDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'UserManagement', 'Authorities', 'User', 'AlertService',
        function($scope, $stateParams, $uibModalInstance, entity, UserManagement, Authorities, User, AlertService) {
    	$scope.usernamePattern = new RegExp("^[a-z0-9]*$");
        $scope.user = entity;
        Authorities.query(function(result) {
        	$scope.authorities = result;
        });
        
        $scope.load = function(id) {
        	UserManagement.get({id : id}, function(result) {
                $scope.user = result;
            });
        };

        var onSaveFinished = function (result) {
            console.log(result);
            $scope.$emit('sdlctoolApp:UserManagementUpdate', result);
            $uibModalInstance.close(result);
        };

        var onError = function(error) {
            if (error.status == 500) {
                AlertService.error('Internal server error. User {} could not be updated.'.replace('{}', $scope.user.id));
            } else if (error.status == 401) {
                AlertService.error('User update is unauthorized.')
            }
        }

        $scope.save = function () {
        	
            if ($scope.user.id != null) {
            	User.update($scope.user, onSaveFinished, onError);
            } else {
            	$scope.user.password = "Dummy=2pass";
            	$scope.user.langKey = 'en';
            	User.save($scope.user, onSaveFinished, function(error) {
            		if(error.status == 400) {
            			AlertService.error('Username or email already in use', ['email', 'username'])
            		}
            	});
            }
        };
        $scope.close = function(){}
        $scope.clear = function() {
        	$uibModalInstance.dismiss('cancel');
        };
}]);
