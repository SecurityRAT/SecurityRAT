'use strict';

angular.module('sdlctoolApp')
    .controller('ConfigConstantController', function ($scope, ConfigConstant, ConfigConstantSearch, $http, $filter) {
        $scope.constants = [];
        $scope.activate = false;
        $scope.testAutomation = {
        		'name': 'securityCAT',
        		'value': '',
        		'description': 'The URL for the SecurityCAT application.'
        }
        $scope.loadAll = function() {
          $scope.activate = false;
        	ConfigConstant.query(function(result) {
               $scope.constants = result;
               var value = $filter('filter')(result, {name: $scope.testAutomation.name})
               if(value.length === 1) {
            	   $scope.activate = true;
               }
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
        	ConfigConstant.get({id: id}, function(result) {
                $scope.constant = result;
                $('#deleteConfigConstantConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
        	ConfigConstant.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteConfigConstantConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.search = function () {
        	ConfigConstantSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.constants = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };

        $scope.activateTestAutomation = function() {
        	var result = $filter('filter')($scope.constants, {name: $scope.testAutomation.name})
        	if($scope.activate) {
	        	if(result.length === 0) {
	    			ConfigConstant.save($scope.testAutomation, $scope.refresh)
	        	}
        	}else {
        		if(result.length === 1) {
        			$scope.delete(result.pop().id)
//        			ConfigConstant.update($scope.testAutomation, $scope.refresh)
        		}
        	}
        }

        $scope.checkSecurityCAT = function() {
          var result = $filter('filter')($scope.constants, {name: $scope.testAutomation.name})
          return $scope.activate && result.length === 1 && result.pop().value === '';
        }
        
        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.constant = {name: null, description: null, id: null};
        };
    });
