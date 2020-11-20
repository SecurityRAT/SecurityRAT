'use strict';

angular.module('sdlctoolApp')
    .controller('ImportAssistantStep3Controller', function ($scope, $state, ImportAssistantState, ImportAssistantHttp) {
        // Checking, if the global state of the import assistant provides
        // mapped entities. This is required for this step.

        if (!ImportAssistantState.state.entities) {
            $state.go('importAssistantStep1');
            return;
        }

        // Shortcut to the entities

        var _entities = ImportAssistantState.state.entities;

        // The table views
        //
        // Each view consists of the following attributes:
        //  - entities: Array<FrontendObjectDto>
        //  - typeIdentifier: string
        //  - attributes: Array<string>

        $scope.tableViews = _entities.reduce(
            function (accumulator, currentValue) {
                // Checking, if the array contains already an entry for the
                // current typeIdentifier

                var tableView = accumulator.find(function (val) {
                    return val.typeIdentifier === currentValue.typeIdentifier;
                });

                // Creating the tableView instance, if necessary

                if (!tableView) {
                    tableView = {
                        entities: new Array(),
                        typeIdentifier: currentValue.typeIdentifier,
                        attributes: new Array()
                    };

                    accumulator.push(tableView);
                }

                // Adding our own instance

                tableView.entities.push(currentValue);

                for (var attrIndex = 0; attrIndex < currentValue.attributes.length; attrIndex++) {
                    var attrName = currentValue.attributes[attrIndex].attributeIdentifier;

                    if (tableView.attributes.includes(attrName)) {
                        continue;
                    }

                    tableView.attributes.push(attrName);
                }

                return accumulator;
            }, new Array());

        $scope.getAttribute = function (entity, attributeIdentifier) {
            return entity.attributes.find(function (attr) {
                return attr.attributeIdentifier === attributeIdentifier
            });
        };

        // Navigation

        $scope.navigation = {
            cancelButton: {
                handleClick: function () {
                    ImportAssistantState.reset();
                    $state.go('editor');
                }
            },

            applyButton: {
                handleClick: function () {
                    ImportAssistantHttp.apply(_entities);
                    $state.go('editor');
                }
            }
        };
    });
