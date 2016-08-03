'use strict';

angular.module('sdlctoolApp')
    .factory('Util', function type($q) {
    	var util = {}
         util.get = function() {
        	 var derefferer = $q.defer();
        	 $.get('api/authenticationType', function(data) {
        		 derefferer.resolve(data);
        	 })
        	 .fail(function() {
        		 derefferer.reject('error');
        	 });
        	 return derefferer.promise
        	 }
    	return util
    });
