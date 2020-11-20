'use strict'

angular.module('sdlctoolApp')
	.service('EntityHelper', function() {
		
		function deselectElement(array) {
			angular.forEach(array, function(element) {
				element.selected = false;
			})
		}

		function performSelection(selectionValue, onSelectionCallback, offSelectionCallback) {
			if(selectionValue)
				onSelectionCallback();
			else
				offSelectionCallback();
		}

		var returnValue = {
			'deselectElements' : deselectElement,
			'performSelection' : performSelection
		}

		return returnValue;
	})