package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.ReqCategory;
import org.appsec.securityRAT.repository.ReqCategoryRepository;
import org.appsec.securityRAT.repository.search.ReqCategorySearchRepository;
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
 * REST controller for managing ReqCategory.
 */
@RestController
@RequestMapping("/api")
public class ReqCategoryResource {

    private final Logger log = LoggerFactory.getLogger(ReqCategoryResource.class);

    @Inject
    private ReqCategoryRepository reqCategoryRepository;

    @Inject
    private ReqCategorySearchRepository reqCategorySearchRepository;

    /**
     * POST  /reqCategorys -> Create a new reqCategory.
     */
    @RequestMapping(value = "/reqCategorys",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ReqCategory> create(@RequestBody ReqCategory reqCategory) throws URISyntaxException {
        log.debug("REST request to save ReqCategory : {}", reqCategory);
        if (reqCategory.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new reqCategory cannot already have an ID").body(null);
        }
        ReqCategory result = reqCategoryRepository.save(reqCategory);
        reqCategorySearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/reqCategorys/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("reqCategory", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /reqCategorys -> Updates an existing reqCategory.
     */
    @RequestMapping(value = "/reqCategorys",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ReqCategory> update(@RequestBody ReqCategory reqCategory) throws URISyntaxException {
        log.debug("REST request to update ReqCategory : {}", reqCategory);
        if (reqCategory.getId() == null) {
            return create(reqCategory);
        }
        ReqCategory result = reqCategoryRepository.save(reqCategory);
        reqCategorySearchRepository.save(reqCategory);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("reqCategory", reqCategory.getId().toString()))
                .body(result);
    }

    /**
     * GET  /reqCategorys -> get all the reqCategorys.
     */
    @RequestMapping(value = "/reqCategorys",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<ReqCategory> getAll() {
        log.debug("REST request to get all ReqCategorys");
        return reqCategoryRepository.findAll();
    }

    /**
     * GET  /reqCategorys/:id -> get the "id" reqCategory.
     */
    @RequestMapping(value = "/reqCategorys/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ReqCategory> get(@PathVariable Long id) {
        log.debug("REST request to get ReqCategory : {}", id);
        return Optional.ofNullable(reqCategoryRepository.findOne(id))
            .map(reqCategory -> new ResponseEntity<>(
                reqCategory,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /reqCategorys/:id -> delete the "id" reqCategory.
     */
    @RequestMapping(value = "/reqCategorys/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete ReqCategory : {}", id);
        return Optional.ofNullable(reqCategoryRepository.findOne(id))
                .map(reqCategory -> {
                	reqCategoryRepository.delete(id);
                    reqCategorySearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("reqCategory", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/reqCategorys/:query -> search for the reqCategory corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/reqCategorys/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<ReqCategory> search(@PathVariable String query) {
        return StreamSupport
            .stream(reqCategorySearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
