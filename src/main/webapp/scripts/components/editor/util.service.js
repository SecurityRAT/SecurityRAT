'use strict';

angular.module('sdlctoolApp')
    .factory('Helper', function Auth() {
        return {
        	searchArrayByValue : function(search, object) {
            	var bool = false;
            	angular.forEach(object, function(obj) {
            		angular.forEach(obj, function(value, key) {
            			if(value === search){
            				bool = true;
            			}
            		});
            	});
            	return bool;
            },
	        removeMarkdown : function(changedContent, controller) {
	        	// console.log(changedContent);
	        	switch(controller) {
	        	case "export":	changedContent = changedContent.replace(/(\*)/g, "");
	        					changedContent = changedContent.replace(/(\s+-\s)/g, "\n");
								changedContent = changedContent.replace(/(-\s)/g, "");
								changedContent = changedContent.replace(/(\s+1\.\s)/g, "\n");
								changedContent = changedContent.replace(/(1\.\s)/g, "");
								changedContent = changedContent.replace(/#/g, "");
								changedContent = changedContent.replace(/`/g, "");
								changedContent = changedContent.replace(/([\[]\S+[\]])/g, "");
								changedContent = changedContent.replace(/(mailto:)/g, "");
								changedContent = changedContent.replace(/([\n])+/g, "\n");
								break;
				default:	changedContent = changedContent.replace(/(\*\s)/g, "- ");
							changedContent = changedContent.replace(/(\*)/g, "");
							changedContent = changedContent.replace(/(1\.\s)/g, "- ");
							changedContent = changedContent.replace(/#/g, "");
							changedContent = changedContent.replace(/`/g, "");
							changedContent = changedContent.replace(/(\s{3,})/g, "\n");
							changedContent = changedContent.replace(/([\[]\S+[\]])/g, "");
							changedContent = changedContent.replace(/(mailto:)/g, "");
							break;
	        	}
				return changedContent;
	        },
	        buildJiraUrl: function(list) {
				var apiUrl = {};
				apiUrl.ticketKey = [];
				apiUrl.path = [];
				var hostSet = false;
				for(var i = 0; i < list.length; i++) {
					if(angular.equals(list[i], "")) {
						list.splice(i, 1);
						i--;
					}
					else if(urlpattern.http.test(list[i])) {
					//else if((list[i].indexOf("https:") > -1) || (list[i].indexOf("http:") > -1)) {
						angular.extend(apiUrl, {http: list[i]});
					}
					else if(urlpattern.host.test(list[i]) && !hostSet) {
					//else if(list[i].indexOf(".") > -1) 
						hostSet = true;
						angular.extend(apiUrl, {host: list[i]});
					} else if(list[i].indexOf("-") > -1) {
						apiUrl.ticketKey.push(list[i]); 
//						angular.extend($scope.apiUrl, {ticketKey: list[i]});
					} else if(i < (list.length - 1)){
						apiUrl.path.push(list[i]);
					}
				}
				var listSize = list.length;
				var lastElement = list.pop();
				//gets the project key.
				if(angular.isUndefined(apiUrl.projectKey)  && (listSize >= 4)) {
					if(lastElement.indexOf("-") >= 0) {
						angular.extend(apiUrl, {projectKey : lastElement.slice(0, lastElement.indexOf("-"))})
					} else {
						angular.extend(apiUrl, {projectKey : lastElement});
					}
				}
				apiUrl.cachedUrl = apiUrl.http + "//" + apiUrl.host + "/";
				for(var i = 0; i < apiUrl.path.length; i++){
					apiUrl.cachedUrl += apiUrl.path[i] + "/";
				}
				return apiUrl;
			}
        };
    });
