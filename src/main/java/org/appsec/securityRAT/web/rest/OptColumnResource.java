package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.OptColumn;
import org.appsec.securityRAT.repository.OptColumnRepository;
import org.appsec.securityRAT.repository.search.OptColumnSearchRepository;
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
 * REST controller for managing OptColumn.
 */
@RestController
@RequestMapping("/api")
public class OptColumnResource {

    private final Logger log = LoggerFactory.getLogger(OptColumnResource.class);

    @Inject
    private OptColumnRepository optColumnRepository;

    @Inject
    private OptColumnSearchRepository optColumnSearchRepository;

    /**
     * POST  /optColumns -> Create a new optColumn.
     */
    @RequestMapping(value = "/optColumns",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumn> create(@RequestBody OptColumn optColumn) throws URISyntaxException {
        log.debug("REST request to save OptColumn : {}", optColumn);
        if (optColumn.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new optColumn cannot already have an ID").body(null);
        }
        OptColumn result = optColumnRepository.save(optColumn);
        optColumnSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/optColumns/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("optColumn", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /optColumns -> Updates an existing optColumn.
     */
    @RequestMapping(value = "/optColumns",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumn> update(@RequestBody OptColumn optColumn) throws URISyntaxException {
        log.debug("REST request to update OptColumn : {}", optColumn);
        if (optColumn.getId() == null) {
            return create(optColumn);
        }
        OptColumn result = optColumnRepository.save(optColumn);
        optColumnSearchRepository.save(optColumn);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("optColumn", optColumn.getId().toString()))
                .body(result);
    }

    /**
     * GET  /optColumns -> get all the optColumns.
     */
    @RequestMapping(value = "/optColumns",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<OptColumn> getAll() {
        log.debug("REST request to get all OptColumns");
        return optColumnRepository.findAll();
    }

    /**
     * GET  /optColumns/:id -> get the "id" optColumn.
     */
    @RequestMapping(value = "/optColumns/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumn> get(@PathVariable Long id) {
        log.debug("REST request to get OptColumn : {}", id);
        return Optional.ofNullable(optColumnRepository.findOne(id))
            .map(optColumn -> new ResponseEntity<>(
                optColumn,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /optColumns/:id -> delete the "id" optColumn.
     */
    @RequestMapping(value = "/optColumns/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete OptColumn : {}", id);
        return Optional.ofNullable(optColumnRepository.findOne(id))
                .map(optColumn -> {
                	optColumnRepository.delete(id);
                    optColumnSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("optColumn", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/optColumns/:query -> search for the optColumn corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/optColumns/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<OptColumn> search(@PathVariable String query) {
        return StreamSupport
            .stream(optColumnSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
