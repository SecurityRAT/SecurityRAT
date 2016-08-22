'user strict'

angular.module('sdlctoolApp')
    .directive('splitArray', function () {
        return {
            restrict: 'A',
            require: 'ngModel'
            link: function (scope, element, attrs) {
            	var itemType = attrs.splitArray;
            	
            	function fromUser(commaSeparatedValues) {
            		var tempValue = commaSeparatedValues.split(',');
            		for(var i = 0; i < tempValue; i++) {
            			tempValue[i] = tempValue[i].trim(); 
        			}
            		if(itemType === 'string') {
            			return tempValue;
            		}
            			
            	}   
            	
            	function toUser(array) {
            		if(itemType === 'string') {
            			return array.join(', ');
            		}
            	}
            	
            	ngModel.$parsers.push(fromUser);
                ngModel.$formatters.push(toUser);
            }
        };
    });