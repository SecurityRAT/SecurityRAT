'user strict'

angular.module('sdlctoolApp')
    .directive('splitArray', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs) {
            	var itemType = attrs.splitArray;
            	
            	function fromUser(commaSeparatedValues) {
            		if(!commaSeparatedValues)
            			return;
            		var tempValue = commaSeparatedValues.split(',');
            		var users = [];
            		
            		for(var i = 0; i < tempValue; i++) {
            			users.push({
            				name: tempValue[i].trim() 
            			});
        			}
            		if(itemType === 'user') {
            			console.log(users)
            			return users;
            		}
            			
            	}   
            	
            	function toUser(valuesFromController) {
            		var modelValue = [];
            		if(Array.isArray(valuesFromController)) {
	            		if(itemType === 'user') {
	            			var reference = angular.forEach(valuesFromController, function(user) {
	            								modelValue.push(user.name);
	            							});
	            			console.log(reference);
	            			console.log(modelValue);
	            			return modelValue;
	            		}
            		}
            	}
            	
            	ngModel.$parsers.push(fromUser);
                ngModel.$formatters.push(toUser);
            }
        };
    });