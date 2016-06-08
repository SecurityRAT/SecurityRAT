'use strict';

angular.module('sdlctoolApp')
    .factory('errorHandlerInterceptor', function ($q, $rootScope, $timeout) {
        return {
            'responseError': function (response) {
//            	console.log(response);
                if (!(response.status == 401 && response.data.path !== undefined && response.data.path.indexOf("/api/account") == 0 )){
	                $rootScope.$emit('sdlctoolApp.httpError', response);
	            }
                if(0 === response.status && (response.config.url.indexOf(window.location.host) !== -1 
                		|| response.config.url.indexOf('scripts/app/') !== -1 || response.config.url.indexOf('_search') !== -1)) {
                	var appUrl  = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
        			alert('Your Session has expired. The link '+ appUrl +' will be opened in a new tab to refresh your session.');
        			var a = document.createElement("a");
        			a.href = appUrl;
					a.target = "_blank";
					document.body.appendChild(a);
					$timeout(function() {
						a.click();
					});	
        			;
            	}

                return $q.reject(response);
            }
        };
    });
