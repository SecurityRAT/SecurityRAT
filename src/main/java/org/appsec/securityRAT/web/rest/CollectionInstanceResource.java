package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.CollectionInstance;
import org.appsec.securityRAT.repository.CollectionInstanceRepository;
import org.appsec.securityRAT.repository.search.CollectionInstanceSearchRepository;
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
 * REST controller for managing CollectionInstance.
 */
@RestController
@RequestMapping("/api")
public class CollectionInstanceResource {

    private final Logger log = LoggerFactory.getLogger(CollectionInstanceResource.class);

    @Inject
    private CollectionInstanceRepository collectionInstanceRepository;

    @Inject
    private CollectionInstanceSearchRepository collectionInstanceSearchRepository;

    /**
     * POST  /collectionInstances -> Create a new collectionInstance.
     */
    @RequestMapping(value = "/collectionInstances",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionInstance> create(@RequestBody CollectionInstance collectionInstance) throws URISyntaxException {
        log.debug("REST request to save CollectionInstance : {}", collectionInstance);
        if (collectionInstance.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new collectionInstance cannot already have an ID").body(null);
        }
        CollectionInstance result = collectionInstanceRepository.save(collectionInstance);
        collectionInstanceSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/collectionInstances/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("collectionInstance", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /collectionInstances -> Updates an existing collectionInstance.
     */
    @RequestMapping(value = "/collectionInstances",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionInstance> update(@RequestBody CollectionInstance collectionInstance) throws URISyntaxException {
        log.debug("REST request to update CollectionInstance : {}", collectionInstance);
        if (collectionInstance.getId() == null) {
            return create(collectionInstance);
        }
        CollectionInstance result = collectionInstanceRepository.save(collectionInstance);
        collectionInstanceSearchRepository.save(collectionInstance);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("collectionInstance", collectionInstance.getId().toString()))
                .body(result);
    }

    /**
     * GET  /collectionInstances -> get all the collectionInstances.
     */
    @RequestMapping(value = "/collectionInstances",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<CollectionInstance> getAll() {
        log.debug("REST request to get all CollectionInstances");
        return collectionInstanceRepository.findAll();
    }

    /**
     * GET  /collectionInstances/:id -> get the "id" collectionInstance.
     */
    @RequestMapping(value = "/collectionInstances/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionInstance> get(@PathVariable Long id) {
        log.debug("REST request to get CollectionInstance : {}", id);
        return Optional.ofNullable(collectionInstanceRepository.findOne(id))
            .map(collectionInstance -> new ResponseEntity<>(
                collectionInstance,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /collectionInstances/:id -> delete the "id" collectionInstance.
     */
    @RequestMapping(value = "/collectionInstances/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete CollectionInstance : {}", id);
        return Optional.ofNullable(collectionInstanceRepository.findOne(id))
                .map(collectionInstance -> {
                	collectionInstanceRepository.delete(id);
                    collectionInstanceSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("collectionInstance", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/collectionInstances/:query -> search for the collectionInstance corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/collectionInstances/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<CollectionInstance> search(@PathVariable String query) {
        return StreamSupport
            .stream(collectionInstanceSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
