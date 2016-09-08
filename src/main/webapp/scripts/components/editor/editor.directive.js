'user strict'

angular.module('sdlctoolApp')
    .directive('splitArray', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
            	var field = JSON.parse(attr.splitArray);
            	//converts the view value to controller value.
            	function fromUser(values) {
            		if(!values)
						return;
            		switch(field.type) {
            		case 'array':	var tempValue = commaSeparatedValues.split(',');
	            					var users = [];
	            					if(field.itemType === 'user') {
	            						for(var i = 0; i < tempValue.length; i++) {
	            							users.push(JSON.stringify({name: tempValue[i].trim()}));
	            						}
	            						return users;
	            					}
	            					break;
            		case 'user':	var user = {
            							name: values
            						}
            						return JSON.stringify(user);
            						break;
            		}
            	}
            	// converts the controller value to view value.
            	function toUser(valuesFromController) {
            		var modelValue = [];
            		var i = 0;
            		switch(field.type) {
            		case 'array':	if(Array.isArray(valuesFromController)) {
            							if(field.itemType === 'user') {
            								while(valuesFromController[i]) {
            									modelValue.push(JSON.parse(valuesFromController[i]).name);
            									i++;
            								}
            							
            								return modelValue.join(', ');
            							}
            						}
            						break;
            		case 'user':	return JSON.parse(valuesFromController).name;
            						break;
            		}
            	}
            	// Validates the model and view value.
            	ngModel.$validators.validCharacters = function(modelValue, viewValue) {
            		var value = toUser(modelValue) || viewValue;
            		if(field.itemType === 'user'){
            			return /^(\w+,\s*)*\w*$/.test(value);
            		} else if (field.type === 'user') {
            			return /^[a-z0-9]*$/.test(value);
            		}
            		return false;
            	};
            	// populate the parsing and formatting value to the properties.
            	ngModel.$parsers.push(fromUser);
            	ngModel.$formatters.push(toUser);
            	
            	scope.$watchCollection(attr.ngModel, function ngModelWatch(value, old) {
                    if (old === value) {
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