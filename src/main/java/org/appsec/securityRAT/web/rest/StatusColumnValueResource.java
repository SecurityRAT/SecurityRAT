package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.StatusColumnValue;
import org.appsec.securityRAT.repository.StatusColumnRepository;
import org.appsec.securityRAT.repository.StatusColumnValueRepository;
import org.appsec.securityRAT.repository.search.StatusColumnValueSearchRepository;
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
 * REST controller for managing StatusColumnValue.
 */
@RestController
@RequestMapping("/api")
public class StatusColumnValueResource {

    private final Logger log = LoggerFactory.getLogger(StatusColumnValueResource.class);

    @Inject
    private StatusColumnValueRepository statusColumnValueRepository;

    @Inject StatusColumnRepository statusColumnRepository;

    @Inject
    private StatusColumnValueSearchRepository statusColumnValueSearchRepository;

    /**
     * POST  /statusColumnValues -> Create a new statusColumnValue.
     */
    @RequestMapping(value = "/statusColumnValues",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<StatusColumnValue> create(@RequestBody StatusColumnValue statusColumnValue) throws URISyntaxException {
        log.debug("REST request to save StatusColumnValue : {}", statusColumnValue);
        if (statusColumnValue.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new statusColumnValue cannot already have an ID").body(null);
        }
        StatusColumnValue result = statusColumnValueRepository.save(statusColumnValue);
        statusColumnValueSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/statusColumnValues/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("statusColumnValue", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /statusColumnValues -> Updates an existing statusColumnValue.
     */
    @RequestMapping(value = "/statusColumnValues",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<StatusColumnValue> update(@RequestBody StatusColumnValue statusColumnValue) throws URISyntaxException {
        log.debug("REST request to update StatusColumnValue : {}", statusColumnValue);
        if (statusColumnValue.getId() == null) {
            return create(statusColumnValue);
        }
        StatusColumnValue result = statusColumnValueRepository.save(statusColumnValue);
        statusColumnValueSearchRepository.save(statusColumnValue);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("statusColumnValue", statusColumnValue.getId().toString()))
                .body(result);
    }

    /**
     * GET  /statusColumnValues -> get all the statusColumnValues.
     */
    @RequestMapping(value = "/statusColumnValues",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<StatusColumnValue> getAll() {
        log.debug("REST request to get all StatusColumnValues");
        return statusColumnValueRepository.findAll();
    }

    /**
     * GET  /statusColumnValues/:id -> get the "id" statusColumnValue.
     */
    @RequestMapping(value = "/statusColumnValues/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<StatusColumnValue> get(@PathVariable Long id) {
        log.debug("REST request to get StatusColumnValue : {}", id);
        return Optional.ofNullable(statusColumnValueRepository.findOne(id))
            .map(statusColumnValue -> new ResponseEntity<>(
                statusColumnValue,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET  /statusColumnValues/statusColumn/:id -> get the "id" statusColumnValue.
     */
    @RequestMapping(value = "/statusColumnValues/statusColumn/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Set<StatusColumnValue>> getStatusColumn(@PathVariable Long id) {
        log.debug("REST request to get StatusColumnValue for StatusColumn : {}", id);
        return Optional.ofNullable(statusColumnRepository.findOne(id).getStatusColumnValues())
            .map(statusColumnValue -> new ResponseEntity<>(
                statusColumnValue,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /statusColumnValues/:id -> delete the "id" statusColumnValue.
     */
    @RequestMapping(value = "/statusColumnValues/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete StatusColumnValue : {}", id);
        statusColumnValueRepository.delete(id);
        statusColumnValueSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("statusColumnValue", id.toString())).build();
    }

    /**
     * SEARCH  /_search/statusColumnValues/:query -> search for the statusColumnValue corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/statusColumnValues/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<StatusColumnValue> search(@PathVariable String query) {
        return StreamSupport
            .stream(statusColumnValueSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
