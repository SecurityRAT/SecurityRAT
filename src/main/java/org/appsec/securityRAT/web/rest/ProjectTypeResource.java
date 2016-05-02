package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.repository.ProjectTypeRepository;
import org.appsec.securityRAT.repository.search.ProjectTypeSearchRepository;
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
 * REST controller for managing ProjectType.
 */
@RestController
@RequestMapping("/api")
public class ProjectTypeResource {

    private final Logger log = LoggerFactory.getLogger(ProjectTypeResource.class);

    @Inject
    private ProjectTypeRepository projectTypeRepository;

    @Inject
    private ProjectTypeSearchRepository projectTypeSearchRepository;

    /**
     * POST  /projectTypes -> Create a new projectType.
     */
    @RequestMapping(value = "/projectTypes",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ProjectType> create(@RequestBody ProjectType projectType) throws URISyntaxException {
        log.debug("REST request to save ProjectType : {}", projectType);
        if (projectType.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new projectType cannot already have an ID").body(null);
        }
        ProjectType result = projectTypeRepository.save(projectType);
        projectTypeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/projectTypes/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("projectType", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /projectTypes -> Updates an existing projectType.
     */
    @RequestMapping(value = "/projectTypes",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ProjectType> update(@RequestBody ProjectType projectType) throws URISyntaxException {
        log.debug("REST request to update ProjectType : {}", projectType);
        if (projectType.getId() == null) {
            return create(projectType);
        }
        ProjectType result = projectTypeRepository.save(projectType);
        projectTypeSearchRepository.save(projectType);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("projectType", projectType.getId().toString()))
                .body(result);
    }

    /**
     * GET  /projectTypes -> get all the projectTypes.
     */
    @RequestMapping(value = "/projectTypes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<ProjectType> getAll() {
        log.debug("REST request to get all ProjectTypes");
        return projectTypeRepository.findAllWithEagerRelationships();
    }

    /**
     * GET  /projectTypes/:id -> get the "id" projectType.
     */
    @RequestMapping(value = "/projectTypes/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ProjectType> get(@PathVariable Long id) {
        log.debug("REST request to get ProjectType : {}", id);
        return Optional.ofNullable(projectTypeRepository.findOneWithEagerRelationships(id))
            .map(projectType -> new ResponseEntity<>(
                projectType,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /projectTypes/:id -> delete the "id" projectType.
     */
    @RequestMapping(value = "/projectTypes/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete ProjectType : {}", id);
        projectTypeRepository.delete(id);
        projectTypeSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("projectType", id.toString())).build();
    }

    /**
     * SEARCH  /_search/projectTypes/:query -> search for the projectType corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/projectTypes/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<ProjectType> search(@PathVariable String query) {
        return StreamSupport
            .stream(projectTypeSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
