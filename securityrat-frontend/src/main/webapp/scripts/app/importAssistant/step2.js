'use strict';

angular.module('sdlctoolApp')
    .controller('ImportAssistantStep2Controller', function ($scope, $state, $uibModal, ImportAssistantState, ImportAssistantTable, ImportAssistantMapping, ImportAssistantHttp) {
        // Checking, if the global state of the import assistant has a table
        // reference. This is required for this step.

        if (!ImportAssistantState.state.table) {
            $state.go('importAssistantStep1');
            return;
        }

        // Short access to the selected table

        var _table = ImportAssistantState.state.table;

        // The indices of the ignored table entries

        var _ignoredTableEntries = new Array();

        // General settings

        $scope.generalSettings = {
            selectedEntryType: 'row-wise'
        };

        Object.defineProperty($scope.generalSettings, "ignoredTableEntries", {
            get: function () {
                var labels;

                switch ($scope.generalSettings.selectedEntryType) {
                    case 'row-wise':
                        labels = _ignoredTableEntries.map(
                            ImportAssistantTable.ExcelUtil.indexToRow);
                        break;

                    case 'column-wise':
                        labels = _ignoredTableEntries.map(
                            ImportAssistantTable.ExcelUtil.indexToColumn);
                        break;
                }

                return labels.join(', ');
            },
            set: function (value) {
                // Separating the single entries, parsing the indices, sorting
                // out invalid values

                var indices = value.split(',')
                    .map(function (entry) {
                        entry = entry.trim();

                        try {
                            switch ($scope.generalSettings.selectedEntryType) {
                                case 'row-wise':
                                    return ImportAssistantTable.ExcelUtil.rowToIndex(entry);

                                case 'column-wise':
                                    return ImportAssistantTable.ExcelUtil.columnToIndex(entry);
                            }
                        } catch (e) { }

                        return null;
                    })
                    .filter(function (entry) {
                        return entry !== null;
                    });

                // Removing duplicates and storing the result

                _ignoredTableEntries = indices.reduce(
                    function (total, currentValue) {
                        if (!total.includes(currentValue)) {
                            total.push(currentValue);
                        }

                        return total;
                    },
                    new Array());
            }
        });

        // Grid View

        $scope.gridView = {
            // Static data

            columnHeaders: new Array(_table.columns)
                .fill(0)
                .map(function (value, index) {
                    return ImportAssistantTable.ExcelUtil.indexToColumn(index);
                }),

            rowHeaders: new Array(_table.rows)
                .fill(0)
                .map(function (value, index) {
                    return ImportAssistantTable.ExcelUtil.indexToRow(index);
                }),

            // Functions

            getCellValue: function (row, column) {
                return _table.getCellValue(row, column);
            }
        };

        // Mapping Box

        $scope.mappingBox = {
            // Created mappings

            mappings: new Array(),

            getEntityMappingTitle: function (entityMapping) {
                var entityType = $scope.mappingBox.editor.availableTypes.find(
                    function (type) {
                        return type.identifier === entityMapping.typeIdentifier;
                    });

                return entityType.displayName
                    + ' ('
                    + entityMapping.identifier
                    + ')';
            },
            
            getEntityTypeAttribute: function (entityTypeIdentifier, attributeIdentifier) {
                return $scope.mappingBox.editor.availableTypes.find(function (type) {
                    return type.identifier === entityTypeIdentifier
                }).attributes.find(function (attr) {
                    return attr.identifier === attributeIdentifier;
                })
            },
            
            getEntityMapping: function (entityMappingIdentifier) {
                return $scope.mappingBox.mappings.find(function (mapping) {
                    return mapping.identifier === entityMappingIdentifier;
                });
            },
            
            getTableEntryName: function (index) {
                switch ($scope.generalSettings.selectedEntryType) {
                    case 'row-wise':
                        return $scope.gridView.columnHeaders[index];

                    case 'column-wise':
                        return $scope.gridView.rowHeaders[index];
                }
            },
            
            removeButton: {
                handleClick: function (entityMapping) {
                    $scope.mappingBox.mappings.splice(
                        $scope.mappingBox.mappings.indexOf(entityMapping),
                        1);
                }
            },

            // Mapping editor

            editor: {
                mapping: ImportAssistantMapping.createEntityMapping(),
                availableTypes: new Array(),

                addButton: {
                    handleClick: function () {
                        // Pushing the current mapping and creating a new
                        // instance

                        $scope.mappingBox.mappings.push(
                            $scope.mappingBox.editor.mapping);

                        $scope.mappingBox.editor.mapping =
                            ImportAssistantMapping.createEntityMapping();
                    }
                },

                attributes: {
                    removeButton: {
                        handleClick: function (attributeMapping) {
                            // Just removing the entry from the attribute
                            // mappings of the current entity mapping

                            $scope.mappingBox.editor.mapping.attributes.splice(
                                $scope.mappingBox.editor.mapping.attributes.indexOf(attributeMapping),
                                1);
                        }
                    },
                    
                    addButton: {
                        handleClick: function () {
                            $scope.mappingBox.editor.mapping.attributes.push(
                                ImportAssistantMapping.createAttributeMapping());
                        }
                    },

                    chooseEntityButton: {
                        handleClick: function (attributeMapping) {
                            $uibModal.open({
                                templateUrl: 'scripts/app/importAssistant/entityChooser.html',
                                controller: 'ImportAssistantEntityChooser',
                                size: 'lg',
                                resolve: {
                                    typeIdentifier: function () {
                                        return $scope.mappingBox.editor.attributes.getType(attributeMapping).type.referenceIdentifier;
                                    }
                                }
                            }).result.then(function (entity) {
                                attributeMapping.existingEntityIdentifier = entity.identifier
                            });
                        }
                    },

                    getType: function (attributeMapping) {
                        var entityType = $scope.mappingBox.editor.selectedEntityType;

                        if (!entityType) {
                            return;
                        }

                        return entityType.attributes.find(function (attr) {
                            return attr.identifier === attributeMapping.attributeIdentifier;
                        });
                    },

                    getEntityMappings: function (entityTypeIdentifier) {
                        return $scope.mappingBox.mappings.filter(
                            function (entityType) {
                                return entityType.typeIdentifier === entityTypeIdentifier;
                            });
                    }
                }
            }
        };

        Object.defineProperty($scope.mappingBox.editor, "selectedEntityType", {
            get: function () {
                if (!$scope.mappingBox.editor.mapping.typeIdentifier) {
                    return null;
                }

                return $scope.mappingBox.editor.availableTypes.find(
                    function (value) {
                        return value.identifier === $scope.mappingBox.editor.mapping.typeIdentifier;
                    });
            }
        });

        Object.defineProperty(
            $scope.mappingBox.editor.attributes,
            "tableEntries",
            {
                get: function () {
                    switch ($scope.generalSettings.selectedEntryType) {
                        case 'row-wise':
                            return $scope.gridView.columnHeaders;

                        case 'column-wise':
                            return $scope.gridView.rowHeaders;
                    }
                }
            });

        Object.defineProperty($scope.mappingBox.editor, "replaceRules", {
            value: [ 'Duplicate', 'Ignore', 'Replace' ],
            writable: false
        });

        Object.defineProperty($scope.mappingBox.editor.addButton, "enabled", {
            get: function () {
                // Adding an entity mapping is only allowed, if:
                //
                // - An entity type has been selected
                // - A replace rule has been selected
                // - There are no incomplete attributes

                if (!$scope.mappingBox.editor.mapping.typeIdentifier) {
                    return false;
                }

                if (!$scope.mappingBox.editor.mapping.replaceRule) {
                    return false;
                }

                return $scope.mappingBox.editor.mapping.attributes.every(
                    function (attr) {
                        if (!attr.attributeIdentifier) {
                            return false;
                        }

                        if (!attr.type) {
                            return false;
                        }
                        
                        // Validation depending on the type

                        switch (attr.type) {
                            case 'ExistingEntity':
                                if (!attr.existingEntityIdentifier) {
                                    return false;
                                }
                                break;

                            case 'JavaScript':
                                if (!attr.jsExpr) {
                                    return false;
                                }
                                break;

                            case 'MappedEntity':
                                if (!attr.entityMappingIdentifier) {
                                    return false;
                                }
                                break;

                            case 'TableEntry':
                                if (!attr.tableEntryIndex) {
                                    return false;
                                }
                                break;

                            case 'Value':
                                if (!attr.value) {
                                    return false;
                                }
                                break;
                        }

                        return true;
                    });
            }
        });

        // Navigation

        $scope.navigation = {
            cancelButton: {
                handleClick: function () {
                    ImportAssistantState.reset();
                    $state.go('editor');
                }
            },

            continueButton: {
                handleClick: function () {
                    // Perform the mapping

                    var entities = ImportAssistantMapping.performMappings(
                        _table,
                        $scope.mappingBox.mappings,
                        $scope.generalSettings.selectedEntryType,
                        _ignoredTableEntries);

                    // Continue

                    ImportAssistantState.state.entities = entities;
                    $state.go('importAssistantStep3');
                }
            }
        };

        // Initializing the grid view navigation elements after the page has
        // been initialized

        angular.element(document).ready(function () {
            $('#grid-view').DataTable({
                scrollX: true,
                scrollY: true,
                pageLength: 3,
                lengthMenu: [ 1, 2, 3, 5, 10, 20, 50 ]
            });
        });

        // Requesting the available entity types from the server

        ImportAssistantHttp.getTypes()
            .then(function (types) {
                Array.prototype.push.apply(
                    $scope.mappingBox.editor.availableTypes,
                    types);

                // Sorting the types by their displayName alphabetically

                $scope.mappingBox.editor.availableTypes.sort(
                    function (a, b) {
                        if (a.displayName > b.displayName) {
                            return 1;
                        }

                        if (a.displayName === b.displayName) {
                            return 0;
                        }

                        return -1;
                    });
            });
    });
