'use strict';

angular.module('sdlctoolApp')
    .service('ImportAssistantMapping', function () {
        // Generates a random 16-byte long alpha-numeric identifier that is
        // very unlikely to collide with another generated name.

        function _generateIdentifier() {
            // Client-side-generated identifiers are required to start with the
            // 'c/' prefix (to prevent them from collisions with
            // server-side-generated identifiers).

            var result = 'c/';
            
            while (result.length < 16) {
                var r = Math.floor(Math.random() * 128);
                
                if ((r > 0x2F && r < 0x3A) || // Numbers
                    (r > 0x40 && r < 0x5B) || // Uppercase
                    (r > 0x60 && r < 0x7B)) { // Lowercase
                    result += String.fromCharCode(r);
                }
            }

            return result;
        }

        return {
            // Creates a new entity mapping instance

            createEntityMapping: function () {
                return {
                    identifier: _generateIdentifier(),
                    typeIdentifier: null,
                    attributes: new Array(),
                    replaceRule: 'Ignore'
                };
            },

            // Creates a new attribute mapping instance

            createAttributeMapping: function () {
                return {
                    attributeIdentifier: null,
                    type: null,
                    keyComponent: false,

                    // Value
                    entityMappingIdentifier: null,
                    tableEntryIndex: null,
                    value: null,

                    // A JavaScript expression that calculates the attribute's
                    // value.
                    jsExpr: null,

                    // The identifier of an existing entity.
                    existingEntityIdentifier: null
                };
            },

            // Applies the specified on all 

            performMappings: function (table, mappings, entryType, ignoredEntries) {
                var result = new Array();

                // Iterating over the table and applying the mapping for each
                // entry that is not ignored.

                var entryCount = (entryType === 'row-wise')
                    ? table.rows
                    : table.columns;

                for (var index = 0; index < entryCount; index++) {
                    // Skipping ignored entries

                    if (ignoredEntries.includes(index)) {
                        continue;
                    }

                    // Getting the table entry cells

                    var cells = new Array();

                    if (entryType === 'row-wise') {
                        for (var col = 0; col < table.columns; col++) {
                            cells[col] = table.getCellValue(index, col);
                        }
                    } else {
                        for (var row = 0; row < table.rows; row++) {
                            cells[row] = table.getCellValue(row, index);
                        }
                    }

                    // This object will contain the mapped entities (value) and
                    // their mapping identifier (key).

                    var mappedInstances = new Object();

                    // Creating the single entities by their mapping.
                    //
                    // NOTE: Since mapped entities may contain references to
                    //       other mapped entities, we separate creating the
                    //       entities and mapping the attributes.

                    mappings.forEach(function (mapping) {
                        mappedInstances[mapping.identifier] = {
                            identifier: _generateIdentifier(),
                            typeIdentifier: mapping.typeIdentifier,
                            attributes: null,
                            replaceRule: mapping.replaceRule
                        };
                    });

                    mappings.forEach(function (mapping) {
                        mappedInstances[mapping.identifier].attributes =
                            mapping.attributes.map(function (attr) {
                                var result = {
                                    attributeIdentifier: attr.attributeIdentifier,
                                    keyComponent: attr.keyComponent
                                };

                                switch (attr.type) {
                                    case 'ExistingEntity':
                                        result.valueType = 'ExistingReference';
                                        result.value = attr.existingEntityIdentifier;
                                        break;

                                    case 'JavaScript':
                                        result.valueType = 'Value';

                                        // JavaScript execution should be XSS-safe here, because there is no
                                        // possibility someone could inject JavaScript code via an URL parameter.
                                        //
                                        // Also, the only one who is able to enter JavaScript expressions is the user
                                        // themselve, so they break their own browser, if the do something wrong, but
                                        // nothing else.

                                        var jsExpr = attr.jsExpr;
                                        var i = index;
                                        var e = cells;

                                        result.value = Function('i', 'e', 'return (' + jsExpr + ')').call(null, i, e);
                                        break;

                                    case 'MappedEntity':
                                        result.valueType = 'PoolReference';
                                        result.value = mappedInstances[
                                            attr.entityMappingIdentifier].identifier;
                                        break;

                                    case 'TableEntry':
                                        result.valueType = 'Value';
                                        result.value = cells[
                                            attr.tableEntryIndex];
                                        break;

                                    case 'Value':
                                        result.valueType = 'Value';
                                        result.value = attr.value;
                                        break;
                                }

                                return result;
                            });
                    });

                    // Copying the created entity instances to the result set

                    Array.prototype.push.apply(
                        result,
                        Object.values(mappedInstances));
                }

                return result;
            }
        };
    });
