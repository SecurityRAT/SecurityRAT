/*!
 * angular-ui-indeterminate
 * https://github.com/angular-ui/ui-indeterminate
 * Version: 1.0.0 - 2015-06-30T09:28:55.152Z
 * License: MIT
 */
!function(){"use strict";angular.module("ui.indeterminate",[]).directive("uiIndeterminate",[function(){return{compile:function(e,n){return n.type&&"checkbox"===n.type.toLowerCase()?function(e,n,t){e.$watch(t.uiIndeterminate,function(e){n[0].indeterminate=!!e})}:angular.noop}}}])}();