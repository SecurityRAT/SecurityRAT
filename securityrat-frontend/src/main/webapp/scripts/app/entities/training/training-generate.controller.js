angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, $state, $interval, $timeout,
                                                        $uibModal, apiFactory, entity, trainingRoot, Training,
                                                        TrainingTreeNode) {
        $scope.Training = entity;
        $rootScope.trainingTreeData = [];
        $scope.trainingRoot = trainingRoot;
        $scope.treeGenerated = false;
        $scope.progressbar = { hide: true, barValue: 0, intervalPromise: undefined };
        $scope.modalProgressbar = { barValue: 0, intervalPromise: undefined };

        $scope.activeStep = 1;
        $scope.showStep = function (n) {
            if($scope.Training.name != null && $scope.Training.name.length > 0) {
                $scope.activeStep = n;
            }
            else $scope.activeStep = 1;
            if($scope.activeStep === 4)
                $scope.updateNumberOfRequirements();
        };

        $scope.startProgressbar = function() {
            $scope.progressbar.intervalPromise = $interval(function() { $scope.progressbar.barValue += 1; }, 100, 95);
            $scope.progressbar.hide = false;
        };

        $scope.finishProgressbar = function() {
            if (angular.isDefined($scope.progressbar.intervalPromise)) {
                $interval.cancel($scope.progressbar.intervalPromise);
                $scope.progressbar.intervalPromise = undefined;
            }
            $scope.progressbar.barValue = 100;
            $timeout(function() {
                $scope.progressbar.barValue = 0;
                $scope.progressbar.hide = true;
                // finished! fade out all steps and fade in the finished block
                for (i = 1; i < 10; i++) {
                    id_next = "#step" + i + "div";
                    $(id_next).fadeOut();
                }
                $('#finishedBlock').css('visibility', 'visible').fadeIn();
            }, 2500);
        };

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.openSaveProgressModal = function() {
            $scope.modalProgressbar.intervalPromise = $interval(function() { $scope.modalProgressbar.barValue += 1; }, 100, 99);
            $scope.progressModalTitle = "Saving to database";
            $scope.saveProgressModalInstance = $uibModal.open({
                size: 'md',
                backdrop: 'static',
                templateUrl: 'scripts/app/entities/training/training-progressModal.html',
                scope: $scope
            });
        };
        $scope.closeSaveProgressModal = function() {
            if (angular.isDefined($scope.modalProgressbar.intervalPromise)) {
                $interval.cancel($scope.modalProgressbar.intervalPromise);
                $scope.modalProgressbar.intervalPromise = undefined;
            }
            $scope.modalProgressbar.barValue = 100;
            $timeout(function() {
                $state.params.isDirty = false;
                // actions when finished
                $scope.saveProgressModalInstance.close();
                $state.go('training', null, { reload: true });
            }, 2500);
        };

        $scope.save = function() {
            var new_training;
            if ($scope.Training.id != null) {
                new_training = Training.update($scope.Training, onSaveFinished);
            } else {
                new_training = Training.save($scope.Training, onSaveFinished);
            }

            // wait until the newly created training id is accessible...
            new_training.$promise.then(function(result) {
                trainingRoot.fromJSON($rootScope.getTreeJSON());
                trainingRoot.json_training_id = result.id;

                $scope.openSaveProgressModal();
                TrainingTreeNode.save(trainingRoot).$promise.then(function() {
                    $scope.closeSaveProgressModal();
                }, function() {
                    $scope.closeSaveProgressModal();
                    console.error("tree save operation failed");
                });
            });

        };

        var addIntro = function() {
            trainingRoot.addCustomSlideNode("Title", "<h1>{{ training.name }}</h1>");
            var intro = trainingRoot.addBranchNode("Introduction");
            intro.addCustomSlideNode("Title", "<h2>{{ parent.name }}</h2>");
            intro.addCustomSlideNode("Welcome", "<h2>Welcome to {{ training.name }}</h2>");
            intro.addCustomSlideNode("Who am I", "<h2>Who am I?</h2>\nJohn Doe, Security Analyst");
            intro.addCustomSlideNode("Portfolio", "" +
                "<h2>John Doe</h2>\n" +
                "<ul><li>Security Trainer</li>\n" +
                "<li>Expert in Security</li>\n" +
                "<li>Elite programmer</li></ul>");
        };

        var addOutro = function() {
            var intro = trainingRoot.addBranchNode("Outro");
            intro.addCustomSlideNode("Title", "<h2>{{ parent.name }}</h2>");
            intro.addCustomSlideNode("Questions", "<h2>End of {{ training.name }}</h2>Please feel free to ask questions");
        };

        var initTree = function() {
            // add tree JSON data to the scope
            $rootScope.trainingTreeData[0] = TrainingTreeNode.JSON_to_JSTree(trainingRoot);
            $rootScope.displayTree();
        };

        var sortByShowOrder = function(array) {
            if(array.length > 1) {
                array.sort(function(a,b) {
                    if (a.showOrder < b.showOrder)
                        return -1;
                    if (a.showOrder > b.showOrder)
                        return 1;
                    return 0;
                });
            }
        };

        $scope.generate = function() {
            $scope.startProgressbar();

            // clear the tree
            trainingRoot = new TrainingTreeNode();

            // create root node
            trainingRoot.name = $scope.Training.name;
            trainingRoot.node_type = "RootNode";
            trainingRoot.sort_order = 0;
            trainingRoot.opened = true;

            addIntro();

            var requestString = $rootScope.buildQueryParams();

            if(requestString != "") {

                // load the content
                apiFactory.getByQuery("categoriesWithRequirements", "filter", requestString).then(
                    function(categoriesWithRequirements) {
                        sortByShowOrder(categoriesWithRequirements);
                        $scope.requirementSkeletons = categoriesWithRequirements;

                        // create content node which holds all generated slides
                        var contentNode = trainingRoot.addContentNode();

                        // add generated slides
                        categoriesWithRequirements.forEach(function(category) {
                            if(category.requirements != null && category.requirements.length > 0) {
                                var categoryNode = contentNode.addCategoryNode(category.name, {id: category.id}, false);
                                categoryNode.addCustomSlideNode("Title", "<h2>{{ parent.name }}</h2>");
                                sortByShowOrder(category.requirements);
                                category.requirements.forEach(function(requirement) {
                                    var requirementNode = categoryNode.addRequirementNode(requirement, false);

                                    // add slides for each requirement displaying option column content
                                    //  if no optColumns were selected, $scope.TrainingoptColumns is undefined!
                                    if($scope.Training.optColumns != null) {
                                        $scope.Training.optColumns.forEach(function(optColumn) {
                                            requirementNode.addGeneratedSlideNode(optColumn);
                                        });
                                    }
                                });
                            }
                        });
                    },
                    function(exception) {}
                ).then(
                    function() {
                        addOutro();
                        initTree();
                        $scope.finishProgressbar();
                        $scope.treeGenerated = true;
                    }
                );
            } else {
                // no content has been added
                addOutro();
                initTree();
                $scope.finishProgressbar();
                $scope.treeGenerated = true;
            }
        };

        $scope.cancel = function() {
            $state.params.isDirty = false;
            $state.go('training', {});
        };
    });
