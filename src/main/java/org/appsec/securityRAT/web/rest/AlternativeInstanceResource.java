package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.AlternativeInstance;
import org.appsec.securityRAT.repository.AlternativeInstanceRepository;
import org.appsec.securityRAT.repository.search.AlternativeInstanceSearchRepository;
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

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing AlternativeInstance.
 */
@RestController
@RequestMapping("/api")
public class AlternativeInstanceResource {

    private final Logger log = LoggerFactory.getLogger(AlternativeInstanceResource.class);

    @Inject
    private AlternativeInstanceRepository alternativeInstanceRepository;

    @Inject
    private AlternativeInstanceSearchRepository alternativeInstanceSearchRepository;

    /**
     * POST  /alternativeInstances -> Create a new alternativeInstance.
     */
    @RequestMapping(value = "/alternativeInstances",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AlternativeInstance> create(@RequestBody AlternativeInstance alternativeInstance) throws URISyntaxException {
        log.debug("REST request to save AlternativeInstance : {}", alternativeInstance);
        if (alternativeInstance.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new alternativeInstance cannot already have an ID").body(null);
        }
        AlternativeInstance result = alternativeInstanceRepository.save(alternativeInstance);
        alternativeInstanceSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/alternativeInstances/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("alternativeInstance", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /alternativeInstances -> Updates an existing alternativeInstance.
     */
    @RequestMapping(value = "/alternativeInstances",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AlternativeInstance> update(@RequestBody AlternativeInstance alternativeInstance) throws URISyntaxException {
        log.debug("REST request to update AlternativeInstance : {}", alternativeInstance);
        if (alternativeInstance.getId() == null) {
            return create(alternativeInstance);
        }
        AlternativeInstance result = alternativeInstanceRepository.save(alternativeInstance);
        alternativeInstanceSearchRepository.save(alternativeInstance);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("alternativeInstance", alternativeInstance.getId().toString()))
                .body(result);
    }

    /**
     * GET  /alternativeInstances -> get all the alternativeInstances.
     */
    @RequestMapping(value = "/alternativeInstances",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<AlternativeInstance> getAll() {
        log.debug("REST request to get all AlternativeInstances");
        return alternativeInstanceRepository.findAll();
    }

    /**
     * GET  /alternativeInstances/:id -> get the "id" alternativeInstance.
     */
    @RequestMapping(value = "/alternativeInstances/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AlternativeInstance> get(@PathVariable Long id) {
        log.debug("REST request to get AlternativeInstance : {}", id);
        return Optional.ofNullable(alternativeInstanceRepository.findOne(id))
            .map(alternativeInstance -> new ResponseEntity<>(
                alternativeInstance,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /alternativeInstances/:id -> delete the "id" alternativeInstance.
     */
    @RequestMapping(value = "/alternativeInstances/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete AlternativeInstance : {}", id);
        return Optional.ofNullable(alternativeInstanceRepository.findOne(id))
                .map(alternativeInstance -> {
                	alternativeInstanceRepository.delete(id);
                    alternativeInstanceSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("alternativeInstance", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/alternativeInstances/:query -> search for the alternativeInstance corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/alternativeInstances/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<AlternativeInstance> search(@PathVariable String query) {
        return StreamSupport
            .stream(alternativeInstanceSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
