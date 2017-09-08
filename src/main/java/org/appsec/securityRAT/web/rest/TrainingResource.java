package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.*;
import org.appsec.securityRAT.repository.*;
import org.appsec.securityRAT.repository.search.TrainingSearchRepository;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
 * REST controller for managing Training.
 */
@RestController
@RequestMapping("/api")
public class TrainingResource {

    private final Logger log = LoggerFactory.getLogger(TrainingResource.class);

    @Inject
    private TrainingRepository trainingRepository;

    @Inject
    private TrainingSearchRepository trainingSearchRepository;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;


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

    /**
     * POST  /trainings -> Create a new training.
     */
    @RequestMapping(value = "/trainings",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Training> create(@RequestBody Training training) throws URISyntaxException {
        log.debug("REST request to save Training : {}", training);
        if (training.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new training cannot already have an ID").body(null);
        }
        Training result = trainingRepository.save(training);
        trainingSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/trainings/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("training", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /trainings -> Updates an existing training.
     */
    @RequestMapping(value = "/trainings",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Training> update(@RequestBody Training training) throws URISyntaxException {
        log.debug("REST request to update Training : {}", training);
        if (training.getId() == null) {
            return create(training);
        }
        Training result = trainingRepository.save(training);
        trainingSearchRepository.save(training);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("training", training.getId().toString()))
                .body(result);
    }

    /**
     * GET  /trainings -> get all the trainings.
     */
    @RequestMapping(value = "/trainings",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<Training> getAll() {
        log.debug("REST request to get all Trainings");
        return trainingRepository.findAllWithEagerRelationships();
    }

    /**
     * GET  /trainings/:id -> get the "id" training.
     */
    @RequestMapping(value = "/trainings/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Training> get(@PathVariable Long id) {
        log.debug("REST request to get Training : {}", id);
        return Optional.ofNullable(trainingRepository.findOneWithEagerRelationships(id))
            .map(training -> new ResponseEntity<>(
                training,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /trainings/:id -> delete the "id" training.
     */
    @RequestMapping(value = "/trainings/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete Training : {}", id);

        trainingRepository.delete(id);
        trainingSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("training", id.toString())).build();
    }

    /**
     * SEARCH  /_search/trainings/:query -> search for the training corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/trainings/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<Training> search(@PathVariable String query) {
        return StreamSupport
            .stream(trainingSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
