package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.appsec.securityRAT.repository.TrainingTreeNodeRepository;
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
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    @Inject
    private TrainingTreeNodeSearchRepository trainingTreeNodeSearchRepository;

    /**
     * POST  /trainingTreeNodes -> Create a new trainingTreeNode.
     */
    @RequestMapping(value = "/trainingTreeNodes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeNode> create(@RequestBody TrainingTreeNode trainingTreeNode) throws URISyntaxException {
        log.debug("REST request to save TrainingTreeNode : {}", trainingTreeNode);
        if (trainingTreeNode.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new trainingTreeNode cannot already have an ID").body(null);
        }
        TrainingTreeNode result = trainingTreeNodeRepository.save(trainingTreeNode);
        trainingTreeNodeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/trainingTreeNodes/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("trainingTreeNode", result.getId().toString()))
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
        if (trainingTreeNode.getId() == null) {
            return create(trainingTreeNode);
        }
        TrainingTreeNode result = trainingTreeNodeRepository.save(trainingTreeNode);
        trainingTreeNodeSearchRepository.save(trainingTreeNode);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingTreeNode", trainingTreeNode.getId().toString()))
                .body(result);
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

    /**
     * GET  /trainingTreeNodes/:id -> get the "id" trainingTreeNode.
     */
    @RequestMapping(value = "/trainingTreeNodes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingTreeNode> get(@PathVariable Long id) {
        log.debug("REST request to get TrainingTreeNode : {}", id);
        return Optional.ofNullable(trainingTreeNodeRepository.findOne(id))
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
        trainingTreeNodeRepository.delete(id);
        trainingTreeNodeSearchRepository.delete(id);
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
}
