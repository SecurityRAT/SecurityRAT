angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, $state, apiFactory,
                                                        entity, trainingRoot, Training, TrainingTreeNode, ReqCategory) {
        $scope.Training = entity;
        $rootScope.trainingTreeData = [];
        $scope.trainingRoot = trainingRoot;

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

        $scope.generate = function() {
            var requestString = "";
            var selectedCollections = [];
            var selectedProjectTypes = [];

            // clear the tree
            trainingRoot = new TrainingTreeNode();

            // create root node
            trainingRoot.name = $scope.Training.name;
            trainingRoot.node_type = "RootNode";
            trainingRoot.sort_order = 0;
            trainingRoot.opened = true;

            // add children
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

            // build the query to get the data (requirements, categories)
            if(!Training.allRequirementsSelected) {
                $scope.Training.collections.forEach(function(collection) {
                   selectedCollections.push(collection.id);
                });
                $scope.Training.projectTypes.forEach(function(projectType) {
                    selectedProjectTypes.push(projectType.id);
                });
                var requirementsSettings = {
                    collections: selectedCollections,
                    projectTypes: selectedProjectTypes
                };
                angular.forEach(requirementsSettings, function(value, key) {
                    requestString += key + '=' + value + '&';
                });
            } else {
                //TODO load ALL categories with requirements (sorted)
            }
            //Remove trailing &
            requestString = requestString.slice(0, -1);
            apiFactory.getByQuery("categoriesWithRequirementsSorted", "filter", requestString).then(
                function(categoriesWithRequirements) {
                    $scope.requirementSkeletons = categoriesWithRequirements;
                    // $scope.buildRequirements();

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
                    var intro = trainingRoot.addChildNode("BranchNode", "Outro", true );
                    intro.addChildNode("CustomSlideNode", "Title", false);
                    intro.addChildNode("CustomSlideNode", "Comic", false);

                    // add tree JSON data to the scope
                    $rootScope.trainingTreeData[0] = trainingRoot.getJSON();
                    $rootScope.displayTree();
                }
            );

        };
    });
