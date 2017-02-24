'use strict'

angular.module('sdlctoolApp')
	.service('EntityHelper', function() {
		function deselectElement(array) {
			angular.forEach(array, function(element) {
				element.selected = false;
			})
		}

		var returnValue = {
			'deselectElements' : deselectElement
		}

		return returnValue;
	})