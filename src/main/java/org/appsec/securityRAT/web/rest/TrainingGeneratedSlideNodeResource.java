package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.TrainingGeneratedSlideNode;
import org.appsec.securityRAT.domain.TrainingRequirementNode;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.appsec.securityRAT.repository.TrainingGeneratedSlideNodeRepository;
import org.appsec.securityRAT.repository.TrainingTreeNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingGeneratedSlideNodeSearchRepository;
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
 * REST controller for managing TrainingGeneratedSlideNode.
 */
@RestController
@RequestMapping("/api")
public class TrainingGeneratedSlideNodeResource {

    private final Logger log = LoggerFactory.getLogger(TrainingGeneratedSlideNodeResource.class);

    @Inject
    private TrainingGeneratedSlideNodeRepository trainingGeneratedSlideNodeRepository;

    @Inject
    private TrainingGeneratedSlideNodeSearchRepository trainingGeneratedSlideNodeSearchRepository;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    /**
     * POST  /trainingGeneratedSlideNodes -> Create a new trainingGeneratedSlideNode.
     */
    @RequestMapping(value = "/trainingGeneratedSlideNodes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingGeneratedSlideNode> create(@RequestBody TrainingGeneratedSlideNode trainingGeneratedSlideNode) throws URISyntaxException {
        log.debug("REST request to save TrainingGeneratedSlideNode : {}", trainingGeneratedSlideNode);
        if (trainingGeneratedSlideNode.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new trainingGeneratedSlideNode cannot already have an ID").body(null);
        }
        TrainingGeneratedSlideNode result = trainingGeneratedSlideNodeRepository.save(trainingGeneratedSlideNode);
        trainingGeneratedSlideNodeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/trainingGeneratedSlideNodes/" + result.getId()))
                .headers(new HttpHeaders())
                .body(result);
    }

    /**
     * PUT  /trainingGeneratedSlideNodes -> Updates an existing trainingGeneratedSlideNode.
     */
    @RequestMapping(value = "/trainingGeneratedSlideNodes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingGeneratedSlideNode> update(@RequestBody TrainingGeneratedSlideNode trainingGeneratedSlideNode) throws URISyntaxException {
        log.debug("REST request to update TrainingGeneratedSlideNode : {}", trainingGeneratedSlideNode);
        if (trainingGeneratedSlideNode.getId() == null) {
            return create(trainingGeneratedSlideNode);
        }
        TrainingGeneratedSlideNode result = trainingGeneratedSlideNodeRepository.save(trainingGeneratedSlideNode);
        trainingGeneratedSlideNodeSearchRepository.save(trainingGeneratedSlideNode);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingGeneratedSlideNode", trainingGeneratedSlideNode.getId().toString()))
                .body(result);
    }

    /**
     * GET  /trainingGeneratedSlideNodes -> get all the trainingGeneratedSlideNodes.
     */
    @RequestMapping(value = "/trainingGeneratedSlideNodes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingGeneratedSlideNode> getAll() {
        log.debug("REST request to get all TrainingGeneratedSlideNodes");
        return trainingGeneratedSlideNodeRepository.findAll();
    }

    /**
     * GET  /trainingGeneratedSlideNodes/:id -> get the "id" trainingGeneratedSlideNode.
     */
    @RequestMapping(value = "/trainingGeneratedSlideNodes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingGeneratedSlideNode> get(@PathVariable Long id) {
        log.debug("REST request to get TrainingGeneratedSlideNode : {}", id);
        return Optional.ofNullable(trainingGeneratedSlideNodeRepository.findOne(id))
            .map(trainingGeneratedSlideNode -> new ResponseEntity<>(
                trainingGeneratedSlideNode,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /trainingGeneratedSlideNodes/:id -> delete the "id" trainingGeneratedSlideNode.
     */
    @RequestMapping(value = "/trainingGeneratedSlideNodes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TrainingGeneratedSlideNode : {}", id);
        trainingGeneratedSlideNodeRepository.delete(id);
        trainingGeneratedSlideNodeSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("trainingGeneratedSlideNode", id.toString())).build();
    }

    /**
     * SEARCH  /_search/trainingGeneratedSlideNodes/:query -> search for the trainingGeneratedSlideNode corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/trainingGeneratedSlideNodes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingGeneratedSlideNode> search(@PathVariable String query) {
        return StreamSupport
            .stream(trainingGeneratedSlideNodeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }

    /**
     * GET TrainingGeneratedSlideNode by its node_id
     */
    @RequestMapping(value = "/TrainingGeneratedSlideNodeByTrainingTreeNode/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingGeneratedSlideNode> getTrainingGeneratedSlideNodeByTrainingTreeNode(@PathVariable Long id) {
        log.debug("REST request to get TrainingGeneratedSlideNode with node_id : {}", id);
        TrainingTreeNode node = trainingTreeNodeRepository.getOne(id);
        TrainingGeneratedSlideNode result = trainingGeneratedSlideNodeRepository.getTrainingGeneratedSlideNodeByTrainingTreeNode(node);
        return ResponseEntity.ok()
            .headers(new HttpHeaders())
            .body(result);
    }
}
