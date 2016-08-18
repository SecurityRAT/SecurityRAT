package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.CollectionCategory;
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
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing CollectionCategory.
 */
@RestController
@RequestMapping("/api")
public class CollectionCategoryResource {

    private final Logger log = LoggerFactory.getLogger(CollectionCategoryResource.class);

    @Inject
    private CollectionCategoryRepository collectionCategoryRepository;

    @Inject
    private CollectionCategorySearchRepository collectionCategorySearchRepository;

    /**
     * POST  /collectionCategorys -> Create a new collectionCategory.
     */
    @RequestMapping(value = "/collectionCategorys",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionCategory> create(@RequestBody CollectionCategory collectionCategory) throws URISyntaxException {
        log.debug("REST request to save CollectionCategory : {}", collectionCategory);
        if (collectionCategory.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new collectionCategory cannot already have an ID").body(null);
        }
        CollectionCategory result = collectionCategoryRepository.save(collectionCategory);
        collectionCategorySearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/collectionCategorys/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("collectionCategory", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /collectionCategorys -> Updates an existing collectionCategory.
     */
    @RequestMapping(value = "/collectionCategorys",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionCategory> update(@RequestBody CollectionCategory collectionCategory) throws URISyntaxException {
        log.debug("REST request to update CollectionCategory : {}", collectionCategory);
        if (collectionCategory.getId() == null) {
            return create(collectionCategory);
        }
        CollectionCategory result = collectionCategoryRepository.save(collectionCategory);
        collectionCategorySearchRepository.save(collectionCategory);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("collectionCategory", collectionCategory.getId().toString()))
                .body(result);
    }

    /**
     * GET  /collectionCategorys -> get all the collectionCategorys.
     */
    @RequestMapping(value = "/collectionCategorys",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<CollectionCategory> getAll() {
        log.debug("REST request to get all CollectionCategorys");
        return collectionCategoryRepository.findAll();
    }

    /**
     * GET  /collectionCategorys/:id -> get the "id" collectionCategory.
     */
    @RequestMapping(value = "/collectionCategorys/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<CollectionCategory> get(@PathVariable Long id) {
        log.debug("REST request to get CollectionCategory : {}", id);
        return Optional.ofNullable(collectionCategoryRepository.findOne(id))
            .map(collectionCategory -> new ResponseEntity<>(
                collectionCategory,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /collectionCategorys/:id -> delete the "id" collectionCategory.
     */
    @RequestMapping(value = "/collectionCategorys/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete CollectionCategory : {}", id);
        return Optional.ofNullable(collectionCategoryRepository.findOne(id))
                .map(collectionCategory -> {
                	collectionCategoryRepository.delete(id);
                    collectionCategorySearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("collectionCategory", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/collectionCategorys/:query -> search for the collectionCategory corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/collectionCategorys/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<CollectionCategory> search(@PathVariable String query) {
        return StreamSupport
            .stream(collectionCategorySearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
