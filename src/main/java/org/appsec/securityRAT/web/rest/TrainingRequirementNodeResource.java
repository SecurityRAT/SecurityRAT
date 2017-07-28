package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.TrainingRequirementNode;
import org.appsec.securityRAT.repository.TrainingRequirementNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingRequirementNodeSearchRepository;
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
 * REST controller for managing TrainingRequirementNode.
 */
@RestController
@RequestMapping("/api")
public class TrainingRequirementNodeResource {

    private final Logger log = LoggerFactory.getLogger(TrainingRequirementNodeResource.class);

    @Inject
    private TrainingRequirementNodeRepository trainingRequirementNodeRepository;

    @Inject
    private TrainingRequirementNodeSearchRepository trainingRequirementNodeSearchRepository;

    /**
     * POST  /trainingRequirementNodes -> Create a new trainingRequirementNode.
     */
    @RequestMapping(value = "/trainingRequirementNodes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingRequirementNode> create(@RequestBody TrainingRequirementNode trainingRequirementNode) throws URISyntaxException {
        log.debug("REST request to save TrainingRequirementNode : {}", trainingRequirementNode);
        if (trainingRequirementNode.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new trainingRequirementNode cannot already have an ID").body(null);
        }
        TrainingRequirementNode result = trainingRequirementNodeRepository.save(trainingRequirementNode);
        trainingRequirementNodeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/trainingRequirementNodes/" + result.getId()))
                .headers(new HttpHeaders())
                .body(result);
    }

    /**
     * PUT  /trainingRequirementNodes -> Updates an existing trainingRequirementNode.
     */
    @RequestMapping(value = "/trainingRequirementNodes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingRequirementNode> update(@RequestBody TrainingRequirementNode trainingRequirementNode) throws URISyntaxException {
        log.debug("REST request to update TrainingRequirementNode : {}", trainingRequirementNode);
        if (trainingRequirementNode.getId() == null) {
            return create(trainingRequirementNode);
        }
        TrainingRequirementNode result = trainingRequirementNodeRepository.save(trainingRequirementNode);
        trainingRequirementNodeSearchRepository.save(trainingRequirementNode);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingRequirementNode", trainingRequirementNode.getId().toString()))
                .body(result);
    }

    /**
     * GET  /trainingRequirementNodes -> get all the trainingRequirementNodes.
     */
    @RequestMapping(value = "/trainingRequirementNodes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingRequirementNode> getAll() {
        log.debug("REST request to get all TrainingRequirementNodes");
        return trainingRequirementNodeRepository.findAll();
    }

    /**
     * GET  /trainingRequirementNodes/:id -> get the "id" trainingRequirementNode.
     */
    @RequestMapping(value = "/trainingRequirementNodes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingRequirementNode> get(@PathVariable Long id) {
        log.debug("REST request to get TrainingRequirementNode : {}", id);
        return Optional.ofNullable(trainingRequirementNodeRepository.findOne(id))
            .map(trainingRequirementNode -> new ResponseEntity<>(
                trainingRequirementNode,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /trainingRequirementNodes/:id -> delete the "id" trainingRequirementNode.
     */
    @RequestMapping(value = "/trainingRequirementNodes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TrainingRequirementNode : {}", id);
        trainingRequirementNodeRepository.delete(id);
        trainingRequirementNodeSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("trainingRequirementNode", id.toString())).build();
    }

    /**
     * SEARCH  /_search/trainingRequirementNodes/:query -> search for the trainingRequirementNode corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/trainingRequirementNodes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingRequirementNode> search(@PathVariable String query) {
        return StreamSupport
            .stream(trainingRequirementNodeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
