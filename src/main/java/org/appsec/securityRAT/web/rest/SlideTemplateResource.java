package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.SlideTemplate;
import org.appsec.securityRAT.repository.SlideTemplateRepository;
import org.appsec.securityRAT.repository.search.SlideTemplateSearchRepository;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
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
 * REST controller for managing SlideTemplate.
 */
@RestController
@RequestMapping("/api")
public class SlideTemplateResource {

    private final Logger log = LoggerFactory.getLogger(SlideTemplateResource.class);

    @Inject
    private SlideTemplateRepository slideTemplateRepository;

    @Inject
    private SlideTemplateSearchRepository slideTemplateSearchRepository;

    /**
     * POST  /slideTemplates -> Create a new slideTemplate.
     */
    @RequestMapping(value = "/slideTemplates",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<SlideTemplate> create(@RequestBody SlideTemplate slideTemplate) throws URISyntaxException {
        log.debug("REST request to save SlideTemplate : {}", slideTemplate);
        if (slideTemplate.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new slideTemplate cannot already have an ID").body(null);
        }
        SlideTemplate result = slideTemplateRepository.save(slideTemplate);
        slideTemplateSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/slideTemplates/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("slideTemplate", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /slideTemplates -> Updates an existing slideTemplate.
     */
    @RequestMapping(value = "/slideTemplates",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<SlideTemplate> update(@RequestBody SlideTemplate slideTemplate) throws URISyntaxException {
        log.debug("REST request to update SlideTemplate : {}", slideTemplate);
        if (slideTemplate.getId() == null) {
            return create(slideTemplate);
        }
        SlideTemplate result = slideTemplateRepository.save(slideTemplate);
        slideTemplateSearchRepository.save(slideTemplate);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("slideTemplate", slideTemplate.getId().toString()))
                .body(result);
    }

    /**
     * GET  /slideTemplates -> get all the slideTemplates.
     */
    @RequestMapping(value = "/slideTemplates",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<SlideTemplate> getAll() {
        log.debug("REST request to get all SlideTemplates");
        return slideTemplateRepository.findAll();
    }

    /**
     * GET  /slideTemplates/:id -> get the "id" slideTemplate.
     */
    @RequestMapping(value = "/slideTemplates/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<SlideTemplate> get(@PathVariable Long id) {
        log.debug("REST request to get SlideTemplate : {}", id);
        return Optional.ofNullable(slideTemplateRepository.findOne(id))
            .map(slideTemplate -> new ResponseEntity<>(
                slideTemplate,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /slideTemplates/:id -> delete the "id" slideTemplate.
     */
    @RequestMapping(value = "/slideTemplates/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete SlideTemplate : {}", id);
        slideTemplateRepository.delete(id);
        slideTemplateSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("slideTemplate", id.toString())).build();
    }

    /**
     * SEARCH  /_search/slideTemplates/:query -> search for the slideTemplate corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/slideTemplates/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<SlideTemplate> search(@PathVariable String query) {
        return StreamSupport
            .stream(slideTemplateSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
