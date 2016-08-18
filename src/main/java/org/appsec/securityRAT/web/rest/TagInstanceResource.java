package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.appsec.securityRAT.domain.TagInstance;
import org.appsec.securityRAT.repository.TagCategoryRepository;
import org.appsec.securityRAT.repository.TagInstanceRepository;
import org.appsec.securityRAT.repository.search.TagInstanceSearchRepository;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
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
 * REST controller for managing TagInstance.
 */
@RestController
@RequestMapping("/api")
public class TagInstanceResource {

    private final Logger log = LoggerFactory.getLogger(TagInstanceResource.class);

    @Inject
    private TagInstanceRepository tagInstanceRepository;

    @Inject
    private TagCategoryRepository tagCategoryRepository;

    @Inject
    private TagInstanceSearchRepository tagInstanceSearchRepository;

    /**
     * POST  /tagInstances -> Create a new tagInstance.
     */
    @RequestMapping(value = "/tagInstances",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TagInstance> create(@RequestBody TagInstance tagInstance) throws URISyntaxException {
        log.debug("REST request to save TagInstance : {}", tagInstance);
        if (tagInstance.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new tagInstance cannot already have an ID").body(null);
        }
        TagInstance result = tagInstanceRepository.save(tagInstance);
        tagInstanceSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/tagInstances/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("tagInstance", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /tagInstances -> Updates an existing tagInstance.
     */
    @RequestMapping(value = "/tagInstances",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TagInstance> update(@RequestBody TagInstance tagInstance) throws URISyntaxException {
        log.debug("REST request to update TagInstance : {}", tagInstance);
        if (tagInstance.getId() == null) {
            return create(tagInstance);
        }
        TagInstance result = tagInstanceRepository.save(tagInstance);
        tagInstanceSearchRepository.save(tagInstance);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("tagInstance", tagInstance.getId().toString()))
                .body(result);
    }

    /**
     * GET  /tagInstances -> get all the tagInstances.
     */
    @RequestMapping(value = "/tagInstances",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TagInstance> getAll() {
        log.debug("REST request to get all TagInstances");
        return tagInstanceRepository.findAll();
    }

    /**
     * GET  /tagInstances/:id -> get the "id" tagInstance.
     */
    @RequestMapping(value = "/tagInstances/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<TagInstance> get(@PathVariable Long id) {
        log.debug("REST request to get TagInstance : {}", id);
        return Optional.ofNullable(tagInstanceRepository.findOne(id))
            .map(tagInstance -> new ResponseEntity<>(
                tagInstance,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET  /tagInstances/tagCategory/:id -> get the "id" statusColumnValue.
     */
    @RequestMapping(value = "/tagInstances/tagCategory/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Set<TagInstance>> getTagInstanceValues(@PathVariable Long id) {
        log.debug("REST request to get TagInstanceValues for TagCategory : {}", id);
        return Optional.ofNullable(tagCategoryRepository.findOne(id).getTagInstances())
            .map(TagInstanceValue -> new ResponseEntity<>(
            	 TagInstanceValue,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /tagInstances/:id -> delete the "id" tagInstance.
     */
    @RequestMapping(value = "/tagInstances/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete TagInstance : {}", id);
        
        return Optional.ofNullable(tagInstanceRepository.findOne(id))
                .map(tagInstance -> {
                	tagInstanceRepository.delete(id);
                    tagInstanceSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("tagInstance", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/tagInstances/:query -> search for the tagInstance corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/tagInstances/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<TagInstance> search(@PathVariable String query) {
        return StreamSupport
            .stream(tagInstanceSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
