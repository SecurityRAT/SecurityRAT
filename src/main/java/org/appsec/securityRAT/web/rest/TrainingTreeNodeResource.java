package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.*;
import org.appsec.securityRAT.domain.enumeration.TrainingTreeNodeType;
import org.appsec.securityRAT.repository.*;
import org.appsec.securityRAT.repository.search.TrainingTreeNodeSearchRepository;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
        TrainingTreeNode result = trainingTreeNodeRepository.save(trainingTreeNode);
        trainingTreeNodeSearchRepository.save(result);

        // create special node entities
        switch(trainingTreeNode.getNode_type()) {
            case CustomSlideNode:
                TrainingCustomSlideNode customSlideNode = new TrainingCustomSlideNode();
                customSlideNode.setNode(trainingTreeNode);
                customSlideNode.setName(trainingTreeNode.getName());
                customSlideNode.setContent(trainingTreeNode.getContent());
                trainingCustomSlideNodeRepository.save(customSlideNode);
                break;
            case BranchNode:
                TrainingBranchNode branchNode = new TrainingBranchNode();
                branchNode.setNode(trainingTreeNode);
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
        trainingTreeNodeRepository.delete(oldTree.getId());

        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingTreeNode", trainingTreeNode.getId().toString()))
                .body(newTree);
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
                if(branchNode != null)
                    result.setName(branchNode.getName());
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
                                    result.setJson_universal_id(new Long(-1));
                            } else {
                                generatedSlideName = optColumn.getName();
                                if(prepareContent) {
                                    OptColumnContent optColumnContent =
                                        optColumnContentRepository.getOptColumnContentByOptColumnAndRequirement(
                                            skeleton,
                                            optColumn
                                        );
                                    if (optColumn != null && optColumnContent != null) {
                                        generatedSlideContent = "<h3>" + optColumn.getName() + "</h3>"
                                            + optColumnContent.getContent();
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

        trainingTreeNodeRepository.delete(id);
        trainingTreeNodeSearchRepository.delete(id);

        // delete special table entry
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

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("trainingTreeNode", id.toString())).build();
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
