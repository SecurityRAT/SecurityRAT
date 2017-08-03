'use strict';

angular.module('sdlctoolApp')
    .factory('TrainingTreeNode', function ($resource, $sanitize, DateUtils, TrainingCustomSlideNode, TrainingBranchNode,
                                           TrainingCategoryNode, TrainingRequirementNode, TrainingGeneratedSlideNode,
                                           TrainingTreeUtil, RequirementSkeleton) {
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

            // add skeleton slide
            var skeletonSlide = newChild.addChildNode("GeneratedSlideNode", "Skeleton", false);
            skeletonSlide.optColumn = null; // mark it as a skeleton slide!

            return newChild;
        };
        TrainingTreeNode.prototype.addGeneratedSlideNode = function(optColumn) {
            var newChild = this.addChildNode("GeneratedSlideNode", optColumn.name, false);
            newChild.optColumn = {id: optColumn.id};
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

            return new Promise(function(resolve, reject) {
                // generate main table entry (TRAININGTREENODE)
                var subPromises = [TrainingTreeNode.save(node, onSaveFinished).$promise];
                subPromises[0].then(function(new_trainingtreenode) {

                    var spec_node = {};
                    spec_node.node = new_trainingtreenode; // set relation to trainingtreenode

                    // create special table entry, if needed
                    switch(node.node_type) {
                        case "CustomSlideNode":
                            spec_node.name = node.name;
                            spec_node.content = node.content;
                            subPromises.push(TrainingCustomSlideNode.save(spec_node, onSaveFinished).$promise);
                            break;
                        case "BranchNode":
                            spec_node.name = node.name;
                            subPromises.push(TrainingBranchNode.save(spec_node, onSaveFinished).$promise);
                            break;
                        case "CategoryNode":
                            spec_node.name = node.name;
                            spec_node.category = node.category;
                            subPromises.push(TrainingCategoryNode.save(spec_node, onSaveFinished).$promise);
                            break;
                        case "RequirementNode":
                            spec_node.requirementSkeleton = node.requirementSkeleton;
                            subPromises.push(TrainingRequirementNode.save(spec_node, onSaveFinished).$promise);
                            break;
                        case "GeneratedSlideNode":
                            spec_node.optColumn = node.optColumn;
                            subPromises.push(TrainingGeneratedSlideNode.save(spec_node, onSaveFinished).$promise);
                            break;
                        case "RootNode":
                        default:
                    }
                    if(node.children != null) {
                        var sort_order = 0;
                        node.children.forEach(function(node) {
                            node.sort_order = sort_order++;
                            // result != node, because result only contains the data which has been saved to db (no children)!
                            node.parent_id = new_trainingtreenode;
                            subPromises.push(node.saveSubTree());
                        });
                    }

                    Promise.all(subPromises).then(function() {
                        resolve();
                    });
                });
            });
        };

        TrainingTreeNode.prototype.loadSubTree = function() {
            var node = this;
            return new Promise(function(resolve, reject) {
                var subPromises = [TrainingTreeUtil.ChildrenOfNode.query({id: node.id}).$promise];
                node.children = [];

                switch(node.node_type) {
                    case "CustomSlideNode":
                        var query_promise = TrainingTreeUtil.CustomSlideNode.get({id: node.id}).$promise;
                        subPromises.push(query_promise);
                        query_promise.then(function(result) {
                            node.content = result.content;
                        });
                        break;
                    case "BranchNode":
                        var query_promise = TrainingTreeUtil.BranchNode.get({id: node.id}).$promise;
                        subPromises.push(query_promise);
                        query_promise.then(function(result) {
                            node.name = result.name;
                        });
                        break;
                    case "RequirementNode":
                        var query_promise = TrainingTreeUtil.RequirementNode.get({id: node.id}).$promise;
                        subPromises.push(query_promise);
                        query_promise.then(function(result) {
                            node.requirement = result.requirementSkeleton;
                        });
                        break;
                    case "GeneratedSlideNode":
                        var query_promise = TrainingTreeUtil.GeneratedSlideNode.get({id: node.id}).$promise;
                        subPromises.push(query_promise);
                        query_promise.then(function(result) {
                            node.optColumn = result.optColumn;
                        });
                        break;
                }

                subPromises[0].then(function(children) {

                    if(children != null) {
                        children.forEach(function(child) {
                            // convert the result to a full TrainingTreeNode-Object (which has all member methods)
                            var childNode = new TrainingTreeNode();
                            childNode.id = child.id;
                            childNode.node_type = child.node_type;
                            childNode.parent_id = node;
                            childNode.sort_order = child.sort_order;
                            childNode.training_id = child.training_id;

                            subPromises.push(childNode.loadSubTree());
                            node.children.push(childNode);
                        })
                    }

                    Promise.all(subPromises).then(function() {
                        resolve();
                    })
                });
            });
        };

        var getTrainingName = function(node) {
            var result = "";
            if(node.training_id != null)
                if(node.training_id.name != null)
                    result = node.training_id.name;
            return result;
        };
        var getParentName = function(node) {
            var result = "";
            if(node.parent_id != null)
                if(node.parent_id.name != null)
                    result = node.parent_id.name;
            return result;
        };

        TrainingTreeNode.prototype.loadContent = function() {
            var node = this;
            var content = "";

            return new Promise(function(resolve, reject) {
                var subPromises = [];
                switch (node.node_type) {
                    case "CustomSlideNode":
                        content = node.content;
                        if (content != null) {
                            content = content
                                .replace(/({{ *training.name *}})/g, getTrainingName(node))
                                .replace(/({{ *parent.name *}})/g, getParentName(node));
                        }
                        break;
                    case "GeneratedSlideNode":
                        var parentNode = node.parent_id;
                        var reqPromise = RequirementSkeleton.get({id: parentNode.requirement.id}).$promise;
                        subPromises.push(reqPromise);

                        if (node.optColumn == null) {
                            if (parentNode.node_type == "RequirementNode") {
                                reqPromise.then(function (req) {
                                    content = "<h2>" + req.shortName + "</h2>"
                                        + req.description;
                                });
                            }
                        } else {
                            var optPromise = TrainingTreeUtil.OptColumnContent.query(
                                {
                                    optColumnId: node.optColumn.id,
                                    requirementId: parentNode.requirement.id
                                }).$promise;

                            subPromises.push(optPromise);
                            optPromise.then(function(optColumnContent) {
                                if(optColumnContent.content != null) {
                                    content = "<h3>"+node.optColumn.name+"</h3>"
                                        + optColumnContent.content;
                                }
                            });
                        }
                        break;
                }

                Promise.all(subPromises).then(function() {
                  resolve($sanitize(content));
                });
            });
        };

        // load and return slides of this nodes subtree
        TrainingTreeNode.prototype.loadSlides = function() {
            var slides = [];
            var node = this;

            return new Promise(function(resolve, reject) {
                var subPromises = [node.loadContent()];
                subPromises[0].then(function(nodeContent) {
                    if(nodeContent != null && nodeContent != "")
                        slides.push({content: nodeContent});

                    if(node.children != null) {
                        node.children.forEach(function (childNode) {
                            var subPromise = childNode.loadSlides();
                            subPromises.push(subPromise);
                            subPromise.then(function (childSlides) {
                                childSlides.forEach(function (new_slide) {
                                    slides.push(new_slide);
                                });
                            });
                        });
                    }
                    Promise.all(subPromises).then(function() {
                        resolve(slides);
                    });
                });
            });
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
                case "GeneratedSlideNode":
                    result.data["optColumn"] = this.optColumn;
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
                case "GeneratedSlideNode":
                    node.optColumn = json_data.data.optColumn;
                    break;
            }

            if(json_data.children != null)
                json_data.children.forEach(function(child_json) {
                   var childNode = new TrainingTreeNode();
                   childNode.fromJSON(child_json);
                    node.children.push(childNode);
                });
        };

        return TrainingTreeNode;
    });
