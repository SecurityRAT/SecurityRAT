'use strict';

/* jshint undef: true */
/* globals $ */

angular.module('sdlctoolApp')
    .controller('OptColumnTypeController', function ($scope, OptColumnType) {
        $scope.optColumnTypes = [];
	$scope.searchString = '';
        $scope.loadAll = function() {
            OptColumnType.query(function(result) {
               $scope.optColumnTypes = result;
            });
        };
        $scope.loadAll();

        $scope.delete = function (id) {
            OptColumnType.get({id: id}, function(result) {
                $scope.optColumnType = result;
                $('#deleteOptColumnTypeConfirmation').appendTo("body").modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            OptColumnType.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteOptColumnTypeConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.optColumnType = {name: null, description: null, id: null};
        };
    });
