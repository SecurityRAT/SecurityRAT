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
        $scope.disableSaveSlideButton = false; // if true, the saveSlide button gets disabled
        $scope.showPreview = false;

        $scope.load = function (id) {
            Training.get({ id: id }, function (result) {
                $scope.training = result;
            });
        };

        $scope.updateEditableSlides = function () {
            $scope.disableSaveSlideButton = false;
            $scope.updateSlidePreview(false, '');
        };

        $scope.slideEditor = function (state) {
            if (state) {
                $("#editBlock").fadeIn();
                $("#previewBlock").fadeIn();
                // $scope.showPreview = true;
            } else {
                $("#editBlock").hide();
                $("#previewBlock").hide();
                // $scope.showPreview = false;
            }
        };

        $scope.slideEditor(false);

        var tree = $("#tree");
        // Tree selection callback (called when a node is selected)
        tree.bind("select_node.jstree", function (evt, data) {
            $scope.selectedNodeJSTree = data;
            $scope.selectedNode = new TrainingTreeNode();
            $scope.selectedNode.fromJSON(data.node);
            $scope.$apply();
            //selected node object: data.inst.get_json()[0];

            var selectedNodeType = $scope.selectedNode.node_type;

            if (selectedNodeType == "GeneratedSlideNode" || selectedNodeType == "CustomSlideNode") {
                $scope.slideEditor(true);

                $scope.updateSlidePreview(selectedNodeType == "GeneratedSlideNode", "");

                if (selectedNodeType !== "CustomSlideNode") {
                    $('#slideTitle').prop('disabled', true);
                    $('#slideContent').prop('disabled', true);
                    $('#saveSlideButton').prop('disabled', true);
                    // $('#updateSlideButton').prop('disabled', true);
                    // $('#customSlideWarning').fadeIn();
                } else {
                    $('#slideTitle').prop('disabled', false);
                    $('#slideContent').prop('disabled', false);
                    $('#saveSlideButton').prop('disabled', false);
                    // $('#updateSlideButton').prop('disabled', false);
                    // $('#customSlideWarning').hide();
                }
            } else {
                $scope.slideEditor(false);
            }
        });

        tree.bind("rename_node.jstree", function (e, data) {
            if (data.node.data == null)
                data.node.data = {};
            data.node.data.name = data.text;
            $scope.updateParentName(data.node.children, data.text);
        });

        // callback on jstree's move_node event (triggered when a node was moved)
        tree.bind("move_node.jstree", function (e, data) {

            var node = data.node;
            var new_parent = tree.jstree(true).get_node(data.parent);
            var old_parent = tree.jstree(true).get_node(data.old_parent);

            // update parent
            var parent = new TrainingTreeNode();
            parent.fromJSON(new_parent);
            if (node.data == null)
                node.data = {};
            node.data.parent_id = parent;


            if (node.type === "CustomSlideNode" || node.type === "BranchNode") {
                // set new anchor
                var new_anchor = -2;
                if (new_parent.children != null) {
                    var previousChildren = [];
                    for (var i = 0; i < new_parent.children.length; i++) {
                        if (node.id != new_parent.children[i])
                            previousChildren.push(new_parent.children[i]);
                        else break;
                    }
                    previousChildren.forEach(function (child_id) {
                        var child_node = tree.jstree(true).get_node(child_id);
                        if (child_node.type === "CategoryNode" || child_node.type === "RequirementNode" || child_node.type === "GeneratedSlideNode") {
                            if (child_node.data.json_universal_id != null)
                                new_anchor = child_node.data.json_universal_id;
                        }
                    });
                } else {
                    console.error("error in move_node.jstree callback: new parent has no children");
                }
                node.data.anchor = new_anchor;
            } else if (node.type === "CategoryNode" || node.type === "RequirementNode" || node.type === "GeneratedSlideNode") {
                // find nodes with anchor on this node, and update their anchor
                // note: it makes no difference if old_parent == new_parent
                var thisAnchor = node.data.json_universal_id;
                if (thisAnchor !== null && old_parent.children !== null) {
                    var newAnchor = TrainingTreeNode.PARENT_ANCHOR;
                    old_parent.children.forEach(function (childId) {
                        var node = tree.jstree(true).get_node(childId);
                        if (node != null && node.data != null) {
                            if (node.type === "CustomSlideNode" || node.type === "BranchNode") {
                                if (node.data.anchor === thisAnchor)
                                    node.data.anchor = newAnchor;
                            } else if (node.type === "CategoryNode" || node.type === "RequirementNode" || node.type === "GeneratedSlideNode") {
                                // this anchor can be used for replacement as it is more recent
                                newAnchor = node.data.json_universal_id;
                            }
                        }
                    });
                }
            }

            // update slide content
            if (node.type === "CustomSlideNode" || node.type === "GeneratedSlideNode") {
                var nodeObj = new TrainingTreeNode();
                nodeObj.fromJSON(node);
                nodeObj.loadContent(new_parent.name).then(function (new_content) {

                    node.content = new_content;
                });
                nodeObj.parent_id = parent;
                nodeObj.loadContent(new_parent.name).then(function (content) {
                    $scope.setSlidePreviewContent(content);
                });
            }
        });

        $scope.saveSlide = function () {
            $stateParams.isDirty = true;
            // rename node
            var tree = $('#tree').jstree(true);
            var new_name = $scope.selectedNode.name;
            if (new_name.length > 20) {
                new_name = new_name.substr(0, 17);
                new_name += "...";
            }
            tree.rename_node(tree.get_selected(), new_name);

            // update content
            $scope.selectedNodeJSTree.node.data["content"] = $scope.selectedNode.content;
            $scope.selectedNodeJSTree.node.data["name"] = $scope.selectedNode.name;

            if ($scope.selectedNodeJSTree.node.data.node_id != null) {
                TrainingTreeUtil.CustomSlideNode.query({ id: $scope.selectedNodeJSTree.node.data.node_id }).$promise.then(function (customSlideNode) {
                    customSlideNode.content = $scope.selectedNode.content;
                    TrainingCustomSlideNode.update(customSlideNode, onSaveFinished).$promise.then(function () {
                        $scope.disableSaveSlideButton = true;
                    }, function () {
                        $scope.disableSaveSlideButton = false;
                    });
                }, function () {
                    $scope.disableSaveSlideButton = false;
                });
            }

            $stateParams.isDirty = true;
            if ($scope.selectedNode.node_type == "CustomSlideNode")
                $scope.updateSlidePreview(false, "");
        };

        $scope.updateParentName = function (node_ids, name) {
            var tree = $('#tree').jstree(true);
            node_ids.forEach(function (node_id) {
                var node = tree.get_node(node_id);
                node.data.parent_id.name = name;
            });
        };

        $scope.updateSlidePreview = function (writeback, parentName) {
            if ($scope.selectedNode.training_id == null || $scope.selectedNode.training_id.name == null)
                $scope.selectedNode.training_id = $scope.training;
            $scope.selectedNode.loadContent(parentName).then(function (content) {

                $scope.setSlidePreviewContent(content);
                if (writeback) {
                    $timeout(function () {
                        $scope.selectedNode.content = content;
                        $scope.$apply();
                    });
                }
            }, function (failed_reason) {
                console.error("failed to load content from slide: " + failed_reason);
                $scope.setSlidePreviewContent("");
            });
        };

        $scope.setSlidePreviewContent = function (content) {
            document.getElementById('previewFrameId').contentWindow.postMessage(
                JSON.stringify({
                    method: 'updateSlide',
                    args: [content !== null ? marked(content) : '']
                }), '*');
        };

        var excludeItem = function (node) {
            var tree = $('#tree').jstree(true);
            tree.set_icon(node, $scope.disabledIcon);
            if (node.data == null) node.data = {};
            node.data["active"] = false;
            node.children.forEach(function (child_id) {
                var childNode = $('#tree').jstree(true).get_node(child_id);
                excludeItem(childNode);
            });
        };

        var includeItem = function (node) {
            var tree = $('#tree').jstree(true);
            tree.set_icon(node, $scope.treeNodeTypes[node.type].icon);
            if (node.data == null) node.data = {};
            node.data["active"] = true;
            node.children.forEach(function (child_id) {
                var childNode = $('#tree').jstree(true).get_node(child_id);
                includeItem(childNode);
            });
        };

        // Custom Menu
        var customMenu = function (node) {
            var tree = $('#tree').jstree(true);
            // The default set of all items
            var items = {
                // Some key
                create_branch: {
                    // The item label
                    "label": "Create Branch",
                    // The function to execute upon a click
                    "action": function (obj) {
                        var newChild = tree.create_node(node.id,
                            {
                                "text": "new Branch",
                                "type": "BranchNode"
                            }
                        );
                        tree.edit(newChild);
                        $('.jstree-rename-input').attr('maxLength', 20);
                        $scope.selectedNode.addBranchNode(newChild.text);
                        //TODO how to get the branchNodes new name?

                    },
                    // All below are optional
                    "_disabled": false,		// clicking the item won't do a thing
                    "_class": "class",	// class is applied to the item LI node
                    "separator_before": false,	// Insert a separator before the item
                    "separator_after": false,		// Insert a separator after the item
                    // false or string - if does not contain `/` - used as classname
                    "icon": "glyphicon glyphicon-folder-open",
                    "submenu": {
                        /* Collection of objects (the same structure) */
                    }
                },
                insert_slide: {
                    // The item label
                    "label": "Insert Custom Slide",
                    // All below are optional
                    "_disabled": false,		// clicking the item won't do a thing
                    "_class": "class",	// class is applied to the item LI node
                    "separator_before": false,	// Insert a separator before the item
                    "separator_after": true,		// Insert a separator after the item
                    // false or string - if does not contain `/` - used as classname
                    "icon": "glyphicon glyphicon-flash",
                    "submenu": {
                        empty: {
                            "label": "Empty Slide",
                            "separator_after": true,
                            icon: "glyphicon glyphicon-flash",
                            action: function (obj) {
                                var parent = tree.get_node(tree.get_selected());
                                var newChild = tree.create_node(node.id,
                                    {
                                        "text": "new Customslide",
                                        "type": "CustomSlideNode",
                                        "data": {
                                            "name": "new Customslide",
                                            "content": "",
                                            "parent_id": { name: parent.text }
                                        }
                                    }
                                );
                                tree.deselect_all();
                                tree.select_node(newChild);
                            }
                        },
                        template: {
                            "label": "Template",
                            "icon": "glyphicon glyphicon-list-alt",
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
                        $('.jstree-rename-input').attr('maxLength', 20);
                    },
                    "icon": "glyphicon glyphicon-wrench"
                },
                deleteItem: {
                    "label": "Delete",
                    "action": function (obj) {
                        tree.delete_node(node);
                    },
                    "icon": "glyphicon glyphicon-remove-circle"
                },
                excludeItem: {
                    "label": "Exclude",
                    "action": function (obj) {
                        excludeItem(node);
                    },
                    "icon": "glyphicon glyphicon-remove"
                },
                includeItem: {
                    "label": "Include",
                    "action": function (obj) {
                        includeItem(node);
                    },
                    "icon": "glyphicon glyphicon-repeat"
                }
            };
            switch (node.type) {
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
                    delete items.create_branch;
                    delete items.insert_slide;
                    delete items.renameItem;
                    delete items.deleteItem;
                    if (node.data.active == null || node.data.active) {
                        delete items.includeItem;
                    } else {
                        delete items.excludeItem;
                    }
                    break;
                case "ContentNode":
                case "RequirementNode":
                case "CategoryNode":
                    delete items.renameItem;
                    delete items.deleteItem;
                    if (node.data.active == null || node.data.active) {
                        delete items.includeItem;
                    } else {
                        delete items.excludeItem;
                    }
                    break;
            }
            return items;
        };

        $rootScope.createSlideTemplateSubMenu = function () {
            return new Promise(function (resolve, reject) {
                var result = {};
                SlideTemplate.query().$promise.then(function (slideTemplates) {
                    slideTemplates.forEach(function (slideTemplate) {
                        var subMenuEntry = {
                            "label": slideTemplate.name,
                            "icon": "glyphicon glyphicon-flash",
                            "action": function (obj) {

                                var tree = $('#tree').jstree(true);
                                var parent = tree.get_node(tree.get_selected());
                                var newChild = tree.create_node($scope.selectedNodeJSTree.node.id,
                                    {
                                        "text": slideTemplate.name,
                                        "type": "CustomSlideNode",
                                        "data": {
                                            "content": slideTemplate.content,
                                            "name": slideTemplate.name,
                                            "parent_id": { name: parent.text }
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
                "li_attr": { "class": "slide" }
            },
            "CustomSlideNode": {
                "icon": "jstree-file",
                "create_node": false,
                "valid_children": "none",
                "li_attr": { "class": "slide" }
            },
            "RequirementNode": {
                "icon": "glyphicon glyphicon-book",
                "create_node": false,
                "valid_children": [
                    "GeneratedSlideNode",
                    "CustomSlideNode",
                    "BranchNode"
                ],
                "li_attr": { "class": "slide" }
            },
            "CategoryNode": {
                "icon": "glyphicon glyphicon-folder-open",
                "valid_children:": [
                    "RequirementNode",
                    "CustomSlideNode",
                    "BranchNode"
                ]
            },
            "ContentNode": {
                "valid_children": [
                    "BranchNode",
                    "CustomSlideNode",
                    "CategoryNode"
                ]
            },
            "#": {
                "max_children": 1, // avoid dragging of elements on root level (next to the trainings root node)
                "valid_children:": [
                    "RootNode"
                ]
            }
        };

        $rootScope.displayTree = function () {
            $rootScope.createSlideTemplateSubMenu().then(function () {
                var tree = $('#tree');
                if ($scope.firstTimeDrawingTree) {
                    $('#tree').jstree({
                        'core': {
                            'force_text': true,
                            'check_callback': function (operation, node, node_parent, node_position, more) {
                                var operation_allowed = true;
                                if (operation == "move_node") {
                                    // workaround to prevent moving of GeneratedSlideNodes into CategoryNodes
                                    if (node.type === "GeneratedSlideNode" && node_parent.type === "CategoryNode")
                                        operation_allowed = false;


                                    /*
                                       do not allow dragging of database-related nodes
                                       this prevents
                                        * that requirementNodes and GeneratedSlideNodes can be dragged into another category
                                          (which would break the training when updating)
                                        * that the user changes their order, which would then be detected as a structural
                                          change which needs to be updated
                                    */
                                    if (node.type === "CategoryNode"
                                        || node.type === "GeneratedSlideNode"
                                        || node.type === "RequirementNode")
                                        operation_allowed = false;
                                }
                                return operation_allowed;
                            },
                            'data': $rootScope.trainingTreeData
                        },
                        "dnd": {
                            check_while_dragging: true
                        },
                        "plugins": ["contextmenu", "dnd", "types"],
                        "contextmenu": { items: customMenu },
                        "types": $scope.treeNodeTypes
                    });
                } else {
                    // if this is not the first time the tree is drawn, redraw it to update changes
                    tree.jstree(true).settings.core.data = $rootScope.trainingTreeData;
                    tree.jstree('refresh');
                }
                $scope.showPreview = true;
                // overwrite icon for inactive nodes when tree is ready
                tree.bind('ready.jstree', function (event, data) {
                    $("#previewBlock").hide();
                    $(tree.jstree().get_json(tree, {
                        flat: true
                    })).each(function (index, node) {
                        if (node.data.active == false)
                            tree.jstree(true).set_icon(node, $scope.disabledIcon);
                    });
                });
                $scope.firstTimeDrawingTree = false;
            });
        };

        $rootScope.getTreeJSON = function () {
            return $('#tree').jstree(true).get_json('#', { flat: false })[0];
        };
    });
