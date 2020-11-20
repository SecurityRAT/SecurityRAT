'use strict';

/* jshint undef: true */
/* globals $ */

angular.module('sdlctoolApp')
    .controller('AlternativeInstanceController', function ($scope, AlternativeInstance, AlternativeInstanceSearch,
        AlternativeSet, sharedProperties, $filter, marked, EntityHelper) {
        $scope.alternativeInstances = [];
        $scope.alternativeSets = [];
        $scope.selectedAlternativeSets = [];
        $scope.searchString = '';
        $scope.setLabelText = {buttonDefaultText: 'Alternative Set'};
        $scope.selectedSetSettings = {
  			  smartButtonMaxItems: 2,
  			  showCheckAll: false, showUncheckAll: false,
  			  displayProp: 'name', idProp: 'id', externalIdProp: ''
  	    };

        $scope.loadAll = function() {
            AlternativeInstance.query(function(result) {
               $scope.alternativeInstances = result;
               angular.forEach($scope.alternativeInstances, function(instance) {
//            	   instance.content = marked(instance.content);
            	   angular.extend(instance, {selected: false});
               });
            });
            AlternativeSet.query(function(result) {
            	$scope.alternativeSets = result;
            });

        };
        $scope.loadAll();

        $scope.delete = function (id) {
            AlternativeInstance.get({id: id}, function(result) {
                $scope.alternativeInstance = result;
                $('#deleteAlternativeInstanceConfirmation').appendTo('body').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            AlternativeInstance.delete({id: id},
                function () {
                    $scope.loadAll();
                    $('#deleteAlternativeInstanceConfirmation').modal('hide');
                    $scope.clear();
                });
        };

        $scope.filterEntity = function() {
            var instancesFilterByAlternativeSet = $filter('filterCategoryForEntities')($scope.alternativeInstances, $scope.selectedAlternativeSets, 'alternativeSet');
            instancesFilterByAlternativeSet = $filter('filter')(instancesFilterByAlternativeSet, $scope.searchString);
            return instancesFilterByAlternativeSet;
        };

        function selectAllTypes () {
    		  angular.forEach($scope.filterEntity(), function(instance) {
    			  instance.selected = true;
    		  });
  	  	}

        function deselectAllTypes () {
            EntityHelper.deselectElements($filter('filter')($scope.filterEntity(), {selected: true}));
        }

        $scope.performSelection = function(selectionValue) {
            EntityHelper.performSelection(selectionValue, selectAllTypes, deselectAllTypes);
        };

        $scope.bulkChange = function() {
          	sharedProperties.setProperty($filter('orderBy')($filter('filter')($scope.alternativeInstances, {selected: true}), ['alternativeSet.showOrder','requirementSkeleton.reqCategory.showOrder', 'requirementSkeleton.showOrder']));
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.alternativeInstance = {content: null, id: null};
        };
    });
