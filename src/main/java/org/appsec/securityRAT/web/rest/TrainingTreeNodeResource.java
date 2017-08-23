package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.*;
import org.appsec.securityRAT.domain.enumeration.TrainingTreeNodeType;
import org.appsec.securityRAT.repository.*;
import org.appsec.securityRAT.repository.search.TrainingTreeNodeSearchRepository;
import org.appsec.securityRAT.web.rest.frontendApi.FrontEndUniversalResource;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.elasticsearch.cluster.ClusterState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.appsec.securityRAT.domain.enumeration.TrainingTreeNodeType.*;
import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing TrainingTreeNode.
 */
@RestController
@RequestMapping("/api")
public class TrainingTreeNodeResource {

    private final Logger log = LoggerFactory.getLogger(TrainingTreeNodeResource.class);

    @Inject
    private TrainingRepository trainingRepository;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    @Inject
    private TrainingTreeNodeSearchRepository trainingTreeNodeSearchRepository;

    @Inject
    private TrainingCustomSlideNodeRepository trainingCustomSlideNodeRepository;

    @Inject
    private TrainingGeneratedSlideNodeRepository trainingGeneratedSlideNodeRepository;

    @Inject
    private TrainingRequirementNodeRepository trainingRequirementNodeRepository;

    @Inject
    private TrainingBranchNodeRepository trainingBranchNodeRepository;

    @Inject
    private TrainingCategoryNodeRepository trainingCategoryNodeRepository;

    @Inject
    private OptColumnContentRepository optColumnContentRepository;

    @Inject
    private RequirementSkeletonRepository requirementSkeletonRepository;

    @Inject
    private ReqCategoryRepository reqCategoryRepository;

    @Inject
    private OptColumnRepository optColumnRepository;

    @Inject
    private CollectionInstanceRepository collectionInstanceRepository;

    @Inject
    private ProjectTypeRepository projectTypeRepository;

    // anchor = PARENT_ANCHOR means that the node is anchored on it's parent
    private static final int PARENT_ANCHOR = -2;
    // json_universal_id = -1 for an TrainingGeneratedSlideNode means that this is a skeleton slide
    private static final int SKELETON_UNIVERSAL_ID = -1;

    // comparator to sort nodes by their sort_order
    private class SortOrderComparator implements Comparator<TrainingTreeNode> {
        @Override
        public int compare(TrainingTreeNode o1, TrainingTreeNode o2) {
            if(o1.getSort_order() < o2.getSort_order())
                return -1;
            else if(o1.getSort_order() > o2.getSort_order())
                return 1;
            return 0;
        }
    }

    /**
     * POST  /trainingTreeNodes -> Create a new trainingTreeNode.
     */
    @RequestMapping(value = "/trainingTreeNodes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeNode> create(@RequestBody TrainingTreeNode trainingTreeNode) throws URISyntaxException {

        // fetch the related training because the json format only contains it's id
        if(trainingTreeNode.getNode_type() == TrainingTreeNodeType.RootNode) {
            Training training = trainingRepository.findOne(trainingTreeNode.getJson_training_id());
            trainingTreeNode.setTraining_id(training);
        }
        if(trainingTreeNode.getActive() == null)
            trainingTreeNode.setActive(true);

        TrainingTreeNode result = trainingTreeNodeRepository.save(trainingTreeNode);
        trainingTreeNodeSearchRepository.save(result);

        // create special node entities
        switch(trainingTreeNode.getNode_type()) {
            case CustomSlideNode:
                TrainingCustomSlideNode customSlideNode = new TrainingCustomSlideNode();
                customSlideNode.setNode(trainingTreeNode);
                customSlideNode.setName(trainingTreeNode.getName());
                customSlideNode.setAnchor(trainingTreeNode.getAnchor());
                customSlideNode.setContent(trainingTreeNode.getContent());
                trainingCustomSlideNodeRepository.save(customSlideNode);
                break;
            case BranchNode:
                TrainingBranchNode branchNode = new TrainingBranchNode();
                branchNode.setNode(trainingTreeNode);
                branchNode.setAnchor(trainingTreeNode.getAnchor());
                branchNode.setName(trainingTreeNode.getName());
                trainingBranchNodeRepository.save(branchNode);
                break;
            case CategoryNode:
                TrainingCategoryNode categoryNode = new TrainingCategoryNode();
                categoryNode.setNode(trainingTreeNode);
                Long categoryId = trainingTreeNode.getJson_universal_id();
                ReqCategory category = null;
                if(categoryId != null)
                    category = reqCategoryRepository.findOne(categoryId);
                categoryNode.setCategory(category);
                trainingCategoryNodeRepository.save(categoryNode);
                break;
            case RequirementNode:
                TrainingRequirementNode requirementNode = new TrainingRequirementNode();
                requirementNode.setNode(trainingTreeNode);
                Long requirementId = trainingTreeNode.getJson_universal_id();
                RequirementSkeleton skeleton = null;
                if(requirementId != null)
                    skeleton = requirementSkeletonRepository.findOne(requirementId);
                requirementNode.setRequirementSkeleton(skeleton);
                trainingRequirementNodeRepository.save(requirementNode);
                break;
            case GeneratedSlideNode:
                TrainingGeneratedSlideNode generatedSlideNode = new TrainingGeneratedSlideNode();
                generatedSlideNode.setNode(trainingTreeNode);
                Long optColumnId = trainingTreeNode.getJson_universal_id();
                OptColumn optColumn = null;
                if(optColumnId != null && optColumnId >= 0)
                    optColumn = optColumnRepository.findOne(optColumnId);
                generatedSlideNode.setOptColumn(optColumn);
                trainingGeneratedSlideNodeRepository.save(generatedSlideNode);
                break;
        }

        int sort_order = 0;
        Training training = result.getTraining_id();
        for(TrainingTreeNode child : trainingTreeNode.getChildren()) {
            child.setParent_id(result);
            child.setTraining_id(training);
            child.setSort_order(sort_order++);
            create(child);
        }

        return ResponseEntity.created(new URI("/api/trainingTreeNodes/" + result.getId()))
            .headers(new HttpHeaders())
            .body(result);
    }

    /**
     * PUT  /trainingTreeNodes -> Updates an existing trainingTreeNode.
     */
    @RequestMapping(value = "/trainingTreeNodes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeNode> update(@RequestBody TrainingTreeNode trainingTreeNode) throws URISyntaxException {
        log.debug("REST request to update TrainingTreeNode : {}", trainingTreeNode);

        Training training = trainingRepository.findOne(trainingTreeNode.getJson_training_id());
        TrainingTreeNode oldTree = trainingTreeNodeRepository.getTrainingRoot(training);

        // 1. save the new tree to db
        trainingTreeNode.setId(null);
        TrainingTreeNode newTree = create(trainingTreeNode).getBody();

        // 2. delete the old tree
        delete(oldTree.getId());

        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingTreeNode", trainingTreeNode.getId().toString()))
                .body(newTree);
    }

    /**
     * GET  /trainingTreeNodeUpdate/{id} -> apply structural updates to the subtree
     *  return info if structural updates were applied
     */
    @RequestMapping(value = "/trainingTreeNodeUpdate/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeStatus> updateTree(@PathVariable Long id) {
        log.debug("REST request to apply structural updates to TrainingTreeNode : {} and subtree", id);
        TrainingTreeNode trainingTreeNode = trainingTreeNodeRepository.findOne(id);

        Training training = trainingTreeNode.getTraining_id();
        // build categories with requirements for selection
        List<CollectionInstance> collectionInstances = new ArrayList<>();
        List<ProjectType> projectTypes = new ArrayList<>();
        if(training.getAllRequirementsSelected()) {
            collectionInstances = collectionInstanceRepository.findAll();
            projectTypes = projectTypeRepository.findAll();
        } else {
            collectionInstances.addAll(training.getCollections());
            projectTypes.addAll(training.getProjectTypes());
            if(projectTypes.size() == 0)
                projectTypes = projectTypeRepository.findAll();
        }
        List<ReqCategory> reqCategories = reqCategoryRepository.findEagerlyCategoriesWithRequirements(collectionInstances, projectTypes);

        boolean hasUpdates = updateSubTree(trainingTreeNode, reqCategories);

        TrainingTreeStatus result = new TrainingTreeStatus();
        result.setHasUpdates(hasUpdates);
        return Optional.ofNullable(result)
            .map(bool -> new ResponseEntity<>(
                bool,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /*
        helper function "order_children":
        combines separate lists of a) customNodes and b) databaseNodes, which together are a complete list of children
        of a parent node

        expected input:
            * customNodes contains all CustomSlidesNodes and BranchNodes, mapped by their anchor
                Value-Lists don't have to be sorted
            * databaseNodes contains all Nodes with database links. The IDs must be set into their
                property 'json_universal_id'
        returns:
            * the list with children as one in new order
            * null if both input lists are null
     */

    List<TrainingTreeNode> reorder_children(
        TreeMap<Integer, List<TrainingTreeNode>> customNodes,
        TreeMap<Integer, TrainingTreeNode> databaseNodes) {

        if(customNodes == null && databaseNodes == null)
            return null;

        ArrayList<TrainingTreeNode> result = new ArrayList<>();

        List<TrainingTreeNode> parentAnchored = null;
        if(customNodes != null) {
            parentAnchored = customNodes.get(PARENT_ANCHOR);
            if (parentAnchored != null && parentAnchored.size() > 0) {
                parentAnchored.sort(new SortOrderComparator());
                for (TrainingTreeNode nextCustomNode : parentAnchored) {
                    result.add(nextCustomNode);
                }
                customNodes.remove(PARENT_ANCHOR);
            }
        }
        Map.Entry<Integer, TrainingTreeNode> nextDatabaseNodeEntry = databaseNodes.firstEntry();
        while(nextDatabaseNodeEntry != null) {
            result.add(nextDatabaseNodeEntry.getValue());

            // now, add custom nodes which are anchored here (ordered by sort_order)
            if(customNodes != null && customNodes.size() > 0) {
                Long universal_id = nextDatabaseNodeEntry.getValue().getJson_universal_id();
                if(universal_id != null) {
                    int anchor = Math.toIntExact(universal_id);
                    List<TrainingTreeNode> anchoredHere = customNodes.get(anchor);
                    if(anchoredHere != null && anchoredHere.size() > 0) {
                        anchoredHere.sort(new SortOrderComparator());
                        for(TrainingTreeNode nextCustomNode : anchoredHere) {
                            result.add(nextCustomNode);
                        }
                        customNodes.remove(anchor);
                    }
                }
            }
            databaseNodes.remove(nextDatabaseNodeEntry.getKey());
            nextDatabaseNodeEntry = databaseNodes.firstEntry();
        }

        return result;
    }

    boolean updateSubTree(TrainingTreeNode trainingTreeNode, List<ReqCategory> reqCategories) {
        boolean hasUpdates = false;

        List<TrainingTreeNode> children = trainingTreeNodeRepository.getChildrenOf(trainingTreeNode);
        TreeMap<Integer, List<TrainingTreeNode>> customNodes = new TreeMap<>();
        TreeMap<Integer, TrainingTreeNode> databaseNodes = new TreeMap<>();
        for(TrainingTreeNode child : children) {
            TrainingTreeNodeType child_type = child.getNode_type();
            if(child_type == CustomSlideNode) {
                Integer anchor = trainingCustomSlideNodeRepository
                    .getTrainingCustomSlideNodeByTrainingTreeNode(child)
                    .getAnchor();
                if(anchor == null)
                    anchor = 0;
                if(customNodes.get(anchor) == null)
                    customNodes.put(anchor, new ArrayList<>());
                customNodes.get(anchor).add(child);
            }
            else if(child_type == BranchNode) {
                Integer anchor = trainingBranchNodeRepository
                    .getTrainingBranchNodeByTrainingTreeNode(child)
                    .getAnchor();
                if(anchor == null)
                    anchor = 0;
                if(customNodes.get(anchor) == null)
                    customNodes.put(anchor, new ArrayList<>());
                customNodes.get(anchor).add(child);
            }
            else if(child_type == CategoryNode) {
                TrainingCategoryNode categoryNode = trainingCategoryNodeRepository
                    .getTrainingCategoryNodeByTrainingTreeNode(child);
                child.setJson_universal_id(categoryNode.getCategory().getId());
                databaseNodes.put(categoryNode.getCategory().getShowOrder(), child);
            }
            else if(child_type == RequirementNode) {
                TrainingRequirementNode requirementNode = trainingRequirementNodeRepository
                    .getTrainingRequirementNodeByTrainingTreeNode(child);
                child.setJson_universal_id(requirementNode.getRequirementSkeleton().getId());
                databaseNodes.put(requirementNode.getRequirementSkeleton().getShowOrder(), child);
            }
            else if(child_type == GeneratedSlideNode) {
                TrainingGeneratedSlideNode generatedSlideNode = trainingGeneratedSlideNodeRepository
                    .getTrainingGeneratedSlideNodeByTrainingTreeNode(child);
                if(generatedSlideNode.getOptColumn() == null)
                    child.setJson_universal_id(new Long(SKELETON_UNIVERSAL_ID));
                else
                    child.setJson_universal_id(generatedSlideNode.getOptColumn().getId());
                Integer showOrder = 0;
                if(generatedSlideNode.getOptColumn() != null)
                    showOrder = generatedSlideNode.getOptColumn().getShowOrder();
                databaseNodes.put(showOrder, child);
            }
        }

        if(databaseNodes.size() > 0) {
            List<TrainingTreeNode> childrenNewOrder;

            switch (trainingTreeNode.getNode_type()) {
                case BranchNode:

                    // fetch category nodes inside this branch
                    List<TrainingCategoryNode> categoryNodes = new ArrayList<>();
                    for(TrainingTreeNode databaseNode : databaseNodes.values()) {
                        categoryNodes.add(trainingCategoryNodeRepository.getTrainingCategoryNodeByTrainingTreeNode(databaseNode));
                    }

                    // search for each selected category and delete / add to match the lists
                    for(ReqCategory selectedCategory : reqCategories) {
                        boolean foundSelectedCategory = false;
                        TrainingCategoryNode foundNode = null;
                        for(TrainingCategoryNode categoryNode : categoryNodes) {
                            if(categoryNode.getCategory().getId().equals(selectedCategory.getId())) {
                                foundSelectedCategory = true;
                                foundNode = categoryNode;
                                break;
                            }
                        }
                        if(foundSelectedCategory) {
                            categoryNodes.remove(foundNode); // no need to check this node again
                        } else {
                            hasUpdates = true;
                            // add the missing category to the database
                            TrainingTreeNode new_baseNode = new TrainingTreeNode();
                            new_baseNode.setNode_type(CategoryNode);

                            int nextSortOrder = trainingTreeNodeRepository.getHighestSortOrder(trainingTreeNode.getId()) + 1;
                            new_baseNode.setSort_order(nextSortOrder);
                            new_baseNode.setActive(true);
                            new_baseNode.setParent_id(trainingTreeNode);
                            new_baseNode.setTraining_id(trainingTreeNode.getTraining_id());
                            trainingTreeNodeRepository.save(trainingTreeNode);
                            TrainingCategoryNode new_categoryNode = new TrainingCategoryNode();
                            new_categoryNode.setNode(new_baseNode);
                            new_categoryNode.setCategory(selectedCategory);
                            trainingCategoryNodeRepository.save(new_categoryNode);

                            databaseNodes.put(nextSortOrder, new_baseNode);

                        }
                    }
                    if(categoryNodes.size() > 0) {
                        hasUpdates = true;
                        for(TrainingCategoryNode categoryNodeToRemove : categoryNodes) {
                            TrainingTreeNode baseNode = categoryNodeToRemove.getNode();
                            List<TrainingTreeNode> childrenOfNode = trainingTreeNodeRepository.getChildrenOf(baseNode);
                            if(childrenOfNode.size() == 0) {
                                // category is empty and can be removed
                                trainingTreeNodeRepository.delete(baseNode);
                                trainingCategoryNodeRepository.delete(categoryNodeToRemove);
                            }
                        }
                    }

                    childrenNewOrder = reorder_children(customNodes, databaseNodes);

                    // update sort_order in database
                    int new_sortOrder = 0;
                    for(TrainingTreeNode child : childrenNewOrder) {
                        if(child.getSort_order() != new_sortOrder)
                            hasUpdates = true;
                        child.setSort_order(new_sortOrder++);
                        trainingTreeNodeRepository.save(child);
                    }

                    break;
                case CategoryNode:
                    //TODO check if requirement subset changed
                    break;
                case RequirementNode:
                    //TODO check if optcolumn subset changed
                    break;
            }

        }

        // process children recursively
        for(TrainingTreeNode child : children) {
            TrainingTreeNodeType node_type = child.getNode_type();
            if(node_type == BranchNode || node_type == CategoryNode || node_type == RequirementNode) {
                if(updateSubTree(child, reqCategories)) {
                    hasUpdates = true;
                }
            }
        }

        return hasUpdates;
    }

    /**
     * GET  /trainingTreeNodes -> get all the trainingTreeNodes.
     */
    @RequestMapping(value = "/trainingTreeNodes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingTreeNode> getAll() {
        log.debug("REST request to get all TrainingTreeNodes");
        return trainingTreeNodeRepository.findAll();
    }

    TrainingTreeNode getSubTreeById(Long id, boolean prepareContent, boolean includeIds, String parentName) {
        TrainingTreeNode result = trainingTreeNodeRepository.findOne(id);

        // add reverse relations
        switch(result.getNode_type()) {
            case CustomSlideNode:
                TrainingCustomSlideNode customSlideNode = trainingCustomSlideNodeRepository.getTrainingCustomSlideNodeByTrainingTreeNode(result);
                if(customSlideNode != null) {
                    result.setName(customSlideNode.getName());
                    result.setAnchor(customSlideNode.getAnchor());

                    String customSlideContent = customSlideNode.getContent();
                    if (prepareContent && customSlideContent != null) {
                        Training training = result.getTraining_id();
                        if (training != null && training.getName() != null)
                            customSlideContent = customSlideContent.replaceAll("(\\{{2} *training.name *}{2})", training.getName());
                        TrainingTreeNode parent = result.getParent_id();
                        if (parent != null && (parent.getName() != null || parentName != null)) {
                            String parentNameFromDb = parent.getName();
                            parentName = parentNameFromDb != null ? parentNameFromDb : parentName;
                            customSlideContent = customSlideContent.replaceAll("(\\{{2} *parent.name *}{2})", parentName);
                        }
                    }
                    result.setContent(customSlideContent);
                }
                break;
            case BranchNode:
                TrainingBranchNode branchNode = trainingBranchNodeRepository.getTrainingBranchNodeByTrainingTreeNode(result);
                if(branchNode != null) {
                    result.setName(branchNode.getName());
                    result.setAnchor(branchNode.getAnchor());
                }
                break;
            case RequirementNode:
                TrainingRequirementNode requirementNode = trainingRequirementNodeRepository.getTrainingRequirementNodeByTrainingTreeNode(result);
                if(requirementNode != null) {
                    Long requirement_id = requirementNode.getRequirementSkeleton().getId();
                    RequirementSkeleton requirementSkeleton = requirementSkeletonRepository.findOneWithEagerRelationships(requirement_id);
                    result.setName(requirementSkeleton.getShortName());
                    if(includeIds)
                        result.setJson_universal_id(requirement_id);
                }
                break;
            case GeneratedSlideNode:
                TrainingGeneratedSlideNode generatedSlideNode = trainingGeneratedSlideNodeRepository.getTrainingGeneratedSlideNodeByTrainingTreeNode(result);
                if(generatedSlideNode != null) {
                    String generatedSlideName = "";
                    String generatedSlideContent = "";

                    TrainingTreeNode parent = result.getParent_id();
                    if(parent != null) {
                        TrainingRequirementNode requirementNodeOfParent = trainingRequirementNodeRepository.getTrainingRequirementNodeByTrainingTreeNode(parent);
                        RequirementSkeleton skeleton = requirementSkeletonRepository.findOne(requirementNodeOfParent.getRequirementSkeleton().getId());
                        if(skeleton != null) {
                            OptColumn optColumn = generatedSlideNode.getOptColumn();

                            if(optColumn == null) {
                                generatedSlideName = "Skeleton";
                                if(prepareContent) {
                                    generatedSlideContent = "<h2>" + skeleton.getShortName() + "</h2>"
                                        + skeleton.getDescription();
                                }
                                if(includeIds)
                                    result.setJson_universal_id(new Long(SKELETON_UNIVERSAL_ID));
                            } else {
                                generatedSlideName = optColumn.getName();
                                if(prepareContent) {
                                    List<OptColumnContent> optColumnContents =
                                        optColumnContentRepository.getOptColumnContentByOptColumnAndRequirement(
                                            skeleton,
                                            optColumn
                                        );
                                    if(optColumnContents != null && optColumnContents.size() > 1) {
                                        OptColumnContent optColumnContent = optColumnContents.get(0);
                                        if (optColumn != null && optColumnContent != null) {
                                            generatedSlideContent = "<h3>" + optColumn.getName() + "</h3>"
                                                + optColumnContent.getContent();
                                        }
                                    }
                                }
                                if(includeIds)
                                    result.setJson_universal_id(generatedSlideNode.getOptColumn().getId());
                            }
                            result.setContent(generatedSlideContent);
                        }
                    }
                    result.setName(generatedSlideName);
                }
                break;
            case CategoryNode:
                TrainingCategoryNode categoryNode = trainingCategoryNodeRepository.getTrainingCategoryNodeByTrainingTreeNode(result);
                if(categoryNode != null) {
                    Long category_id = categoryNode.getCategory().getId();
                    ReqCategory category = reqCategoryRepository.findOne(category_id);
                    if(category != null) {
                        result.setName(category.getName());
                    }
                    if(includeIds)
                        result.setJson_universal_id(category_id);
                }
                break;
            case RootNode:
                result.setJson_training_id(result.getTraining_id().getId());
                break;
        }

        List<TrainingTreeNode> children = trainingTreeNodeRepository.getChildrenOf(result);
        List<TrainingTreeNode> childrenResult = new ArrayList<>();
        for(TrainingTreeNode child : children) {
            TrainingTreeNode childNode = getSubTreeById(child.getId(), prepareContent, includeIds, result.getName());
            childNode.setParent_id(result);
            childrenResult.add(childNode);
        }
        result.setChildren(childrenResult);

        return result;
    }

    /**
     * GET  /trainingTreeNodes/:id -> get the "id" trainingTreeNode.
     */
    @RequestMapping(value = "/trainingTreeNodes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeNode> get(@PathVariable Long id) {
        log.debug("REST request to get TrainingTreeNode : {}", id);

        TrainingTreeNode result = getSubTreeById(id, false, true, null);

        return Optional.ofNullable(result)
            .map(trainingTreeNode -> new ResponseEntity<>(
                trainingTreeNode,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET  /trainingTreeNodesWithPreparedContent/:id -> get the "id" trainingTreeNode with prepared contents.
     */
    @RequestMapping(value = "/trainingTreeNodesWithPreparedContent/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeNode> getWithContent(@PathVariable Long id) {
        log.debug("REST request to get TrainingTreeNode : {}", id);

        TrainingTreeNode result = getSubTreeById(id, true, false, null);

        return Optional.ofNullable(result)
            .map(trainingTreeNode -> new ResponseEntity<>(
                trainingTreeNode,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    /**
     * DELETE  /trainingTreeNodes/:id -> delete the "id" trainingTreeNode.
     */
    @RequestMapping(value = "/trainingTreeNodes/{id}",
        method = RequestMethod.DELETE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TrainingTreeNode : {}", id);

        TrainingTreeNode trainingTreeNode = trainingTreeNodeRepository.findOne(id);

        // delete special table entry
        deleteSpecialTableEntry(trainingTreeNode);

        // delete children
        for(TrainingTreeNode childNode : trainingTreeNodeRepository.getChildrenOf(trainingTreeNode)) {
            delete(childNode.getId());
        }

        trainingTreeNodeRepository.delete(id);
        trainingTreeNodeSearchRepository.delete(id);

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("trainingTreeNode", id.toString())).build();
    }


    private void deleteSpecialTableEntry(TrainingTreeNode trainingTreeNode) {
        switch(trainingTreeNode.getNode_type()) {
            case BranchNode:
                TrainingBranchNode branchNode = trainingBranchNodeRepository.getTrainingBranchNodeByTrainingTreeNode(trainingTreeNode);
                trainingBranchNodeRepository.delete(branchNode.getId());
                break;
            case CustomSlideNode:
                TrainingCustomSlideNode customSlideNode = trainingCustomSlideNodeRepository.getTrainingCustomSlideNodeByTrainingTreeNode(trainingTreeNode);
                trainingCustomSlideNodeRepository.delete(customSlideNode);
                break;
            case CategoryNode:
                TrainingCategoryNode categoryNode = trainingCategoryNodeRepository.getTrainingCategoryNodeByTrainingTreeNode(trainingTreeNode);
                trainingCategoryNodeRepository.delete(categoryNode);
                break;
            case RequirementNode:
                TrainingRequirementNode requirementNode = trainingRequirementNodeRepository.getTrainingRequirementNodeByTrainingTreeNode(trainingTreeNode);
                trainingRequirementNodeRepository.delete(requirementNode);
                break;
            case GeneratedSlideNode:
                TrainingGeneratedSlideNode generatedSlideNode = trainingGeneratedSlideNodeRepository.getTrainingGeneratedSlideNodeByTrainingTreeNode(trainingTreeNode);
                trainingGeneratedSlideNodeRepository.delete(generatedSlideNode);
                break;
        }
    }

    /**
     * SEARCH  /_search/trainingTreeNodes/:query -> search for the trainingTreeNode corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/trainingTreeNodes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingTreeNode> search(@PathVariable String query) {
        return StreamSupport
            .stream(trainingTreeNodeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }

    /**
     * Get the rootNode of a training
     */
    @RequestMapping(value = "/TrainingTreeNode/rootNode/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeNode> getTrainingRoot(@PathVariable Long id) {
        log.debug("REST request to get the rootNode of the training with id : {}", id);
        Training training = trainingRepository.getOne(id);
        TrainingTreeNode result = trainingTreeNodeRepository.getTrainingRoot(training);
        return ResponseEntity.ok()
            .headers(new HttpHeaders())
            .body(result);
    }

    /**
     * Get all children of a trainingTreeNode
     */
    @RequestMapping(value = "/TrainingTreeNode/childrenOf/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<TrainingTreeNode>> getChildrenOf(@PathVariable Long id) {
        log.debug("REST request to get all children of TrainingTreeNode with id : {}", id);
        TrainingTreeNode node = trainingTreeNodeRepository.getOne(id);
        List<TrainingTreeNode> result = trainingTreeNodeRepository.getChildrenOf(node);
        return ResponseEntity.ok()
            .headers(new HttpHeaders())
            .body(result);
    }
}
