'use strict';

angular.module('sdlctoolApp')
    .factory('errorHandlerInterceptor', function ($q, $rootScope, $timeout) {
        return {
            'responseError': function (response) {
            	var restApi = ['frontend-api/', 'api/', 'admin-api/', "script/app"];
            	function filterUrl(value) {
            		return response.config.url.startsWith(value);
            	}
                if (!(response.status == 401 && response.data.path !== undefined && response.data.path.indexOf("/api/account") == 0 )){
	                $rootScope.$emit('sdlctoolApp.httpError', response);
	            }
                if(response.status === -1 && response.data === null && 
                    ((restApi.filter(filterUrl).length > 0) || (response.config.url.indexOf(window.location.host) !== -1))) {
                	if(document.getElementById("redirect") === null) {
	                	var appUrl  = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
	        			alert('Your Session has expired. The link '+ appUrl +' will be opened in a new tab to refresh your session.');
	        			var a = document.createElement("a");
	        			a.id = "redirect";
	        			a.href = appUrl;
						a.target = "_blank";
						document.body.appendChild(a);
						$timeout(function() {
							a.click();
						});
                	}
            	}

                return $q.reject(response);
            }
        };
    });
