'user strict';

angular.module('sdlctoolApp')
    .directive('splitArray', function () {
		'use strict';
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
            	var field = JSON.parse(attr.splitArray);
            	//converts the view value to controller value.
            	function fromUser(values) {
            		if(!values) { return; }
            		
            		switch(field.type) {
            		case 'array':	var tempValue = values.split(',');
	            					var users = [];
	            					if(field.itemType === 'user') {
	            						for(var i = 0; i < tempValue.length; i++) {
	            							users.push(JSON.stringify({name: tempValue[i].trim()}));
	            						}
	            						return users;
	            					}
	            					break;
            		}
            	}
            	// converts the controller value to view value.
            	function toUser(valuesFromController) {
//            		console.log(valuesFromController);
            		var modelValue = [];
            		var i = 0;
            		if(angular.isUndefined(valuesFromController)) { return; }
            		
            		switch(field.type) {
            		case 'array':	if(Array.isArray(valuesFromController)) {
            							if(field.itemType === 'user') {
            								while(valuesFromController[i]) {
            									try {
            										modelValue.push(JSON.parse(valuesFromController[i]).name);
            									} catch(err) {
            										modelValue.push(valuesFromController[i].name);
            									}
            									i++;
            								}
            							
            								return modelValue.join(', ');
            							}
            						}
            						break;
            		}
            	}
            	// Validates the model and view value.
            	ngModel.$validators.validCharacters = function(modelValue, viewValue) {
            		var value = toUser(modelValue) || viewValue;
            		if(field.itemType === 'user'){
            			return /^(\w+,\s*)*\w*$/.test(value);
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
    }).directive('actionWithSelected', function() {
		'use strict';
		return {
			scope: {
				enabled: '=actionWithSelected'
			},
			restrict: 'A',
			link: function (scope, element, attrs) {
				element.bind('click', function(event) {
					if(!scope.enabled) {
						event.off();
					}
				});
			}
		};
	});