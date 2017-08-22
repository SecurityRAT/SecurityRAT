package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.TrainingBranchNode;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.appsec.securityRAT.repository.TrainingBranchNodeRepository;
import org.appsec.securityRAT.repository.TrainingTreeNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingBranchNodeSearchRepository;
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

import static org.elasticsearch.index.query.QueryBuilders.queryString;

/**
 * REST controller for managing TrainingBranchNode.
 */
@RestController
@RequestMapping("/api")
public class TrainingBranchNodeResource {

    private final Logger log = LoggerFactory.getLogger(TrainingBranchNodeResource.class);

    @Inject
    private TrainingBranchNodeRepository trainingBranchNodeRepository;

    @Inject
    private TrainingBranchNodeSearchRepository trainingBranchNodeSearchRepository;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    /**
     * POST  /trainingBranchNodes -> Create a new trainingBranchNode.
     */
    @RequestMapping(value = "/trainingBranchNodes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingBranchNode> create(@RequestBody TrainingBranchNode trainingBranchNode) throws URISyntaxException {
        log.debug("REST request to save TrainingBranchNode : {}", trainingBranchNode);
        if (trainingBranchNode.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new trainingBranchNode cannot already have an ID").body(null);
        }
        TrainingBranchNode result = trainingBranchNodeRepository.save(trainingBranchNode);
        trainingBranchNodeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/trainingBranchNodes/" + result.getId()))
                .headers(new HttpHeaders())
                .body(result);
    }

    /**
     * PUT  /trainingBranchNodes -> Updates an existing trainingBranchNode.
     */
    @RequestMapping(value = "/trainingBranchNodes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingBranchNode> update(@RequestBody TrainingBranchNode trainingBranchNode) throws URISyntaxException {
        log.debug("REST request to update TrainingBranchNode : {}", trainingBranchNode);
        if (trainingBranchNode.getId() == null) {
            return create(trainingBranchNode);
        }
        TrainingBranchNode result = trainingBranchNodeRepository.save(trainingBranchNode);
        trainingBranchNodeSearchRepository.save(trainingBranchNode);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingBranchNode", trainingBranchNode.getId().toString()))
                .body(result);
    }

    /**
     * GET  /trainingBranchNodes -> get all the trainingBranchNodes.
     */
    @RequestMapping(value = "/trainingBranchNodes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingBranchNode> getAll() {
        log.debug("REST request to get all TrainingBranchNodes");
        return trainingBranchNodeRepository.findAll();
    }

    /**
     * GET  /trainingBranchNodes/:id -> get the "id" trainingBranchNode.
     */
    @RequestMapping(value = "/trainingBranchNodes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingBranchNode> get(@PathVariable Long id) {
        log.debug("REST request to get TrainingBranchNode : {}", id);
        return Optional.ofNullable(trainingBranchNodeRepository.findOne(id))
            .map(trainingBranchNode -> new ResponseEntity<>(
                trainingBranchNode,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /trainingBranchNodes/:id -> delete the "id" trainingBranchNode.
     */
    @RequestMapping(value = "/trainingBranchNodes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TrainingBranchNode : {}", id);
        trainingBranchNodeRepository.delete(id);
        trainingBranchNodeSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("trainingBranchNode", id.toString())).build();
    }

    /**
     * SEARCH  /_search/trainingBranchNodes/:query -> search for the trainingBranchNode corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/trainingBranchNodes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingBranchNode> search(@PathVariable String query) {
        return StreamSupport
            .stream(trainingBranchNodeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }

    /**
     * GET TrainingBranchNode by its node_id
     */
    @RequestMapping(value = "/TrainingBranchNodeByTrainingTreeNode/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingBranchNode> getTrainingBranchNodeByTrainingTreeNode(@PathVariable Long id) {
        log.debug("REST request to get TrainingBranchNode with node_id : {}", id);
        TrainingTreeNode node = trainingTreeNodeRepository.getOne(id);
        TrainingBranchNode result = trainingBranchNodeRepository.getTrainingBranchNodeByTrainingTreeNode(node);
        return ResponseEntity.ok()
            .headers(new HttpHeaders())
            .body(result);
    }
}
