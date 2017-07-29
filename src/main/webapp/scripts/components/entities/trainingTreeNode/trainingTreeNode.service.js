'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingTreeNode', function ($resource, DateUtils, TrainingCustomSlideNode, TrainingBranchNode,
                                           TrainingCategoryNode, TrainingRequirementNode) {
        var onSaveFinished = function (result) {
            // $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        var TrainingTreeNode = $resource('api/trainingTreeNodes/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    data.children = [];
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
        TrainingTreeNode.prototype.getChildren = function() {
            console.log("getSubTree service function called");
            if(this.children == null) this.children = [];
            return this.children;
        };
        TrainingTreeNode.prototype.addChildNode = function (type, name, opened) {
            if(this.children == null) this.children = [];
            var newChild = new TrainingTreeNode();
            newChild.name = name;
            newChild.node_type = type;
            newChild.opened = opened;
            this.children.push(newChild);
            return newChild;
        };
        TrainingTreeNode.prototype.addCustomSlideNode = function(name, content) {
            var newChild = this.addChildNode("CustomSlideNode", name, false);
            newChild.content = content;
            return newChild;
        };
        TrainingTreeNode.prototype.addCategoryNode = function(name, category, opened) {
            var newChild = this.addChildNode("CategoryNode", name, opened);
            newChild.category = category;
            return newChild;
        };
        TrainingTreeNode.prototype.addRequirementNode = function(requirement, opened) {
            var newChild = this.addChildNode("RequirementNode", requirement.shortName, opened);
            newChild.requirementSkeleton = requirement;
            return newChild;
        };

        // both training id and parent id are not ready at the time the objects are created
        // therefore they must be set afterwards as soon as the ids are ready
        TrainingTreeNode.prototype.setTrainingId = function(id) {
            this.training_id = id;
            if(this.children != null) {
                this.children.forEach(function(childNode) {
                    childNode.setTrainingId(id);
                });
            }
        };

        // Database operations
        TrainingTreeNode.prototype.saveSubTree = function() {
            var node = this;
            // generate main table entry (TRAININGTREENODE)
            var new_trainingtreenode;
            new_trainingtreenode = TrainingTreeNode.save(node, onSaveFinished);
            new_trainingtreenode.$promise.then(function(result) {

            // create additional table entry, if needed
            var spec_node = {};
            spec_node.node = new_trainingtreenode; // set relation to trainingtreenode

            switch(node.node_type) {
                case "CustomSlideNode":
                    spec_node.name = node.name;
                    spec_node.content = node.content;
                    TrainingCustomSlideNode.save(spec_node, onSaveFinished);
                    break;
                case "BranchNode":
                    spec_node.name = node.name;
                    TrainingBranchNode.save(spec_node, onSaveFinished);
                    break;
                case "CategoryNode":
                    spec_node.name = node.name;
                    spec_node.category = node.category;
                    TrainingCategoryNode.save(spec_node, onSaveFinished);
                    break;
                case "RequirementNode":
                    spec_node.requirementSkeleton = node.requirementSkeleton;
                    TrainingRequirementNode.save(spec_node, onSaveFinished);
                    break;
                case "GeneratedSlideNode":
                case "RootNode":
                default:
            }
            if(node.children != null) {
                var sort_order = 0;
                node.children.forEach(function(node) {
                    node.sort_order = sort_order++;
                    // result != node, because result only contains the data which has been saved to db (no children)!
                    node.parent_id = result;
                    node.saveSubTree();
                });
            }

            });
        };
        TrainingTreeNode.prototype.loadSubTree = function(rootNode_id) {

        };

        // Generate JSON for the jstree-library
        TrainingTreeNode.prototype.getJSON = function() {
            var result = {
                "text" : this.name,
                "state" : { "opened": this.opened },
                "type" : this.node_type,
                children: []
            };

            if(result.data == null) result.data = {};
            switch(this.node_type) {
                case "CustomSlideNode":
                    result.data["content"] = this.content;
                    break;
                case "CategoryNode":
                    result.data["category"] = this.category;
                    break;
                case "RequirementNode":
                    result.data["requirementSkeleton"] = this.requirementSkeleton;
                    break;
            }

            if(this.children != null) {
                this.children.forEach(function(node) {
                    result.children.push(node.getJSON());
                });
            }
            return result;
        };

        // LOAD Tree out of jstree-library's JSON format to get the changes the user made to the tree
        // load everything into 'this' object
        TrainingTreeNode.prototype.fromJSON = function(json_data) {
            var node = this;

            node.name = json_data.text;
            node.node_type = json_data.type;
            node.children = [];

            switch(json_data.type) {
                case "CustomSlideNode":
                    node.content = json_data.data.content;
                    break;
                case "CategoryNode":
                    node.category = json_data.data.category;
                    break;
                case "RequirementNode":
                    node.requirementSkeleton = json_data.data.requirementSkeleton;
                    break;
            }

            json_data.children.forEach(function(child_json) {
               var childNode = new TrainingTreeNode();
               childNode.fromJSON(child_json);
                node.children.push(childNode);
            });
        };

        return TrainingTreeNode;
    });
