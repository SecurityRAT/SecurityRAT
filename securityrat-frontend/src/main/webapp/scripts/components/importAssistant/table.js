'use strict';

angular.module('sdlctoolApp')
    .service('ImportAssistantTable', function ($q) {
        // Constructs an umodifiable table object

        function _createTable(rows, columns, cellData, name) {
            var table = new Object();

            Object.defineProperty(table, 'rows', {
                get: function () {
                    return rows;
                }
            });

            Object.defineProperty(table, 'columns', {
                get: function () {
                    return columns;
                }
            });

            Object.defineProperty(table, 'name', {
                get: function () {
                    return name;
                }
            });

            table.getCellValue = function (row, column) {
                return cellData[row * columns + column];
            };

            return table;
        }

        // Utility functions for Excel row and column names

        var _excelUtil = {
            // Some thoughts about the Excel row and column naming scheme and
            // the problems that result from that:
            //
            // Rows: The Excel rows begin with the index number "one". Thus, if
            //       we want to access a row by its Excel index, we always need
            //       to decrement the index by one because JavaScript arrays
            //       are zero-based.
            //
            // Columns: Excel's column labels are not numerical but
            //          alphabetical and there is one big problem that makes
            //          dealing with them much more harder then with Excel's
            //          rows:
            //          The letter 'A' serves both, the value "zero" and the
            //          value "one", depending on its significance (in terms of
            //          the byte order).
            //          Examples:
            //           - The numeric index of the column 'A' is zero (since
            //             its the first column of all columns and arrays begin
            //             with zero).
            //             Thus, in this case 'A' is equal to zero.
            //           - The numeric index of the column 'AB' is twenty-seven
            //             and the letter 'A' is more significant than the
            //             letter 'B'.
            //             In this case, 'A' needs to be equal to 1 and 'B'
            //             needs to be equal to '1' as well because than we can
            //             calculate the index with a standard value conversion
            //             operation between numeral systems:
            //             'A' * (26 ** 1) + 'B' * (26 ** 1) = 1 * 26 + 1 = 27
            //             (The constant '26' is the number of symbols in our
            //             numeral system, while the decrementing power is the
            //             significance/place).

            rowToIndex: function (row) {
                if (typeof row !== 'number') {
                    row = parseInt(row);
                }

                if (!Number.isInteger(row)) {
                    throw new Error('Invalid row!');
                }

                return row - 1;
            },

            columnToIndex: function (column) {
                // Inverting the string because it is big endian (and little
                // endian is easier to calculate).

                var leColumn = column.split('')
                    .reverse()
                    .join('')
                    .toUpperCase();

                // Calculating the index

                var index = 0;

                for (var i = 0; i < leColumn.length; i++) {
                    var charCode = leColumn.charCodeAt(i);

                    if (charCode < 0x41 || charCode > 0x5A) {
                        throw new Error('Invalid column!');
                    }

                    // FIX for A (because A is 1, expect if it's the first/last
                    // character... then it's 0)

                    if (i > 0) {
                        charCode++;
                    }

                    index += Math.pow(26, i) * (charCode - 0x41);
                }

                return index;
            },

            indexToRow: function (index) {
                return (index + 1).toString();
            },

            indexToColumn: function (index) { // TODO: Fix this.
                var result = '';

                do {
                    // Looking for the greatest power of 26 that is smaller
                    // than index.

                    var divider = 1;

                    while ((divider * 26) <= index) {
                        divider *= 26;
                    }

                    // Adding the correct ASCII value to the result and
                    // calculating the next index

                    result += String.fromCharCode(
                        0x41 + Math.floor(index / divider));

                    index = index % divider;

                    // FIX for 1-based numbers: If divider is greater than 1
                    // and index is zero now, we need to append an 'A'.

                    if (divider > 1 && index == 0) {
                        result += 'A';
                    }
                } while (index > 0);

                return result;
            },

            fromIndices: function (rowIndex, columnIndex) {
                var coordinates = new Object();

                Object.defineProperty(coordinates, 'column', {
                    get: function () {
                        return _excelUtil.indexToColumn(columnIndex);
                    }
                });

                Object.defineProperty(coordinates, 'row', {
                    get: function () {
                        return _excelUtil.indexToRow(rowIndex);
                    }
                });

                Object.defineProperty(coordinates, 'columnIndex', {
                    get: function () {
                        return columnIndex;
                    }
                });

                Object.defineProperty(coordinates, 'rowIndex', {
                    get: function () {
                        return rowIndex;
                    }
                });

                Object.defineProperty(coordinates, 'columnRowPair', {
                    get: function () {
                        return [coordinates.column, coordinates.row].join('');
                    }
                });

                return coordinates;
            },

            fromColumnRowPair: function (pair) {
                // Separting the alphetical part from the numerical part with a
                // tiny regular expression.

                var matches = pair.match(/([A-Z]+)([0-9]+)/);

                if (matches.length != 3) {
                    throw new Error('Invalid column-row-pair: ' + pair);
                }

                // Parsing the column-row-pair to their index representation
                // and creating a Coordinates instance from the result.

                return _excelUtil.fromIndices(
                    _excelUtil.rowToIndex(matches[2]),
                    _excelUtil.columnToIndex(matches[1]));
            },

            fromRange: function (rangeStr) {
                // Splitting the two column-row-pairs in the middle at the
                // separating colon and parsing them to two Coordinates
                // instances.

                var coordinatesPair = rangeStr.split(":")
                    .map(_excelUtil.fromColumnRowPair);

                if (coordinatesPair.length != 2) {
                    throw new Error('Invalid range: ' + rangeStr);
                }

                // Constructing the Range instance

                var range = new Object();

                Object.defineProperty(range, 'start', {
                    get: function () {
                        return coordinatesPair[0];
                    }
                });

                Object.defineProperty(range, 'end', {
                    get: function () {
                        return coordinatesPair[1];
                    }
                });

                Object.defineProperty(range, 'rows', {
                    get: function () {
                        return range.end.rowIndex - range.start.rowIndex;
                    }
                });

                Object.defineProperty(range, 'columns', {
                    get: function () {
                        return range.end.columnIndex - range.start.columnIndex;
                    }
                });

                return range;
            }
        };

        var result = {
            readTablesFromFile: function (file) {
                var deferred = $q.defer();

                // Reading the bytes from the file reference.

                var reader = new FileReader();

                reader.onload = function (event) {
                    var binaryData = new Uint8Array(event.target.result);

                    // Parsing the file with the XLSX/SheetJS library

                    var workbook;

                    try {
                        workbook = XLSX.read(binaryData, { type: 'array' });
                    } catch (ex) {
                        deferred.reject('Invalid input format!');
                        return;
                    }

                    // Per sheet: Converting the table to an internal format
                    //            that we can work with more easily.

                    deferred.resolve(workbook.SheetNames.map(
                        function (sheetName) {
                            var sheet = workbook.Sheets[sheetName];

                            // Determining the table area that contains data

                            var sheetArea =
                                _excelUtil.fromRange(sheet['!ref']);

                            // Preparing the data that is required for the
                            // construction of a table instance.

                            var columns = sheetArea.columns;
                            var rows = sheetArea.rows;
                            var data = new Array(columns * rows);

                            var offsetColumn = sheetArea.start.columnIndex;
                            var offsetRow = sheetArea.start.rowIndex;

                            for (var row = 0; row < rows; row++) {
                                for (var col = 0; col < columns; col++) {
                                    var coords = _excelUtil.fromIndices(
                                        offsetRow + row,
                                        offsetColumn + col);

                                    var cell = sheet[coords.columnRowPair];

                                    if (!cell) {
                                        // If a cell does not exist, it is
                                        // empty.

                                        data[row * columns + col] = null;
                                        continue;
                                    }

                                    data[row * columns + col] = cell.v;
                                }
                            }

                            // Creating a new table instance

                            return _createTable(
                                rows,
                                columns,
                                data,
                                sheetName);
                        }));
                };

                reader.onerror = function () {
                    deferred.reject('Reading the file failed!');
                };

                reader.onabort = function (event) {
                    deferred.reject('Reading the file was aborted!');
                };

                reader.readAsArrayBuffer(file);

                return deferred.promise;
            }
        };

        Object.defineProperty(result, "ExcelUtil", {
            get: function () {
                return _excelUtil;
            }
        });

        return result;
    });
