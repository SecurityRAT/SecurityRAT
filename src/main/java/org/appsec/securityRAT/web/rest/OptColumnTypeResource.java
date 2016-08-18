package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.OptColumnType;
import org.appsec.securityRAT.repository.OptColumnTypeRepository;
import org.appsec.securityRAT.repository.search.OptColumnTypeSearchRepository;
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
 * REST controller for managing OptColumnType.
 */
@RestController
@RequestMapping("/api")
public class OptColumnTypeResource {

    private final Logger log = LoggerFactory.getLogger(OptColumnTypeResource.class);

    @Inject
    private OptColumnTypeRepository optColumnTypeRepository;

    @Inject
    private OptColumnTypeSearchRepository optColumnTypeSearchRepository;

    /**
     * POST  /optColumnTypes -> Create a new optColumnType.
     */
    @RequestMapping(value = "/optColumnTypes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumnType> create(@RequestBody OptColumnType optColumnType) throws URISyntaxException {
        log.debug("REST request to save OptColumnType : {}", optColumnType);
        if (optColumnType.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new optColumnType cannot already have an ID").body(null);
        }
        OptColumnType result = optColumnTypeRepository.save(optColumnType);
        optColumnTypeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/optColumnTypes/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("optColumnType", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /optColumnTypes -> Updates an existing optColumnType.
     */
    @RequestMapping(value = "/optColumnTypes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumnType> update(@RequestBody OptColumnType optColumnType) throws URISyntaxException {
        log.debug("REST request to update OptColumnType : {}", optColumnType);
        if (optColumnType.getId() == null) {
            return create(optColumnType);
        }
        OptColumnType result = optColumnTypeRepository.save(optColumnType);
        optColumnTypeSearchRepository.save(optColumnType);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("optColumnType", optColumnType.getId().toString()))
                .body(result);
    }

    /**
     * GET  /optColumnTypes -> get all the optColumnTypes.
     */
    @RequestMapping(value = "/optColumnTypes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<OptColumnType> getAll() {
        log.debug("REST request to get all OptColumnTypes");
        return optColumnTypeRepository.findAll();
    }

    /**
     * GET  /optColumnTypes/:id -> get the "id" optColumnType.
     */
    @RequestMapping(value = "/optColumnTypes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumnType> get(@PathVariable Long id) {
        log.debug("REST request to get OptColumnType : {}", id);
        return Optional.ofNullable(optColumnTypeRepository.findOne(id))
            .map(optColumnType -> new ResponseEntity<>(
                optColumnType,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /optColumnTypes/:id -> delete the "id" optColumnType.
     */
    @RequestMapping(value = "/optColumnTypes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete OptColumnType : {}", id);
        return Optional.ofNullable(optColumnTypeRepository.findOne(id))
                .map(statusColumn -> {
                	optColumnTypeRepository.delete(id);
                    optColumnTypeSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("optColumnType", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/optColumnTypes/:query -> search for the optColumnType corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/optColumnTypes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<OptColumnType> search(@PathVariable String query) {
        return StreamSupport
            .stream(optColumnTypeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
