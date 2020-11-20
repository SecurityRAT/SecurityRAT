'use strict';

angular.module('sdlctoolApp')
    .controller('FeRequirementSkeletonController', function ($scope, $filter, sharedProperties, apiFactory, $document, $uibModal, ProgressBar) {
        $scope.requirementSkeletons = [];
        $scope.tagCategories = [];
        $scope.collCategories = [];
        $scope.dropdowns = {};
        $scope.tagInstances = [];
        $scope.projectTypes = [];
        $scope.collectionsInstances = [];
        $scope.selectedCategory = [];
        $scope.selectedTags = [];
        $scope.selectedTypes = [];
        $scope.selectedColls = [];
        $scope.numberToDisplay = 10;
		$scope.length = 1000;
		
		$scope.progressbar = {
            hide: true,
            barValue: 0,
            intervalPromise: undefined,
            showContent: false
		};
		
        $scope.selectedCategorySettings = {
            smartButtonMaxItems: 2,
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'name',
            idProp: 'id',
            externalIdProp: ''
        };
        
        $scope.typeLabelText = {
            buttonDefaultText: 'Implementation Types'
        };

        $scope.loadAll = function () {
			ProgressBar.startProgressbar($scope.progressbar);
            apiFactory.getAll('requirementSkeletons').then(
                function (result) {
                    $scope.requirementSkeletons = result;
					$scope.length = $scope.requirementSkeletons.length;
					ProgressBar.finishProgressbar($scope.progressbar);
                });
            apiFactory.getAll('projectTypes').then(
                function (result) {
                    $scope.projectTypes = result;
                });
            apiFactory.getAll('tags').then(
                function (result) {
                    $scope.tagCategories = result;
                });
            apiFactory.getAll('collections').then(
                function (result) {
                    $scope.collCategories = result;
                });
            $scope.dropdowns.tag = {
                buttonText: 'Tags',
                open: false,
                defaultText: 'Tags'
            };
            $scope.dropdowns.coll = {
                buttonText: 'Collections',
                open: false,
                defaultText: 'Collections'
            };
        };
        $scope.loadAll();
        $scope.loadMore = function () {
            if ($scope.numberToDisplay + 50 < $scope.length) {
                $scope.numberToDisplay += 50;
            } else {
                $scope.numberToDisplay = $scope.length;
            }
        };

        $scope.openFeedback = function (requirement) {
            //console.log(requirement);
            sharedProperties.setProperty(requirement);
            var modalInstance = $uibModal.open({
                size: 'lg',
                backdrop: 'static',
                templateUrl: 'scripts/app/editor/feedback/feedback.html',
                controller: 'FeedbackController'
            });

            modalInstance.result.then();
        };

        /* jshint unused: false */
        $scope.toggleDropdown = function (selector, $event) {
            var dropdowns = ['tag', 'coll'];
            dropdowns.splice(dropdowns.indexOf(selector), 1);
            if (!$scope.dropdowns[selector].open) {
                $document.on('click', function (e) {
                    var target = e.target.parentElement;
                    var parentFound = false;

                    while (angular.isDefined(target) && target !== null && !parentFound) {
                        if (angular.equals(target.id, 'multiselect-parent') && !parentFound) {
                            parentFound = true;
                        }
                        target = target.parentElement;
                    }

                    if (!parentFound) {
                        $scope.$apply(function () {
                            $scope.dropdowns[selector].open = false;
                        });
                    }
                });
                for (var i = 0; i < dropdowns.length; i++) {
                    $scope.dropdowns[dropdowns[i]].open = false;
                }
                $scope.dropdowns[selector].open = true;
            } else {
                $scope.dropdowns[selector].open = false;
            }
        };

        $scope.selectTagInstance = function (tagInstance, selector, dropdownSelector) {
            var exist = false;
            var index = 0;
            for (var i = 0; i < $scope[selector].length; i++) {
                if ($scope[selector][i].id === tagInstance.id) {
                    exist = true;
                    index = i;
                    break;
                }
            }
            if (!exist) {
                $scope[selector].push(tagInstance);
            } else {
                $scope[selector].splice(index, 1);
            }
            if ($scope[selector].length === 0) {
                $scope.dropdowns[dropdownSelector].buttonText = $scope.dropdowns[dropdownSelector].defaultText;
            }
            if ($scope[selector].length > 0) {
                $scope.dropdowns[dropdownSelector].buttonText = '';
                $scope.dropdowns[dropdownSelector].buttonText = $scope[selector][0].name;
                for (i = 1; i < $scope[selector].length && i < 2; i++) {
                    $scope.dropdowns[dropdownSelector].buttonText += ', ' + $scope[selector][1].name;
                }
                if ($scope[selector].length > 2) {
                    $scope.dropdowns[dropdownSelector].buttonText += ',...';
                }
            }

        };

        $scope.isTagSelected = function (tagInstance, selector) {
            var exist = false;
            for (var i = 0; i < $scope[selector].length; i++) {
                if ($scope[selector][i].id === tagInstance.id) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                return false;
            } else {
                return true;
            }
        };

        $scope.refresh = function () {
            $scope.loadAll();
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.requirementSkeleton = {
                universalId: null,
                shortName: null,
                description: null,
                showOrder: null,
                active: null,
                id: null
            };
        };
    });
