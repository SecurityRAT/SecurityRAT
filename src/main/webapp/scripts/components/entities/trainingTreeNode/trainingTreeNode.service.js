'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingTreeNode', function ($resource, DateUtils, TrainingCustomSlideNode) {
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
            switch(node.node_type) {
                case "CustomSlideNode":
                    spec_node.node = new_trainingtreenode; // id is set in this object
                    spec_node.name = node.name;
                    spec_node.content = node.content;
                    TrainingCustomSlideNode.save(spec_node, onSaveFinished);
                case "BranchNode":
                case "GeneratedSlideNode":
                case "RequirementNode":
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
            // add data (custom properties are only available in the tree when inside 'data')
            if(this.node_type == "CustomSlideNode") {
                if(result.data == null) result.data = {};
                result.data["content"] = this.content;
                console.log("inserting content into slide", this.content, result);
            }
            if(this.children != null) {
                this.children.forEach(function(node) {
                    result.children.push(node.getJSON());
                });
            }
            return result;
        };
        return TrainingTreeNode;
    });
