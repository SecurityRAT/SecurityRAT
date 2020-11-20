'use strict';

/* jshint undef: true */
/* globals window */
angular.module('sdlctoolApp')
	.controller('EditPresentation', function ($scope, $uibModalInstance, $rootScope, $state, entity, localStorageService, Account) {
		var params = {};
		$scope.optionColumns = [];
		params.requirements = [];
		$scope.config = {};
		$scope.config.theme = 'securityrat';
		$scope.config.transition = 'concave';
		$scope.config.end = 'Thank you.';
		$scope.init = function() {
			$scope.themes = ['beige', 'black', 'blood', 'league', 'moon', 'night', 'securityrat', 'serif', 'simple', 'sky', 'solarized', 'white'];
			$scope.transitions = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];
			params.requirements = entity.requirements;
			$scope.optionColumns = entity.optionColumns;
			$scope.statusColumns = entity.statusColumns;
			$scope.config.title = entity.artifactName;
			$scope.config.description = true;
			$scope.config.optionColumns = {};
			$scope.config.statusColumns = {};
			angular.forEach($scope.optionColumns, function(optColumn) {
				$scope.config.optionColumns[optColumn.id] = true;
			});
			angular.forEach($scope.statusColumns, function(statColumn) {
				$scope.config.statusColumns[statColumn.id] = true;
			});
			Account.get().$promise.then(function(account) {
				$scope.config.presenter = account.data.firstName + ' ' + account.data.lastName; 
			});
			$scope.config.subtitle = 'Security requirements';
		};
		
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		
		/* jshint loopfunc: true */
		$scope.confirm = function() {
			params.config = $scope.config;
//			console.log(params.requirements)
			angular.forEach(params.requirements, function(requirement) {
				if(!$scope.config.description) {
					delete requirement.description;
				}
				for(var i = 0; i < requirement.optionColumns.length; i++) {
					if(!$scope.config.optionColumns[requirement.optionColumns[i].showOrder]) {
						requirement.optionColumns.splice(i, 1);
						i--;
					}
				}
				for(var j = 0; j < requirement.statusColumns.length; j++) {
					if(!$scope.config.statusColumns[requirement.statusColumns[j].id]) {
						requirement.statusColumns.splice(j, 1);
						j--;
					} else {
						angular.forEach($scope.statusColumns, function(stat) {
							if(requirement.statusColumns[j].id === stat.id) {
								requirement.statusColumns[j].name = stat.name;
							}
						});
					}
				}
			});
			if (localStorageService.isSupported) {
				localStorageService.set('myRevealjs', JSON.stringify(params));
				window.open($state.href('presentation', {theme: $scope.config.theme + '.css'}), '_blank');
			}
			$uibModalInstance.close('closed');
		};
	});