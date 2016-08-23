'user strict'

angular.module('sdlctoolApp')
    .directive('splitArray', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs) {
            	console.log("attrs");
            	console.log(attrs.splitArray);
            	var field = JSON.parse(attrs.splitArray);
            	console.log("field");
            	console.log(field);
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
            		if(field.itemType === 'user') {
            			console.log(users)
            			return users;
            		}
            			
            	}   
            	
            	function toUser(valuesFromController) {
            		var modelValue = [];
            		if(Array.isArray(valuesFromController)) {
	            		if(field.itemType === 'user') {
	            			var reference = angular.forEach(valuesFromController, function(user) {
	            								modelValue.push(user.name);
	            							});
	            			console.log(reference);
	            			console.log(modelValue);
	            			return modelValue;
	            		}
            		}
            	}
            	
            	scope.fields[field.key].$parsers.push(fromUser);
            	scope.fields[field.key].$formatters.push(toUser);
            }
        };
    });