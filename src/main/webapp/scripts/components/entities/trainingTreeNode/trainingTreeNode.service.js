'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingTreeNode', function ($resource, DateUtils) {
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
            newChild.type = type;
            newChild.opened = opened;
            this.children.push(newChild);
            return newChild;
        };
        TrainingTreeNode.prototype.addRequirementNode = function() {

        };

        // both training id and parent id are not ready at the time the objects are created
        // therefore they must be set afterwards as soon as the ids are ready
        TrainingTreeNode.prototype.setTrainingId = function(id) {
            if(id == null) console.log("ERROR, setTrainingId(null/undefined)");
            this.training_id = id;
            if(this.children != null) {
                this.children.forEach(function(childNode) {
                    childNode.setTrainingId(id);
                });
            }
        };

        // Database operations
        var saveNode = function(node) {
            // generate main table entry
            var new_trainingtreenode;
            new_trainingtreenode = TrainingTreeNode.save(node, onSaveFinished);
            new_trainingtreenode.$promise.then(function(result) {
                console.log("CHILDREN OF ROOT AFTER SAVE", result.children);
               result.children.forEach(function(childNode) {
                  childNode.parent_id = result;
               });
            });

            // generate additional table entry, if needed
            switch(node.node_type) {
                case "CustomSlideNode":
                case "BranchNode":
                case "GeneratedSlideNode":
                case "RequirementNode":
                default:
            }
        };
        TrainingTreeNode.prototype.saveChildren = function() {
            saveNode(this);
            if(this.children != null) {
                var sort_order = 0;
                this.children.forEach(function(node) {
                    node.sort_order = sort_order++;
                    node.saveChildren();
                });
            }
        };
        TrainingTreeNode.prototype.loadChildren = function() {

        };

        // Generate JSON for the jstree-library
        TrainingTreeNode.prototype.getJSON = function() {
            var result = {
                "text" : this.name,
                "state" : { "opened": this.opened },
                "type" : this.type,
                children: []
            };
            if(this.children != null) {
                this.children.forEach(function(node) {
                    result.children.push(node.getJSON());
                });
            }
            return result;
        };
        console.log("TrainingTreeNode.prototype", TrainingTreeNode.prototype);
        return TrainingTreeNode;
    });
