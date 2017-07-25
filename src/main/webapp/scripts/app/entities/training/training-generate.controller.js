angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, $state, apiFactory, entity, trainingRoot, Training, TrainingTreeNode) {
        $scope.Training = entity;
        $scope.trainingTreeData = [];
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
            intro.addChildNode("CustomSlideNode", "Title", false);
            intro.addChildNode("CustomSlideNode", "Welcome", false);
            intro.addChildNode("CustomSlideNode", "Who am I", false);
            intro.addChildNode("CustomSlideNode", "Portfolio", false);

            $scope.debugTree = trainingRoot.toJSON();

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
                    $scope.trainingTreeData[0] = trainingRoot.getJSON();
                    console.log("FINISHED TREE BUILDING", $scope.trainingTreeData);
                    $scope.displayTree();
                }
            );

        };


        $scope.displayTree = function() {
            $('#tree').jstree({
                'core' : {
                    'check_callback': true,
                    'data' : $scope.trainingTreeData
                },
                "contextmenu": {items: customMenu},
                "types" : {
                    // the default type
                    "BranchNode": {
                        "max_children": -1,
                        "max_depth": -1,
                        "valid_children": [
                            "BranchNode",
                            "GeneratedSlideNode",
                            "CustomSlideNode",
                            "CategoryNode",
                            "RequirementNode"
                        ],
                        "create_node": true
                    },
                    "GeneratedSlideNode": {
                        "icon": "glyphicon glyphicon-file",
                        "create_node": false,
                        "valid_children": "none",
                        "li_attr": { "class" : "slide" }
                    },
                    "CustomSlideNode": {
                        "icon": "glyphicon glyphicon-flash",
                        "create_node": false,
                        "valid_children": "none",
                        "li_attr": { "class" : "slide" }
                    },
                    "RequirementNode": {
                        "icon": "glyphicon glyphicon-book",
                        "create_node": false,
                        "valid_children": "none",
                        "li_attr": { "class" : "slide" }
                    },
                    "CategoryNode": {

                    }
                },
                "plugins" : ["contextmenu", "dnd", "types"]
            });
        };
    });
