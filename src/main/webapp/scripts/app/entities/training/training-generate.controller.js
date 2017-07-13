angular.module('sdlctoolApp')
    .controller('TrainingGenerateController', function ($scope, $rootScope, $stateParams, $state, apiFactory, entity, Training) {
        $scope.Training = entity;
        $scope.trainingTreeData = [];

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.save = function() {
            console.log("TRAINING", $scope.Training);
            if ($scope.Training.id != null) {
                Training.update($scope.Training, onSaveFinished);
            } else {
                Training.save($scope.Training, onSaveFinished);
            }
            $state.go('training', null, { reload: true });
        };

        $scope.generate = function() {
            var requestString = "";
            var collectionArray = [];

            $scope.trainingTreeData[0] = {
                "text" : $scope.Training.name,
                "state": { "opened": true },
                children : [
                    { "text" : "Title", "type": "custom" },
                    { "text" : "Introduction", "state": { "opened": true }, children: [
                        { "text" : "Title", "type": "custom" },
                        { "text" : "Welcome", "type": "custom", "state": { "opened": true, "selected": true } },
                        { "text" : "Who am I", "type": "custom", "state": { "opened": true } },
                        { "text" : "Portfolio", "type": "custom", "state": { "opened": true } }
                    ]
                    },
                    { "text" : "Content", "state": { "opened": true }, children: []
                    },
                    { "text" : "Outro", "state": { "opened": true }, children: [
                        { "text" : "Title", "type": "custom" },
                        { "text" : "Comic", "type": "custom", "state": { "opened": true } }
                    ]
                    }
                ]
            };

            // build the query
            $scope.Training.collections.forEach(function(collection) {
               collectionArray.push(collection.id);
            });
            var requirementsSettings = {
                collections: collectionArray,
                projectTypes: [1]
            };
            console.log("requirementsSettings", requirementsSettings);
            angular.forEach(requirementsSettings, function(value, key) {
                requestString += key + '=' + value + '&';
            });
            //Remove trailing &
            requestString = requestString.slice(0, -1);
            console.log("requestString", requestString);
            console.log("$scope.trainingTreeData", $scope.trainingTreeData);
            apiFactory.getByQuery("categoriesWithRequirements", "filter", requestString).then(
                function(categoriesWithRequirements) {
                    $scope.requirementSkeletons = categoriesWithRequirements;
                    // $scope.buildRequirements();
                    console.log("$scope.requirementSkeletons", $scope.requirementSkeletons);

                    categoriesWithRequirements.forEach(function(category) {
                        var categoryNode = {
                            "text": category.name,
                            "state": {"opened": false},
                            children: []
                        };
                        category.requirements.forEach(function(requirement) {
                            var requirementNode = {
                                "text" : requirement.shortName,
                                "type": "requirement",
                                "state": { "opened": false },
                                children: [
                                    {
                                        "text": "Skeleton",
                                        "type": "slide"
                                    }
                                ]
                            };
                            categoryNode.children.push(requirementNode);
                        });
                        // push to the 'content'-node
                        console.log("pushing ", categoryNode, "into", $scope.trainingTreeData[0].children[2].children);
                        $scope.trainingTreeData[0].children[2].children.push(categoryNode);
                    });

                    console.log("FINISHED TREE BUILDING", $scope.trainingTreeData);
                    $scope.displayTree();
                },
                function(exception) {}
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
                    "default": {
                        "max_children": -1,
                        "max_depth": -1,
                        "valid_children": ["default", "slide", "custom"],
                        "create_node": true
                    },
                    "slide": {
                        "icon": "glyphicon glyphicon-file",
                        "create_node": false,
                        "valid_children": "none",
                        "li_attr": { "class" : "slide" }
                    },
                    "custom": {
                        "icon": "glyphicon glyphicon-flash",
                        "create_node": false,
                        "valid_children": "none",
                        "li_attr": { "class" : "slide" }
                    },
                    "requirement": {
                        "icon": "glyphicon glyphicon-book",
                        "create_node": false,
                        "valid_children": "none",
                        "li_attr": { "class" : "slide" }
                    }
                },
                "plugins" : ["contextmenu", "dnd", "types"]
            });
        };
    });
