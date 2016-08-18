package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.AlternativeSet;
import org.appsec.securityRAT.repository.AlternativeSetRepository;
import org.appsec.securityRAT.repository.search.AlternativeSetSearchRepository;
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
 * REST controller for managing AlternativeSet.
 */
@RestController
@RequestMapping("/api")
public class AlternativeSetResource {

    private final Logger log = LoggerFactory.getLogger(AlternativeSetResource.class);

    @Inject
    private AlternativeSetRepository alternativeSetRepository;

    @Inject
    private AlternativeSetSearchRepository alternativeSetSearchRepository;

    /**
     * POST  /alternativeSets -> Create a new alternativeSet.
     */
    @RequestMapping(value = "/alternativeSets",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AlternativeSet> create(@RequestBody AlternativeSet alternativeSet) throws URISyntaxException {
        log.debug("REST request to save AlternativeSet : {}", alternativeSet);
        if (alternativeSet.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new alternativeSet cannot already have an ID").body(null);
        }
        AlternativeSet result = alternativeSetRepository.save(alternativeSet);
        alternativeSetSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/alternativeSets/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("alternativeSet", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /alternativeSets -> Updates an existing alternativeSet.
     */
    @RequestMapping(value = "/alternativeSets",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AlternativeSet> update(@RequestBody AlternativeSet alternativeSet) throws URISyntaxException {
        log.debug("REST request to update AlternativeSet : {}", alternativeSet);
        if (alternativeSet.getId() == null) {
            return create(alternativeSet);
        }
        AlternativeSet result = alternativeSetRepository.save(alternativeSet);
        alternativeSetSearchRepository.save(alternativeSet);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("alternativeSet", alternativeSet.getId().toString()))
                .body(result);
    }

    /**
     * GET  /alternativeSets -> get all the alternativeSets.
     */
    @RequestMapping(value = "/alternativeSets",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<AlternativeSet> getAll() {
        log.debug("REST request to get all AlternativeSets");
        return alternativeSetRepository.findAll();
    }

    /**
     * GET  /alternativeSets/:id -> get the "id" alternativeSet.
     */
    @RequestMapping(value = "/alternativeSets/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AlternativeSet> get(@PathVariable Long id) {
        log.debug("REST request to get AlternativeSet : {}", id);
        return Optional.ofNullable(alternativeSetRepository.findOne(id))
            .map(alternativeSet -> new ResponseEntity<>(
                alternativeSet,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /alternativeSets/:id -> delete the "id" alternativeSet.
     */
    @RequestMapping(value = "/alternativeSets/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete AlternativeSet : {}", id);
        return Optional.ofNullable(alternativeSetRepository.findOne(id))
                .map(alternativeSet -> {
                	alternativeSetRepository.delete(id);
                    alternativeSetSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("alternativeSet", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/alternativeSets/:query -> search for the alternativeSet corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/alternativeSets/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<AlternativeSet> search(@PathVariable String query) {
        return StreamSupport
            .stream(alternativeSetSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
