'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingCustomizeController', function ($scope, $rootScope, $stateParams, $timeout, entity, Training,
                                                         TrainingTreeNode, TrainingCustomSlideNode, TrainingTreeUtil,
                                                         SlideTemplate, marked) {

        var onSaveFinished = function (result) {
            $scope.$emit('sdlctoolApp:trainingUpdate', result);
        };

        $scope.training = entity;
        $scope.firstTimeDrawingTree = true;
        $scope.disabledIcon = "glyphicon glyphicon-remove";

        $scope.load = function (id) {
            Training.get({id: id}, function(result) {
                $scope.training = result;
            });
        };
        $rootScope.$on('sdlctoolApp:trainingUpdate', function(event, result) {
            $scope.training = result;
        });

        $scope.slideEditor = function(state) {
            console.log("slideEditor set to "+state);
            if(state) {
                $("#editBlock").fadeIn();
                $("#previewBlock").fadeIn();
            } else {
                $("#editBlock").hide();
                $("#previewBlock").hide();
            }
        };

        $scope.slideEditor(false);

        // Tree selection callback (called when a node is selected)
        $("#tree").bind("select_node.jstree", function(evt, data) {
                //selected node object: data.inst.get_json()[0];
                $scope.selectedNodeJSTree = data;
                $scope.selectedNode = new TrainingTreeNode();
                $scope.selectedNode.fromJSON(data.node);
                // $scope.selectedNode = new TrainingTreeNode();
                // $scope.selectedNode.name = data.node.text;
                // $scope.selectedNode.node_type = data.node.type;

                var selectedNodeType = $scope.selectedNode.node_type;
                var selectedNodeName = $scope.selectedNode.text;

                if(selectedNodeType == "GeneratedSlideNode" || selectedNodeType == "CustomSlideNode") {
                    $scope.slideEditor(true);

                    $scope.updateSlidePreview(selectedNodeType == "GeneratedSlideNode");

                    if(selectedNodeType !== "CustomSlideNode") {
                        $('#slideTitle').prop('disabled', true);
                        $('#slideContent').prop('disabled', true);
                        $('#saveSlideButton').prop('disabled', true);
                        $('#updateSlideButton').prop('disabled', true);
                        // $('#customSlideWarning').fadeIn();
                    } else {
                        $('#slideTitle').prop('disabled', false);
                        $('#slideContent').prop('disabled', false);
                        $('#saveSlideButton').prop('disabled', false);
                        $('#updateSlideButton').prop('disabled', false);
                        // $('#customSlideWarning').hide();
                    }
                } else {
                    $scope.slideEditor(false);
                }
            }
        );

        $scope.saveSlide = function() {
            // rename node
            var tree = $('#tree').jstree(true);
            tree.rename_node(tree.get_selected(), $scope.selectedNode.name);

            // update content
            $scope.selectedNodeJSTree.node.data["content"] = $scope.selectedNode.content;

            TrainingTreeUtil.CustomSlideNode.query({id: $scope.selectedNodeJSTree.node.data.node_id}).$promise.then(function(customSlideNode) {
                customSlideNode.content = $scope.selectedNode.content;
                TrainingCustomSlideNode.update(customSlideNode, onSaveFinished);
            });
        };

        $scope.updateSlidePreview = function(writeback=false, parentName="") {
            if($scope.selectedNode.training_id == null || $scope.selectedNode.training_id.name == null )
                $scope.selectedNode.training_id = $scope.training;
            $scope.selectedNode.loadContent(parentName).then(function(content) {

                $scope.setSlidePreviewContent(content);
                if(writeback) {
                    $timeout(function() {
                        $scope.selectedNode.content = content;
                        $scope.$apply();
                    });
                }
            }, function(failed_reason) {
                console.error("failed to load content from slide: " + failed_reason);
                $scope.setSlidePreviewContent("");
            });
        };

        $scope.setSlidePreviewContent = function(content) {
            document.getElementById('previewFrameId').contentWindow.postMessage(
                JSON.stringify({
                    method: 'updateSlide',
                    args: [ marked(content) ]
                }), '*' );
        };

        var excludeItem = function(node) {
            var tree = $('#tree').jstree(true);
            tree.set_icon(node, $scope.disabledIcon);
            if(node.data == null) node.data = {};
            node.data["active"] = false;
            node.children.forEach(function(child_id) {
                var childNode = $('#tree').jstree(true).get_node(child_id);
                excludeItem(childNode);
            });
        };

        var includeItem = function(node) {
            var tree = $('#tree').jstree(true);
            tree.set_icon(node, $scope.treeNodeTypes[node.type].icon);
            if(node.data == null) node.data = {};
            node.data["active"] = true;
            node.children.forEach(function(child_id) {
                var childNode = $('#tree').jstree(true).get_node(child_id);
                includeItem(childNode);
            });
        };

        // Custom Menu
        var customMenu = function(node) {
            console.log("custom Menu", node);
            var tree = $('#tree').jstree(true);
            // The default set of all items
            var items = {
                // Some key
                create_branch : {
                    // The item label
                    "label"				: "Create Branch",
                    // The function to execute upon a click
                    "action"			: function (obj) {
                        var newChild = tree.create_node(node.id,
                            {
                                "text": "new Branch",
                                "type": "BranchNode"
                            }
                        );
                        tree.edit(newChild);
                        $scope.selectedNode.addBranchNode(newChild.text);
                        //TODO how to get the branchNodes new name?

                    },
                    // All below are optional
                    "_disabled"			: false,		// clicking the item won't do a thing
                    "_class"			: "class",	// class is applied to the item LI node
                    "separator_before"	: false,	// Insert a separator before the item
                    "separator_after"	: false,		// Insert a separator after the item
                    // false or string - if does not contain `/` - used as classname
                    "icon"				:  "glyphicon glyphicon-folder-open",
                    "submenu"			: {
                        /* Collection of objects (the same structure) */
                    }
                },
                insert_slide : {
                    // The item label
                    "label"				: "Insert Custom Slide",
                    // All below are optional
                    "_disabled"			: false,		// clicking the item won't do a thing
                    "_class"			: "class",	// class is applied to the item LI node
                    "separator_before"	: false,	// Insert a separator before the item
                    "separator_after"	: true,		// Insert a separator after the item
                    // false or string - if does not contain `/` - used as classname
                    "icon"				:  "glyphicon glyphicon-flash",
                    "submenu"			: {
                        empty: {
                            "label": "Empty Slide",
                            "separator_after": true,
                            icon: "glyphicon glyphicon-flash",
                            action: function(obj) {
                                var newChild = tree.create_node(node.id,
                                    {
                                        "text": "new Customslide",
                                        "type": "CustomSlideNode",
                                        "data": {
                                            "content": ""
                                        }
                                    }
                                );
                                tree.deselect_all();
                                tree.select_node(newChild);
                            }
                        },
                        template: {
                            "label": "Template",
                            "icon":  "glyphicon glyphicon-list-alt",
                            "submenu": $scope.slideTemplateSubMenu
                        }
                    }
                },
                /*
                 editItem: {
                 "label": "Edit",
                 "action": function (node) {},
                 "icon": "glyphicon glyphicon-edit"
                 },
                 */
                // cloneItem: {
                //     "label": "Clone",
                //     "action": function (node) {},
                //     "icon": "glyphicon glyphicon-duplicate"
                // },
                renameItem: { // The "rename" menu item
                    "label": "Rename",
                    "action": function (obj) {
                        tree.edit(node);
                    },
                    "icon": "glyphicon glyphicon-wrench"
                },
                deleteItem: {
                    "label": "Delete",
                    "action": function(obj) {
                        tree.delete_node(node);
                    },
                    "icon": "glyphicon glyphicon-remove-circle"
                },
                excludeItem: {
                    "label": "Exclude",
                    "action": function(obj) {
                        excludeItem(node);
                    },
                    "icon": "glyphicon glyphicon-remove"
                },
                includeItem: {
                    "label": "Include",
                    "action": function(obj) {
                        includeItem(node);
                    },
                    "icon": "glyphicon glyphicon-repeat"
                }
            };
            switch(node.type) {
                case "CustomSlideNode":
                    delete items.create_branch;
                    delete items.insert_slide;
                    delete items.renameItem;
                    delete items.includeItem;
                    delete items.excludeItem;
                    break;
                case "RootNode":
                    delete items.renameItem;
                    delete items.deleteItem;
                    // fallthrough!
                case "BranchNode":
                    delete items.includeItem;
                    delete items.excludeItem;
                    break;
                case "GeneratedSlideNode":
                case "RequirementNode":
                case "CategoryNode":
                    delete items.renameItem;
                    delete items.deleteItem;
                    if(node.data.active == null || node.data.active) {
                        delete items.includeItem;
                    } else {
                        delete items.excludeItem;
                    }
                    break;
            }
            return items;
        };

        $rootScope.createSlideTemplateSubMenu = function() {
            return new Promise(function(resolve, reject) {
                var result = {};
                SlideTemplate.query().$promise.then(function (slideTemplates) {
                    slideTemplates.forEach(function (slideTemplate) {
                        var subMenuEntry = {
                            "label": slideTemplate.name,
                            "icon": "glyphicon glyphicon-flash",
                            "action": function (obj) {
                                console.log("$scope.selectedNodeJSTree", $scope.selectedNodeJSTree);

                                var tree = $('#tree').jstree(true);
                                var newChild = tree.create_node($scope.selectedNodeJSTree.node.id,
                                    {
                                        "text": slideTemplate.name,
                                        "type": "CustomSlideNode",
                                        "data": {
                                            "content": slideTemplate.content
                                        }
                                    }
                                );
                                tree.deselect_all();
                                tree.select_node(newChild);
                            }
                        };
                        result["slideTemplate" + slideTemplate.id] = subMenuEntry;
                    });
                    $scope.slideTemplateSubMenu = result;
                    resolve();
                });
            });
        };

        $scope.treeNodeTypes = {
            // the default type
            "BranchNode": {
                "max_children": -1,
                "max_depth": -1,
                "valid_children": [
                    "BranchNode",
                    "CustomSlideNode"
                    // "GeneratedSlideNode",
                    // "CategoryNode",
                    // "RequirementNode"
                ],
                "create_node": true
            },
            "RootNode": {
                "max_children": -1,
                "max_depth": -1,
                "valid_children": [
                    "BranchNode",
                    "CustomSlideNode"
                ],
                "create_node": true
            },
            "GeneratedSlideNode": {
                "icon": "glyphicon glyphicon-file",
                "create_node": false,
                "valid_children": "none",
                "li_attr": {"class": "slide"}
            },
            "CustomSlideNode": {
                "icon": "jstree-file",
                "create_node": false,
                "valid_children": "none",
                "li_attr": {"class": "slide"}
            },
            "RequirementNode": {
                "icon": "glyphicon glyphicon-book",
                "create_node": false,
                "valid_children": [
                    "GeneratedSlideNode",
                    "CustomSlideNode",
                    "BranchNode"
                ],
                "li_attr": {"class": "slide"}
            },
            "CategoryNode": {
                "icon": "glyphicon glyphicon-folder-open",
                "valid_children:": [
                    "RequirementNode",
                    "CustomSlideNode",
                    "BranchNode"
                ]
            },
            "#" : {
                "max_children" : 1 // avoid dragging of elements on root level (next to the trainings root node)
            }
        };

        $rootScope.displayTree = function() {
            $rootScope.createSlideTemplateSubMenu().then(function() {
                var tree = $('#tree');
                if($scope.firstTimeDrawingTree) {
                    $('#tree').jstree({
                        'core': {
                            'check_callback': true,
                            'data': $rootScope.trainingTreeData
                        },
                        "plugins": ["contextmenu", "dnd", "types"],
                        "contextmenu": {items: customMenu},
                        "types": $scope.treeNodeTypes
                    });
                } else {
                    // if this is not the first time the tree is drawn, redraw it to update changes
                    tree.jstree(true).settings.core.data = $rootScope.trainingTreeData;
                    tree.jstree('refresh');
                }

                // overwrite icon for inactive nodes when tree is ready
                tree.bind('ready.jstree', function(event, data) {
                    $(tree.jstree().get_json(tree, {
                        flat: true
                    })).each(function(index, node) {
                        if(node.data.active == false)
                            tree.jstree(true).set_icon(node, $scope.disabledIcon);
                    });
                });
                $scope.firstTimeDrawingTree = false;
            });
        };

        $rootScope.getTreeJSON = function() {
            return $('#tree').jstree(true).get_json('#', {flat:false})[0];
        };
    });
