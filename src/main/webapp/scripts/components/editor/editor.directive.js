'user strict'

angular.module('sdlctoolApp')
    .directive('splitArray', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
            	var field = JSON.parse(attrs.splitArray);
            	
            	function fromUser(commaSeparatedValues) {
            		if(!commaSeparatedValues)
            			return;
            		var tempValue = commaSeparatedValues.split(',');
            		var users = [];
            		if(field.itemType === 'user') {
	            		for(var i = 0; i < tempValue.length; i++) {
	            			users.push({
	            				name: tempValue[i].trim() 
	            			});
	        			}
            			console.log(users)
            			return users;
            		}
            	}   
            	function toUser(valuesFromController) {
            		var modelValue = [];
            		var i = 0;
            		if(Array.isArray(valuesFromController)) {
	            		if(field.itemType === 'user') {
	            			while(valuesFromController[i]) {
	            				modelValue.push(valuesFromController[i].name);
	            				i++;
	            			}
	            			console.log(modelValue);
	            			return modelValue.join(', ');
	            		}
            		}
            	}
            	ngModel.$validators.validCharacters = function(modelValue, viewValue) {
            		  if(field.itemType === 'user'){
            			  var value = toUser(modelValue) || viewValue;
            			  return /^(\w+,\s*)*\w*$/.test(value);
            		  }
            		  return false;
            	};
            	ngModel.$parsers.push(fromUser);
            	ngModel.$formatters.push(toUser);
            	
            	scope.$watchCollection(scope.fields[field.key], function ngModelWatch(value, old) {
                    if (!Array.isArray(value) || angular.equals(old, value)) {
                        return;
                    }

                    ///copypasta from ngModelWatch()
                    var formatters = ngModel.$formatters,
                        idx = formatters.length;

                    ngModel.$modelValue = value;
                    while (idx--) {
                        value = formatters[idx](value);
                    }

                    if (ngModel.$viewValue !== value) {
                    	ngModel.$viewValue = value;
                    	ngModel.$render();
                    }
            	});
            	////endcopypasta
            	
            	
            	
            }
        };
    });