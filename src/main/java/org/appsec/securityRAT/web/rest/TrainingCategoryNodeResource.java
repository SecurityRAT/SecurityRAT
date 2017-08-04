package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.TrainingCategoryNode;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.appsec.securityRAT.repository.TrainingCategoryNodeRepository;
import org.appsec.securityRAT.repository.TrainingTreeNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingCategoryNodeSearchRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing TrainingCategoryNode.
 */
@RestController
@RequestMapping("/api")
public class TrainingCategoryNodeResource {

    private final Logger log = LoggerFactory.getLogger(TrainingCategoryNodeResource.class);

    @Inject
    private TrainingCategoryNodeRepository trainingCategoryNodeRepository;

    @Inject
    private TrainingCategoryNodeSearchRepository trainingCategoryNodeSearchRepository;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    /**
     * POST  /trainingCategoryNodes -> Create a new trainingCategoryNode.
     */
    @RequestMapping(value = "/trainingCategoryNodes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCategoryNode> create(@RequestBody TrainingCategoryNode trainingCategoryNode) throws URISyntaxException {
        log.debug("REST request to save TrainingCategoryNode : {}", trainingCategoryNode);
        if (trainingCategoryNode.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new trainingCategoryNode cannot already have an ID").body(null);
        }
        TrainingCategoryNode result = trainingCategoryNodeRepository.save(trainingCategoryNode);
        trainingCategoryNodeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/trainingCategoryNodes/" + result.getId()))
                .headers(new HttpHeaders())
                .body(result);
    }

    /**
     * PUT  /trainingCategoryNodes -> Updates an existing trainingCategoryNode.
     */
    @RequestMapping(value = "/trainingCategoryNodes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCategoryNode> update(@RequestBody TrainingCategoryNode trainingCategoryNode) throws URISyntaxException {
        log.debug("REST request to update TrainingCategoryNode : {}", trainingCategoryNode);
        if (trainingCategoryNode.getId() == null) {
            return create(trainingCategoryNode);
        }
        TrainingCategoryNode result = trainingCategoryNodeRepository.save(trainingCategoryNode);
        trainingCategoryNodeSearchRepository.save(trainingCategoryNode);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingCategoryNode", trainingCategoryNode.getId().toString()))
                .body(result);
    }

    /**
     * GET  /trainingCategoryNodes -> get all the trainingCategoryNodes.
     */
    @RequestMapping(value = "/trainingCategoryNodes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingCategoryNode> getAll() {
        log.debug("REST request to get all TrainingCategoryNodes");
        return trainingCategoryNodeRepository.findAll();
    }

    /**
     * GET  /trainingCategoryNodes/:id -> get the "id" trainingCategoryNode.
     */
    @RequestMapping(value = "/trainingCategoryNodes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCategoryNode> get(@PathVariable Long id) {
        log.debug("REST request to get TrainingCategoryNode : {}", id);
        return Optional.ofNullable(trainingCategoryNodeRepository.findOne(id))
            .map(trainingCategoryNode -> new ResponseEntity<>(
                trainingCategoryNode,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /trainingCategoryNodes/:id -> delete the "id" trainingCategoryNode.
     */
    @RequestMapping(value = "/trainingCategoryNodes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TrainingCategoryNode : {}", id);
        trainingCategoryNodeRepository.delete(id);
        trainingCategoryNodeSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("trainingCategoryNode", id.toString())).build();
    }

    /**
     * SEARCH  /_search/trainingCategoryNodes/:query -> search for the trainingCategoryNode corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/trainingCategoryNodes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingCategoryNode> search(@PathVariable String query) {
        return StreamSupport
            .stream(trainingCategoryNodeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }

    /**
     * GET TrainingCategoryNode by its node_id
     */
    @RequestMapping(value = "/TrainingCategoryNodeByTrainingTreeNode/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCategoryNode> getTrainingCategoryNodeByTrainingTreeNode(@PathVariable Long id) {
        log.debug("REST request to get TrainingCategoryNode with node_id : {}", id);
        TrainingTreeNode node = trainingTreeNodeRepository.getOne(id);
        TrainingCategoryNode result = trainingCategoryNodeRepository.getTrainingCategoryNodeByTrainingTreeNode(node);
        return ResponseEntity.ok()
            .headers(new HttpHeaders())
            .body(result);
    }
}
