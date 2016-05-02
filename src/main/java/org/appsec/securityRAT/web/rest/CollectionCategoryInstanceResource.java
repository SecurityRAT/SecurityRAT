package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.CollectionCategory;
import org.appsec.securityRAT.domain.CollectionInstance;
import org.appsec.securityRAT.repository.CollectionCategoryRepository;
import org.appsec.securityRAT.repository.search.CollectionCategorySearchRepository;
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
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing CollectionCategoryInstanceResource.
 */
@RestController
@RequestMapping("/api")
public class CollectionCategoryInstanceResource {

    private final Logger log = LoggerFactory.getLogger(CollectionCategoryResource.class);

    @Inject
    private CollectionCategoryRepository collectionCategoryRepository;

    @Inject
    private CollectionCategorySearchRepository collectionCategorySearchRepository;

    /**
     * POST  /collectionCategoryInstances -> Create a new CollectionCategoryInstanceResource.
     */
    @RequestMapping(value = "/collectionCategoryInstances",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionCategory> create(@RequestBody CollectionCategory collectionCategory) throws URISyntaxException {
        log.debug("REST request to save collectionCategoryInstance : {}", collectionCategory);
        if (collectionCategory.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new collectionCategoryInstance cannot already have an ID").body(null);
        }
        CollectionCategory result = collectionCategoryRepository.save(collectionCategory);
        collectionCategorySearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/collectionCategoryInstances/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("collectionCategoryInstance", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /collectionCategoryInstances -> Updates an existing collectionCategoryInstance.
     */
    @RequestMapping(value = "/collectionCategoryInstances",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionCategory> update(@RequestBody CollectionCategory collectionCategory) throws URISyntaxException {
        log.debug("REST request to update collectionCategoryInstance : {}", collectionCategory);
        if (collectionCategory.getId() == null) {
            return create(collectionCategory);
        }
        CollectionCategory result = collectionCategoryRepository.save(collectionCategory);
        collectionCategorySearchRepository.save(collectionCategory);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("collectionCategoryInstance", collectionCategory.getId().toString()))
                .body(result);
    }

    /**
     * GET  /collectionCategoryInstances -> get all the collectionCategoryInstances.
     */
    @RequestMapping(value = "/collectionCategoryInstances",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<CollectionCategory> getAll() {
        log.debug("REST request to get all collectionCategoryInstances");
        return collectionCategoryRepository.findAll();
    }

    /**
     * GET  /collectionCategoryInstances/:id -> get the "id" collectionCategoryInstance.
     */
    @RequestMapping(value = "/collectionCategoryInstances/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Set<CollectionInstance>> get(@PathVariable Long id) {
        return Optional.ofNullable(collectionCategoryRepository.findOne(id))
                .map(collectionCategory -> new ResponseEntity<>(
                    collectionCategory.getCollectionInstances(),
                    HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /collectionCategoryInstances/:id -> delete the "id" collectionCategoryInstance.
     */
    @RequestMapping(value = "/collectionCategoryInstances/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete collectionCategoryInstance : {}", id);
        collectionCategoryRepository.delete(id);
        collectionCategorySearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("collectionCategoryInstance", id.toString())).build();
    }

    /**
     * SEARCH  /_search/collectionCategoryInstances/:query -> search for the collectionCategoryInstance corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/collectionCategoryInstances/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<CollectionCategory> search(@PathVariable String query) {
        return StreamSupport
            .stream(collectionCategorySearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}


