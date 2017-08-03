'use strict';

angular.module('sdlctoolApp')
    .controller('TrainingCustomizeController', function ($scope, $rootScope, $stateParams, entity, Training) {
        $scope.training = entity;
        $scope.firstTimeDrawingTree = true;

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

        // Tree selection binding
        $("#tree").bind(
            "select_node.jstree", function(evt, data){
                //selected node object: data.inst.get_json()[0];
                //selected node text: data.inst.get_json()[0].data

                $scope.selectedNode = new TrainingTreeNode();
                $scope.selectedNode.fromJSON(data.node);
                // $scope.selectedNode = new TrainingTreeNode();
                // $scope.selectedNode.name = data.node.text;
                // $scope.selectedNode.node_type = data.node.type;

                var selectedNodeType = $scope.selectedNode.node_type;
                var selectedNodeName = $scope.selectedNode.text;

                if(selectedNodeType == "GeneratedSlideNode" || selectedNodeType == "CustomSlideNode") {
                    $scope.slideEditor(true);

                    $scope.updateSlidePreview();

                    if(selectedNodeType !== "CustomSlideNode") {
                        $('#customSlideWarning').fadeIn();
                    } else {
                        $('#customSlideWarning').hide();
                    }
                } else {
                    $scope.slideEditor(false);
                }
            }
        );

        $scope.getParentNode = function() {
            //TODO
            return {'name': "parent name"};
        };

        $scope.updateSlidePreview = function() {
            $scope.selectedNode.loadContent().then(function(content) {
                $('#slidePreviewContent', frames['previewFrame'].document).html(content);
            }, function(failed_reason) {
                console.error("failed to load content from slide");
                $('#slidePreviewContent', frames['previewFrame'].document).html("");
            });

        };

        // Custom Menu
        var customMenu = function(node) {
            // The default set of all items
            var items = {
                // Some key
                create_branch : {
                    // The item label
                    "label"				: "Create Branch",
                    // The function to execute upon a click
                    "action"			: function (node) {},
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
                add_content : {
                    "label": "Add Option Column",
                    "icon": "glyphicon glyphicon-plus-sign",
                    "submenu": {
                        info: {"label": "More Information", icon: "glyphicon glyphicon-asterisk"},
                        motivation: {"label": "Motivation", icon: "glyphicon glyphicon-asterisk"},
                        test: {"label": "Test Case", icon: "glyphicon glyphicon-asterisk"}
                    }
                },
                insert_slide : {
                    // The item label
                    "label"				: "Insert Custom Slide",
                    // The function to execute upon a click
                    "action"			: function (node) {
                        console.log($('#tree'));
                        console.log($('#tree').jstree());
                    },
                    // All below are optional
                    "_disabled"			: false,		// clicking the item won't do a thing
                    "_class"			: "class",	// class is applied to the item LI node
                    "separator_before"	: false,	// Insert a separator before the item
                    "separator_after"	: true,		// Insert a separator after the item
                    // false or string - if does not contain `/` - used as classname
                    "icon"				:  "glyphicon glyphicon-flash",
                    "submenu"			: {
                        intro: {"label": "Empty Slide", "separator_after"	: true, icon: "glyphicon glyphicon-flash"},
                        template: {
                            "label": "Template",
                            "icon":  "glyphicon glyphicon-list-alt",
                            "submenu": {
                                tpl_table: {"label": "Table", icon: "glyphicon glyphicon-flash"},
                                tpl_image: {"label": "Image", icon: "glyphicon glyphicon-flash"},
                                tpl_text: {"label": "Text", icon: "glyphicon glyphicon-flash"},
                                tpl_demoIframe: {"label": "Demo with iframe", icon: "glyphicon glyphicon-flash"}
                            }
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
                cloneItem: {
                    "label": "Clone",
                    "action": function (node) {},
                    "icon": "glyphicon glyphicon-duplicate"
                },
                renameItem: { // The "rename" menu item
                    "label": "Rename",
                    "action": function (node) {},
                    "icon": "glyphicon glyphicon-wrench"
                },
                deleteItem: { // The "delete" menu item
                    "label": "Delete",
                    "action": function (node) {},
                    "icon": "glyphicon glyphicon-remove-circle"
                }
                /* MORE ENTRIES ... */
            };
            if (node.type !== "RequirementNode") {
                delete items.add_content;
            } else {
                delete items.renameItem;
            }
            // node.li_attr.class === "slide"
            if ((node.type === "GeneratedSlideNode") || (node.type === "CustomSlideNode")) {
                delete items.create_branch;
                delete items.insert_slide;
                delete items.renameItem;
                // items.deleteItem._disabled = true
            } else {
                //delete items.editItem;
                delete items.cloneItem;
            }
            return items;
        };

        $rootScope.displayTree = function() {
            if($scope.firstTimeDrawingTree) {
                $('#tree').jstree({
                    'core': {
                        'check_callback': true,
                        'data': $rootScope.trainingTreeData
                    },
                    "contextmenu": {items: customMenu},
                    "types": {
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
                        "RootNode": {
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
                            "li_attr": {"class": "slide"}
                        },
                        "CustomSlideNode": {
                            "icon": "glyphicon glyphicon-flash",
                            "create_node": false,
                            "valid_children": "none",
                            "li_attr": {"class": "slide"}
                        },
                        "RequirementNode": {
                            "icon": "glyphicon glyphicon-book",
                            "create_node": false,
                            "valid_children": "none",
                            "li_attr": {"class": "slide"}
                        },
                        "CategoryNode": {}
                    },
                    "plugins": ["contextmenu", "dnd", "types"]
                });
            } else {
                // if this is not the first time the tree is drawn, redraw it to update changes
                var tree = $('#tree');
                tree.jstree(true).settings.core.data = $rootScope.trainingTreeData;
                tree.jstree('refresh');
            }
            $scope.firstTimeDrawingTree = false;
        };

        $rootScope.getTreeJSON = function() {
            return $('#tree').jstree(true).get_json('#', {flat:false})[0];
        };
    });
