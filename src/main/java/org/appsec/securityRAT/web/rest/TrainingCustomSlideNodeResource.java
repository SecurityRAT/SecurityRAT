package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.TrainingCustomSlideNode;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.appsec.securityRAT.repository.TrainingCustomSlideNodeRepository;
import org.appsec.securityRAT.repository.TrainingTreeNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingCustomSlideNodeSearchRepository;
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
 * REST controller for managing TrainingCustomSlideNode.
 */
@RestController
@RequestMapping("/api")
public class TrainingCustomSlideNodeResource {

    private final Logger log = LoggerFactory.getLogger(TrainingCustomSlideNodeResource.class);

    @Inject
    private TrainingCustomSlideNodeRepository trainingCustomSlideNodeRepository;

    @Inject
    private TrainingCustomSlideNodeSearchRepository trainingCustomSlideNodeSearchRepository;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    /**
     * POST  /trainingCustomSlideNodes -> Create a new trainingCustomSlideNode.
     */
    @RequestMapping(value = "/trainingCustomSlideNodes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCustomSlideNode> create(@RequestBody TrainingCustomSlideNode trainingCustomSlideNode) throws URISyntaxException {
        log.debug("REST request to save TrainingCustomSlideNode : {}", trainingCustomSlideNode);
        if (trainingCustomSlideNode.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new trainingCustomSlideNode cannot already have an ID").body(null);
        }
        TrainingCustomSlideNode result = trainingCustomSlideNodeRepository.save(trainingCustomSlideNode);
        trainingCustomSlideNodeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/trainingCustomSlideNodes/" + result.getId()))
                .headers(new HttpHeaders())
                .body(result);
    }

    /**
     * PUT  /trainingCustomSlideNodes -> Updates an existing trainingCustomSlideNode.
     */
    @RequestMapping(value = "/trainingCustomSlideNodes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCustomSlideNode> update(@RequestBody TrainingCustomSlideNode trainingCustomSlideNode) throws URISyntaxException {
        log.debug("REST request to update TrainingCustomSlideNode : {}", trainingCustomSlideNode);
        if (trainingCustomSlideNode.getId() == null) {
            return create(trainingCustomSlideNode);
        }
        TrainingCustomSlideNode result = trainingCustomSlideNodeRepository.save(trainingCustomSlideNode);
        trainingCustomSlideNodeSearchRepository.save(trainingCustomSlideNode);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("trainingCustomSlideNode", trainingCustomSlideNode.getId().toString()))
                .body(result);
    }

    /**
     * GET  /trainingCustomSlideNodes -> get all the trainingCustomSlideNodes.
     */
    @RequestMapping(value = "/trainingCustomSlideNodes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingCustomSlideNode> getAll() {
        log.debug("REST request to get all TrainingCustomSlideNodes");
        return trainingCustomSlideNodeRepository.findAll();
    }

    /**
     * GET  /trainingCustomSlideNodes/:id -> get the "id" trainingCustomSlideNode.
     */
    @RequestMapping(value = "/trainingCustomSlideNodes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCustomSlideNode> get(@PathVariable Long id) {
        log.debug("REST request to get TrainingCustomSlideNode : {}", id);
        return Optional.ofNullable(trainingCustomSlideNodeRepository.findOne(id))
            .map(trainingCustomSlideNode -> new ResponseEntity<>(
                trainingCustomSlideNode,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /trainingCustomSlideNodes/:id -> delete the "id" trainingCustomSlideNode.
     */
    @RequestMapping(value = "/trainingCustomSlideNodes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TrainingCustomSlideNode : {}", id);
        trainingCustomSlideNodeRepository.delete(id);
        trainingCustomSlideNodeSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("trainingCustomSlideNode", id.toString())).build();
    }

    /**
     * SEARCH  /_search/trainingCustomSlideNodes/:query -> search for the trainingCustomSlideNode corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/trainingCustomSlideNodes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TrainingCustomSlideNode> search(@PathVariable String query) {
        return StreamSupport
            .stream(trainingCustomSlideNodeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }

    /**
     * GET TrainingCustomSlideNode by its node_id
     */
    @RequestMapping(value = "/TrainingCustomSlideNodeByTrainingTreeNode/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TrainingCustomSlideNode> getTrainingCustomSlideNodeByTrainingTreeNode(@PathVariable Long id) {
        log.debug("REST request to get TrainingCustomSlideNode with node_id : {}", id);
        TrainingTreeNode node = trainingTreeNodeRepository.getOne(id);
        TrainingCustomSlideNode result = trainingCustomSlideNodeRepository.getTrainingCustomSlideNodeByTrainingTreeNode(node);
        return ResponseEntity.ok()
            .headers(new HttpHeaders())
            .body(result);
    }
}
