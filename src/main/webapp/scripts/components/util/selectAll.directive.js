'use strict'


angular.module('sdlctoolApp')
		.directive('selectAll', function($filter) {
			return {
				restrict: 'E',
				transclude: true,
				scope: {
					performSelection: '&onChange', // the callback function on value change
					filterLength: '@',
					selectedLength: '@'
				},
				// expose parametized functions are called in the template with a expression wrapper in the form function({param1: value-to-pass})
				template: '<input type="checkbox" id="selectAll" data-ng-model="selection.value" '+
				'ui-indeterminate="selection.indeterminate" data-ng-change="performSelection({selectionValue: selection.value})">',
				link: function(scope, element, attributes) {
					// scope.selection = {value: false, indeterminate: false}

					function determineState() {
						scope.selection = {value: false, indeterminate: false}
						if(scope.filterLength > 0) {
							if(scope.selectedLength == scope.filterLength) {
								scope.selection.value = true;
							} else if(scope.selectedLength > 0 && scope.selectedLength != scope.filterLength) {
								scope.selection.indeterminate = true;
							}
						}
					}
					// watch the view changes and determines the state of the selectAll checkbox.
					// The watch only work because it's in an isolate scope, therefore filterLength is part of the scope
					scope.$watch('filterLength', function(value) {
						determineState();
					})

					scope.$watch('selectedLength', function(value) {
						determineState();
					})
				}
			}
		})