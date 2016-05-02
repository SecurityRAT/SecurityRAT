'use strict';

angular.module('sdlctoolApp')
    .controller('ConfigConstantController', function ($scope, ConfigConstant, ConfigConstantSearch) {
        $scope.constants = [];
        $scope.loadAll = function() {
        	ConfigConstant.query(function(result) {
               $scope.constants = result;
            });
        };
        $scope.loadAll();

//        $scope.delete = function (id) {
//        	ConfigConstant.get({id: id}, function(result) {
//                $scope.constant = result;
//                $('#deleteConfigConstantConfirmation').appendTo("body").modal('show');
//            });
//        };
//
//        $scope.confirmDelete = function (id) {
//        	ConfigConstant.delete({id: id},
//                function () {
//                    $scope.loadAll();
//                    $('#deleteConfigConstantConfirmation').modal('hide');
//                    $scope.clear();
//                });
//        };

        $scope.search = function () {
        	ConfigConstantSearch.query({query: $scope.searchQuery}, function(result) {
                $scope.constants = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.constant = {name: null, description: null, id: null};
        };
    });
