package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.TagCategory;
import org.appsec.securityRAT.repository.TagCategoryRepository;
import org.appsec.securityRAT.repository.search.TagCategorySearchRepository;
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
 * REST controller for managing TagCategory.
 */
@RestController
@RequestMapping("/api")
public class TagCategoryResource {

    private final Logger log = LoggerFactory.getLogger(TagCategoryResource.class);

    @Inject
    private TagCategoryRepository tagCategoryRepository;

    @Inject
    private TagCategorySearchRepository tagCategorySearchRepository;

    /**
     * POST  /tagCategorys -> Create a new tagCategory.
     */
    @RequestMapping(value = "/tagCategorys",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TagCategory> create(@RequestBody TagCategory tagCategory) throws URISyntaxException {
        log.debug("REST request to save TagCategory : {}", tagCategory);
        if (tagCategory.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new tagCategory cannot already have an ID").body(null);
        }
        TagCategory result = tagCategoryRepository.save(tagCategory);
        tagCategorySearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/tagCategorys/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("tagCategory", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /tagCategorys -> Updates an existing tagCategory.
     */
    @RequestMapping(value = "/tagCategorys",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TagCategory> update(@RequestBody TagCategory tagCategory) throws URISyntaxException {
        log.debug("REST request to update TagCategory : {}", tagCategory);
        if (tagCategory.getId() == null) {
            return create(tagCategory);
        }
        TagCategory result = tagCategoryRepository.save(tagCategory);
        tagCategorySearchRepository.save(tagCategory);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("tagCategory", tagCategory.getId().toString()))
                .body(result);
    }

    /**
     * GET  /tagCategorys -> get all the tagCategorys.
     */
    @RequestMapping(value = "/tagCategorys",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TagCategory> getAll() {
        log.debug("REST request to get all TagCategorys");
        return tagCategoryRepository.findAll();
    }

    /**
     * GET  /tagCategorys/:id -> get the "id" tagCategory.
     */
    @RequestMapping(value = "/tagCategorys/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TagCategory> get(@PathVariable Long id) {
        log.debug("REST request to get TagCategory : {}", id);
        return Optional.ofNullable(tagCategoryRepository.findOne(id))
            .map(tagCategory -> new ResponseEntity<>(
                tagCategory,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /tagCategorys/:id -> delete the "id" tagCategory.
     */
    @RequestMapping(value = "/tagCategorys/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TagCategory : {}", id);
        return Optional.ofNullable(tagCategoryRepository.findOne(id))
                .map(tagCategory -> {
                	tagCategoryRepository.delete(id);
                    tagCategorySearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("tagCategory", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/tagCategorys/:query -> search for the tagCategory corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/tagCategorys/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TagCategory> search(@PathVariable String query) {
        return StreamSupport
            .stream(tagCategorySearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
