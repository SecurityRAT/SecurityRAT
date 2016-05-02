/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name disableAll
     * @description
     * This module represents a disable-all directive which allows you to disable any element in the DOM.
     */
    angular.module('disableAll', []);
    
    /**
     * @ngdoc directive
     * @name doNotDisable
     * @restrict A
     * @description
     * This directive allows you to do not disable the element even if it's under the disableAll directive
     */
    angular.module('disableAll').directive('skipDisable', skipDisableDirective);
    
    /**
     * @ngInject
     */
    function skipDisableDirective() {
        return {
            restrict: 'A'
        };
    }


    /**
     * @ngdoc directive
     * @name disableAll
     * @restrict A
     * @description
     * This directive allows you to disable any element in the DOM. Directive turns off all clicks, disables
     * inputs, buttons and textareas in the given element scope.
     */
    angular.module('disableAll').directive('disableAll', disableAllDirective);
    
    /**
     * @ngInject
     */
    function disableAllDirective() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var disabledElement = (attrs.disableElementId) ? document.getElementById(attrs.disableElementId) : element[0];

                scope.$watch(attrs.disableAll, function (isDisabled) {
                    if (isDisabled)
                        disableAll(disabledElement);
                    else
                        enableAll(disabledElement);
                });

                scope.$on('$destroy', function() {
                    enableAll(disabledElement);
                });
            }
        };
    }

    /**
     * Disables everything in the given element.
     *
     * @param {HTMLElement} element
     */
    var disableAll = function(element) {
        angular.element(element).addClass('disable-all');
        element.style.color = 'gray';
        disableElements(element.getElementsByTagName('input'));
        disableElements(element.getElementsByTagName('button'));
        disableElements(element.getElementsByTagName('textarea'));
        disableElements(element.getElementsByTagName('select'));
        element.addEventListener('click', preventDefault, true);
    };

    /**
     * Enables everything in the given element.
     *
     * @param {HTMLElement} element
     */
    var enableAll = function(element) {
        angular.element(element).removeClass('disable-all');
        element.style.color = 'inherit';
        enableElements(element.getElementsByTagName('input'));
        enableElements(element.getElementsByTagName('button'));
        enableElements(element.getElementsByTagName('textarea'));
        enableElements(element.getElementsByTagName('select'));
        element.removeEventListener('click', preventDefault, true);
    };

    /**
     * Callback used to prevent user clicks.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    var preventDefault = function(event) {
        for (var i = 0; i < event.target.attributes.length; i++) {
            var atts = event.target.attributes[i];
            if(atts.name === "skip-disable"){
                return true;
            }
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    };

    /**
     * Disables given elements.
     *
     * @param {Array.<HTMLElement>|NodeList} elements List of dom elements that must be disabled
     */
    var disableElements = function(elements) {
        var len = elements.length;
        for (var i = 0; i < len; i++) {
            var shouldDisable = true;
            for (var j = 0; j < elements[i].attributes.length; j++) {
                var atts = elements[i].attributes[j];
                if(atts.name === "skip-disable"){
                    shouldDisable = false;
                    continue;
                }
            }
            if (shouldDisable && elements[i].disabled === false) {
                elements[i].disabled = true;
                elements[i].disabledIf = true;
            }
        }
    };

    /**
     * Enables given elements.
     *
     * @param {Array.<HTMLElement>|NodeList} elements List of dom elements that must be enabled
     */
    var enableElements = function(elements) {
        var len = elements.length;
        for (var i = 0; i < len; i++) {
            if (elements[i].disabled === true && elements[i].disabledIf === true) {
                elements[i].disabled = false;
                elements[i].disabledIf = null;
            }
        }
    };

})();
