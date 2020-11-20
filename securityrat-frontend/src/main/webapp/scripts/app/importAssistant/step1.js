'use strict';

angular.module('sdlctoolApp')
    .controller('ImportAssistantStep1Controller', function ($scope, $state, ImportAssistantState, ImportAssistantTable) {
        // The file that has been selected.

        var _selectedFile = null;

        // The tables that the _selectedFile contains

        var _availableTables = null;

        // The reference to a '<input type="file">' DOM element that may be
        // used for selecting the input file.

        var _fileInput =
            $('<input type="file" accept=".csv,.xls,.xlsx" style="display: none;">')
                .appendTo(document.body)
                .on('change', function () {
                    var inputEl = _fileInput.get(0);

                    // Not all browsers support the File API, but the current
                    // do.

                    if (inputEl.files && inputEl.files.length > 0) {
                        // Since we only support processing a single file, we
                        // just take the first element of the files array.

                        $scope.$apply(function () {
                            $scope.fileBox.selectedFile = inputEl.files[0];
                        });
                    }
                });

        // First of all, we should always reset the global import assistant
        // state first, otherwise things could get messy.

        ImportAssistantState.reset();

        // The file box handlers

        $scope.fileBox = {
            selectedTableIndex: null,

            handleDragover: function (event) {
                // We need to cancel the default behavior of the browser
                // otherwise it may change the appereance of the cursor

                event.preventDefault();
            },

            handleDrop: function (event) {
                // Since we accept the dropped file, we want to prevent the
                // browser's default behavior.

                event.preventDefault();

                // Attempting to get the dataTransfer instance of the
                // originalEvent. (Not all browsers do support this.)

                var dataTransfer = ('dataTransfer' in event.originalEvent)
                    ? event.originalEvent.dataTransfer
                    : null;

                if (!dataTransfer || !dataTransfer.files) {
                    // Dropping files is not supported.
                    return;
                }

                if (dataTransfer.files.length < 1) {
                    // The dropped object was not a file.
                    return;
                }

                // Since we do only support import single files, we just take
                // the first element of the file array.

                $scope.fileBox.selectedFile = dataTransfer.files[0];
            },

            handleClick: function() {
                // We only open the file chooser dialog, if no file has been
                // selected already.

                if ($scope.fileBox.selectedFile) {
                    return;
                }

                // Opening the file chooser dialog

                _fileInput.click();
            },

            resetButton: {
                handleClick: function ($event) {
                    // Since we are in the file box, we need to stop the event
                    // propagation, otherwise the file chooser may open
                    // unexpectedly.

                    $event.stopPropagation();

                    // Just setting the selectedFile to 'null', everything that
                    // depends on this property will be updated automatically.

                    $scope.fileBox.selectedFile = null;
                }
            }
        };

        Object.defineProperty($scope.fileBox, "selectedFile", {
            get: function () {
                return _selectedFile;
            },

            set: function (value) {
                if (!value) {
                    _selectedFile = null;
                    _availableTables = null;
                    $scope.selectedTableIndex = null;
                    return;
                }

                // Before we can update our internal references, we need to
                // parse the tables of the file.
                //
                // NOTE: We do not catch read errors because we just do not
                //       handle them (no state change).

                ImportAssistantTable.readTablesFromFile(value)
                    .then(function (tableObj) {
                        // Updating the internal state

                        _selectedFile = value;
                        _availableTables = tableObj;
                        $scope.selectedTableIndex = null;
                    });
            }
        });

        Object.defineProperty($scope.fileBox, "availableTables", {
            get: function () {
                return _availableTables;
            }
        });

        Object.defineProperty($scope.fileBox, "selectedTable", {
            get: function () {
                if (!$scope.fileBox.availableTables ||
                    !$scope.fileBox.selectedTableIndex) {
                    return null;
                }

                return $scope.fileBox.availableTables[
                    $scope.fileBox.selectedTableIndex];
            }
        });

        // Page navigation

        $scope.navigation = {
            continueButton: {
                handleClick: function () {
                    var table = $scope.fileBox.selectedTable;

                    if (!table) {
                        return;
                    }

                    // Updating the global state of the import assistant with
                    // the selected table and continuing with the next step.

                    ImportAssistantState.state.table = table;
                    $state.go('importAssistantStep2');
                }
            }
        };

        Object.defineProperty($scope.navigation.continueButton, "enabled", {
            get: function () {
                return !!$scope.fileBox.selectedTable;
            }
        });
    });