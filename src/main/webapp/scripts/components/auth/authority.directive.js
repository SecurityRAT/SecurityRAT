'use strict';

angular.module('sdlctoolApp')
    .directive('hasAnyRole', ['Principal', function (Principal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var setVisible = function () {
                        element.removeClass('hidden');
                    },
                    setHidden = function () {
                		element.addClass('hidden');
                    },
                    defineVisibility = function (reset) {
                        var result;
                        if (reset) {
                            setVisible();
                        }
                        if(Principal.isAuthenticated()) {
	                        Principal.identity().then(function(_id) {
	                        	setHidden();
	                        	for(var i = 0; i < roles.length; i++) {
	                        		if(_id.roles && _id.roles.indexOf(roles[i]) >= 0) {
	                        			setVisible();
	                        		}
	                        	}
	                        })
                        } else setHidden();
                    },
                    roles = attrs.hasAnyRole.replace(/\s+/g, '').split(',');

                if (roles.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }])
    .directive('hasRole', ['Principal', function (Principal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var setVisible = function () {
                        element.removeClass('hidden');
                    },
                    setHidden = function () {
                        element.addClass('hidden');
                    },
                    defineVisibility = function (reset) {

                        if (reset) {
                            setVisible();
                        }
                        
                        Principal.isInRole(role).then(function(result) {
                                if (result) {
                                    setVisible();
                                } else {
                                    setHidden();
                                }
                            });
                    },
                    role = attrs.hasRole.replace(/\s+/g, '');

                if (role.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }]);
