'use strict';

angular.module('sdlctoolApp')
    .service('ImportAssistantState', function () {
        // Creates a new, empty state instance

        function _createState() {
            return {
                table: null,
                entities: null
            };
        }

        // The current state instance

        var _state = _createState();

        // Building the state service object.

        var stateService = {
            // Resets the global state of the import assistant back to default.

            reset: function () {
                _state = _createState();
            }
        };

        Object.defineProperty(stateService, "state", {
            get: function () {
                return _state;
            }
        });

        return stateService;
    });
