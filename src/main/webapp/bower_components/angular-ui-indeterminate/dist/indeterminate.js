/*!
 * angular-ui-indeterminate
 * https://github.com/angular-ui/ui-indeterminate
 * Version: 1.0.0 - 2015-06-30T09:28:55.152Z
 * License: MIT
 */


(function () { 
'use strict';
/**
 * Provides an easy way to toggle a checkboxes indeterminate property
 *
 * @example <input type="checkbox" ui-indeterminate="isUnkown">
 */
angular.module('ui.indeterminate', []).directive('uiIndeterminate', [
    function() {

        return {
            compile: function(tElm, tAttrs) {
                if (!tAttrs.type || tAttrs.type.toLowerCase() !== 'checkbox') {
                    return angular.noop;
                }

                return function($scope, elm, attrs) {
                    $scope.$watch(attrs.uiIndeterminate, function(newVal) {
                        elm[0].indeterminate = !!newVal;
                    });
                };
            }
        };
    }]);

}());