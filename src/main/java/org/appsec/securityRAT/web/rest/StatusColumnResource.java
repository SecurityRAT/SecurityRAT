package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.StatusColumn;
import org.appsec.securityRAT.repository.StatusColumnRepository;
import org.appsec.securityRAT.repository.search.StatusColumnSearchRepository;
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
 * REST controller for managing StatusColumn.
 */
@RestController
@RequestMapping("/api")
public class StatusColumnResource {

    private final Logger log = LoggerFactory.getLogger(StatusColumnResource.class);

    @Inject
    private StatusColumnRepository statusColumnRepository;

    @Inject
    private StatusColumnSearchRepository statusColumnSearchRepository;

    /**
     * POST  /statusColumns -> Create a new statusColumn.
     */
    @RequestMapping(value = "/statusColumns",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<StatusColumn> create(@RequestBody StatusColumn statusColumn) throws URISyntaxException {
        log.debug("REST request to save StatusColumn : {}", statusColumn);
        if (statusColumn.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new statusColumn cannot already have an ID").body(null);
        }
        StatusColumn result = statusColumnRepository.save(statusColumn);
        statusColumnSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/statusColumns/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("statusColumn", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /statusColumns -> Updates an existing statusColumn.
     */
    @RequestMapping(value = "/statusColumns",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<StatusColumn> update(@RequestBody StatusColumn statusColumn) throws URISyntaxException {
        log.debug("REST request to update StatusColumn : {}", statusColumn);
        if (statusColumn.getId() == null) {
            return create(statusColumn);
        }
        StatusColumn result = statusColumnRepository.save(statusColumn);
        statusColumnSearchRepository.save(statusColumn);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("statusColumn", statusColumn.getId().toString()))
                .body(result);
    }

    /**
     * GET  /statusColumns -> get all the statusColumns.
     */
    @RequestMapping(value = "/statusColumns",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<StatusColumn> getAll() {
        log.debug("REST request to get all StatusColumns");
        return statusColumnRepository.findAll();
    }

    /**
     * GET  /statusColumns/:id -> get the "id" statusColumn.
     */
    @RequestMapping(value = "/statusColumns/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<StatusColumn> get(@PathVariable Long id) {
        log.debug("REST request to get StatusColumn : {}", id);
        return Optional.ofNullable(statusColumnRepository.findOne(id))
            .map(statusColumn -> new ResponseEntity<>(
                statusColumn,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /statusColumns/:id -> delete the "id" statusColumn.
     */
    @RequestMapping(value = "/statusColumns/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete StatusColumn : {}", id);
        return Optional.ofNullable(statusColumnRepository.findOne(id))
                .map(statusColumn -> {
                	statusColumnRepository.delete(id);
                    statusColumnSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("statusColumn", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/statusColumns/:query -> search for the statusColumn corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/statusColumns/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<StatusColumn> search(@PathVariable String query) {
        return StreamSupport
            .stream(statusColumnSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
