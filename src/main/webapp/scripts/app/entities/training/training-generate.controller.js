angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, $state, $interval, $timeout,
                                                        apiFactory, entity, trainingRoot, Training, TrainingTreeNode) {
        $scope.Training = entity;
        $rootScope.trainingTreeData = [];
        $scope.trainingRoot = trainingRoot;
        $scope.progressbar = { hide: true, barValue: 0, intervalPromise: undefined };

        $scope.startProgressbar = function() {
            $scope.progressbar.intervalPromise = $interval(function() { $scope.progressbar.barValue += 1; }, 100, 95);
            $scope.progressbar.hide = false;
            $scope.showRequirements = false;
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
                trainingRoot.setTrainingId(result);

                trainingRoot.saveSubTree();
                $state.go('training', null, { reload: true });
            });

        };

        var addIntro = function() {
            trainingRoot.addCustomSlideNode("Title", "<h1>{{ training.name }}</h1>");
            var intro = trainingRoot.addChildNode("BranchNode", "Introduction", true );
            intro.addCustomSlideNode("Title", "{{ parent.name }}");
            intro.addCustomSlideNode("Welcome", "<h2>Welcome to {{ training.name }}</h2>");
            intro.addCustomSlideNode("Who am I", "<h2>Who am I?</h2>\nJohn Doe, Security Analyst");
            intro.addCustomSlideNode("Portfolio", "" +
                "<h2>John Doe</h2>\n" +
                "<ul><li>Security Trainer</li>\n" +
                "<li>Expert in Security</li>\n" +
                "<li>Elite programmer</li>");
        };

        var addOutro = function() {
            var intro = trainingRoot.addChildNode("BranchNode", "Outro", true );
            intro.addChildNode("CustomSlideNode", "Title", false);
            intro.addChildNode("CustomSlideNode", "Comic", false);
        };

        var initTree = function() {
            // add tree JSON data to the scope
            $rootScope.trainingTreeData[0] = trainingRoot.getJSON();
            $rootScope.displayTree();
        };

        $scope.generate = function() {
            var requestString = "";
            var selectedCollections = [];
            var selectedProjectTypes = [];

            $scope.startProgressbar();

            // clear the tree
            trainingRoot = new TrainingTreeNode();

            // create root node
            trainingRoot.name = $scope.Training.name;
            trainingRoot.node_type = "RootNode";
            trainingRoot.sort_order = 0;
            trainingRoot.opened = true;

            addIntro();

            // build the query to get the data (requirements, categories)
            if(!$scope.Training.allRequirementsSelected) {
                $scope.Training.collections.forEach(function(collection) {
                   selectedCollections.push(collection.id);
                });
                $scope.Training.projectTypes.forEach(function(projectType) {
                    selectedProjectTypes.push(projectType.id);
                });
            } else {
                selectedCollections = $rootScope.allCollections;
                selectedProjectTypes = $rootScope.allProjectTypes;
            }

            var hasCollectionsSelected = selectedCollections.length > 0;
            var hasProjectTypesSelected = selectedProjectTypes.length > 0;

            if(hasCollectionsSelected || hasProjectTypesSelected) {
                if(hasCollectionsSelected) {
                    requestString += "collections=" + selectedCollections;
                    if(selectedProjectTypes.length > 0) requestString += "&";
                }
                if(hasProjectTypesSelected)
                    requestString += "projectTypes=" + selectedProjectTypes;

                // load the content
                apiFactory.getByQuery("categoriesWithRequirementsSorted", "filter", requestString).then(
                    function(categoriesWithRequirements) {
                        $scope.requirementSkeletons = categoriesWithRequirements;

                        // create content node which holds all generated slides
                        var contentNode = trainingRoot.addChildNode("BranchNode", "Contents", true);

                        // add generated slides
                        categoriesWithRequirements.forEach(function(category) {
                            var categoryNode = contentNode.addCategoryNode(category.name, {id: category.id}, false);
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
                        });
                    },
                    function(exception) {}
                ).then(
                    function() {
                        addOutro();
                        initTree();
                        $scope.finishProgressbar();
                    }
                );
            } else {
                // no content has been added
                addOutro();
                initTree();
                $scope.finishProgressbar();
            }
        };
    });
