'user strict'

angular.module('sdlctoolApp')
    .directive('splitArray', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel, ctrl) {
            	var field = JSON.parse(attrs.splitArray);
            	scope.$watchCollection(attr.ngModel, function ngModelWatch(value, old) {
                    if (!Array.isArray(value) || old === value) {
                        return;
                    }

                    ///copypasta from ngModelWatch()
                    var formatters = ctrl.$formatters,
                        idx = formatters.length;

                    ctrl.$modelValue = value;
                    while (idx--) {
                        value = formatters[idx](value);
                    }

                    if (ctrl.$viewValue !== value) {
                        ctrl.$viewValue = value;
                        ctrl.$render();
                    }
            	});
            	////endcopypasta
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
            }
        };
    });