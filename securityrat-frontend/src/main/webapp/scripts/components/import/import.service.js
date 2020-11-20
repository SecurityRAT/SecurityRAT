'use strict';

var IMPORT_STATE_SOURCE_SELECTION = 0;
var IMPORT_STATE_MAPPING_BUILDER = 1;
var IMPORT_STATE_FINALIZATION = 2;

angular.module('sdlctoolApp')
    .service('Import', function ($http, $q, ExcelHelper) {
        // Attributes of the _state object:
        //
        // - sourceData: A SourceData object.
        // - entryType: enum(column, row); Whether entries are per column or
        //              per row.
        // - ignoredEntries: An array of the entries (row or column number)
        //                   that are ignored and are not mapped.
        // - mappings: An array of "ImportMapping" objects.

        //
        // All attributes may always be undefined or null.
        //
        // SourceData object:
        //  - columns: number of columns
        //  - rows: number of rows
        //  - data: interleaved cells (column-wise)
        //
        // ImportMapping object:
        //  - id: string - unique identifier of the mapping
        //  - type: string - identifier of the entity type
        //  - attributes: Array of AttributeMapping objects
        //
        // AttributeMapping object:
        //  - name: string - name of the attribute
        //  - type: enum(entry, entity, value)
        //  - entry: column/row index or null/undefined
        //  - entity: string or null/undefined - unique identifier of other
        //            mapping
        //  - value: string or null/undefined - fixed value for all new
        //           entities
        //  - keyComponent: boolean - whether part of the entity's key or not

        var _state = null;

        // Cache for the XHR response of "/frontend-api/importer/types"

        var _cachedEntityTypes = null;

        return {
            getCurrentStep: function () {
                // The current step is determined by the _state object.

                if (!_state || !state.sourceData) {
                    return IMPORT_STATE_SOURCE_SELECTION;
                }

                if (!_state.entryType ||
                    !_state.ignoredEntries ||
                    !state.mappings) {
                    return IMPORT_STATE_MAPPING_BUILDER;
                }

                return IMPORT_STATE_FINALIZATION;
            },
            reset: function () {
                _state = null;
            },
            submit: function () {
                var deferred = $q.defer();

                // TODO
                deferred.reject('Not implemented!');

                return deferred.promise;
            },
            setInput: function (workbook, worksheetName) {
                if (!_state) {
                    _state = new Object();
                }

                // Generating the SourceData object

                var sheet = workbook.Sheets[worksheetName];
                _state.sourceData = new Object();

                // Determining the boundaries

                var range = ExcelHelper.rangeToCoordsPair(sheet['!ref']);
                var offsetColumn = range[0].column;
                var offsetRow = range[0].row;
                var totalColumns = range[1].column - offsetColumn + 1;
                var totalRows = range[1].row - offsetRow + 1;

                _state.sourceData.columns = totalColumns;
                _state.sourceData.rows = totalRows;
                _state.sourceData.data = new Array(totalColumns * totalRows);

                // Extracting the cell data

                for (var row = 0; row < totalRows; row++) {
                    for (var col = 0; col < totalColumns; col++) {
                        var coords = {
                            column: offsetColumn + col,
                            row: offsetRow + row
                        };

                        var cell = sheet[ExcelHelper.coordsToCell(coords)];

                        if (!cell) {
                            continue;
                        }

                        _state.sourceData.data[row * totalColumns + col] =
                            cell.v;
                    }
                }
            },
            getEntityTypes: function () {
                var deferred = $q.defer();

                if (_cachedEntityTypes) {
                    deferred.resolve(_cachedEntityTypes);
                    return deferred.promise;
                }

                $http.get('/frontend-api/importer/types')
                    .then(function (response) {
                        deferred.resolve(_cachedEntityTypes = response.data);
                    });

                // TODO: Error handling

                return deferred.promise;
            },
            getWorksheet: function () {
                if (!_state || !_state.sourceData) {
                    return null;
                }

                return _state.sourceData;
            },
            randomId: function () {
                // Generating a sixteen characters long random identifier (only
                // alphanumeric)

                var result = '';

                while (result.length < 16) {
                    var r = Math.floor(Math.random() * 128);

                    if ((r > 0x2F && r < 0x3A) || // Numbers
                        (r > 0x40 && r < 0x5B) || // Uppercase
                        (r > 0x60 && r < 0x7B)) { // Lowercase
                        result += String.fromCharCode(r);
                    }
                }

                return result;
            },
            setMappings: function (mappings) {
                if (!_state) {
                    _state = new Object();
                }

                _state.mappings = mappings;
            },
            getMappedEntities: function () {
                var result = [];

                var worksheet = this.getWorksheet();
                var mapping = _state.mappings;

                // FIXME: Orientation and ignored cells.

                for (var i = 1; i < worksheet.rows; i++) {
                    for (var j = 0; j < mapping.length; j++) {
                        
                    }
                }

                return result;
            }
        };
    });
