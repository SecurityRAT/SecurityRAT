'use strict';

angular.module('sdlctoolApp')
    .service('ExcelHelper', function () {
        return {
            columnToIndex: function (column) {
                // Inverting the string because it is big endian (and little
                // endian is easier to calculate).

                var leColumn = column.split('').reverse().join('');

                // Calculating the index

                var index = 0;

                for (var i = 0; i < leColumn.length; i++) {
                    var charCode = leColumn.charCodeAt(i);

                    // FIX for A (because A is 1, expect if it's the first/last
                    // character... then it's 0)

                    if (i > 0) {
                        charCode++;
                    }

                    index += Math.pow(26, i) * (charCode - 0x41);
                }

                return index;
            },
            indexToColumn: function (index) {
                var result = '';

                do {
                    // Looking for the greatest power of 26 that is smaller
                    // than index.

                    var divider = 1;

                    while ((divider * 26) < index) {
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
            cellToCoords: function (cell) {
                var matches = cell.match(/([A-Z]+)([0-9]+)/);

                return {
                    column: this.columnToIndex(matches[1]),
                    row: parseInt(matches[2]) - 1
                };
            },
            coordsToCell: function (coords) {
                return this.indexToColumn(coords.column)
                    + (coords.row + 1).toString();
            },
            rangeToCoordsPair: function (range) {
                var self = this;

                return range.split(":").map(function (cell) {
                    return self.cellToCoords(cell);
                });
            }
        };
    });
