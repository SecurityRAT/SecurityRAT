angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, $state, apiFactory, entity, trainingRoot, Training, TrainingTreeNode) {
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
                trainingRoot.setTrainingId(result);

                console.log("SAVING TREE TO DB", result.id, result);
                trainingRoot.saveSubTree();
                $state.go('training', null, { reload: true });
            });

        };

        $scope.generate = function() {
            var requestString = "";
            var collectionArray = [];

            trainingRoot.name = $scope.Training.name;
            trainingRoot.sort_order = 0;
            trainingRoot.node_type = "BranchNode";
            trainingRoot.opened = true;
            trainingRoot.addChildNode("CustomSlideNode", "Title", true);
            var intro = trainingRoot.addChildNode("BranchNode", "Introduction", true );
            intro.addCustomSlideNode("Title", "{{ parent.name }}");
            intro.addCustomSlideNode("Welcome", "<h2>Welcome to {{ training.name }}</h2>");
            intro.addCustomSlideNode("Who am I", "<h2>Who am I?</h2>\nJohn Doe, Security Analyst");
            intro.addCustomSlideNode("Portfolio", "" +
                "<h2>John Doe</h2>\n" +
                "<ul><li>Security Trainer</li>\n" +
                "<li>Expert in Security</li>\n" +
                "<li>Elite programmer</li>");

            // build the query
            if(!Training.allRequirementsSelected) {
                $scope.Training.collections.forEach(function(collection) {
                   collectionArray.push(collection.id);
                });
                var requirementsSettings = {
                    collections: collectionArray,
                    projectTypes: [1]
                };
                angular.forEach(requirementsSettings, function(value, key) {
                    requestString += key + '=' + value + '&';
                });
            }
            //Remove trailing &
            requestString = requestString.slice(0, -1);
            apiFactory.getByQuery("categoriesWithRequirements", "filter", requestString).then(
                function(categoriesWithRequirements) {
                    $scope.requirementSkeletons = categoriesWithRequirements;
                    // $scope.buildRequirements();

                    // create content node which holds all generated slides
                    var contentNode = trainingRoot.addChildNode("BranchNode", "Contents", true);

                    // add generated slides
                    categoriesWithRequirements.forEach(function(category) {
                        var categoryNode = contentNode.addChildNode("CategoryNode", category.name, false);
                        category.requirements.forEach(function(requirement) {
                            var requirementNode = categoryNode.addChildNode("RequirementNode", requirement.shortName, false);
                            requirementNode.addChildNode("GeneratedSlideNode", "Skeleton", false);

                            // add option columns slides for each requirement
                            //  if no optColumns were selected, $scope.TrainingoptColumns is undefined!
                            if($scope.Training.optColumns != null) {
                                $scope.Training.optColumns.forEach(function(optColumn) {
                                    requirementNode.addChildNode("GeneratedSlideNode", optColumn.name, false);
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
                    console.log("FINISHED TREE BUILDING", $rootScope.trainingTreeData, $scope, $rootScope);
                    $rootScope.displayTree();
                }
            );

        };
    });
