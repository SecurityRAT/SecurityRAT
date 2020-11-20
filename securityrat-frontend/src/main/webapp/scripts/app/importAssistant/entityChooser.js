'use strict';

angular.module('sdlctoolApp')
    .controller('ImportAssistantEntityChooser', function ($scope, $stateParams, $uibModalInstance, ImportAssistantHttp, typeIdentifier) {
        var _attributeNames = new Array();
        var _existingEntities = new Array();

        $scope.getAttributeValue = function (entity, attrName) {
            return entity.attributes.find(function (attr) {
                return attr.attributeIdentifier === attrName;
            }).value;
        };

        $scope.navigation = {
            closeButton: {
                handleClick: function () {
                    $uibModalInstance.dismiss('cancel');
                }
            },

            selectButton: {
                handleClick: function (entity) {
                    $uibModalInstance.close(entity);
                }
            }
        };

        Object.defineProperty($scope, "attributeNames", {
            get: function() {
                return _attributeNames;
            }
        });

        Object.defineProperty($scope, "existingEntities", {
            get: function () {
                return _existingEntities
            }
        });

        ImportAssistantHttp.getInstances(typeIdentifier)
            .then(function (result) {
                // Copying the result set to the list that will be used for
                    // drawing the user interface.

                    Array.prototype.push.apply(_existingEntities, result);

                    // Filtering for the column titles

                    _existingEntities.forEach(function (entity) {
                        entity.attributes.forEach(function (attr) {
                            if (_attributeNames.indexOf(attr.attributeIdentifier) >= 0) {
                                return;
                            }

                            _attributeNames.push(attr.attributeIdentifier);
                        });
                    });
            });
    });
