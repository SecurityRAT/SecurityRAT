package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;

import org.appsec.securityRAT.domain.OptColumn;
import org.appsec.securityRAT.domain.OptColumnContent;
import org.appsec.securityRAT.domain.RequirementSkeleton;
import org.appsec.securityRAT.repository.OptColumnContentRepository;
import org.appsec.securityRAT.repository.OptColumnRepository;
import org.appsec.securityRAT.repository.ProjectTypeRepository;
import org.appsec.securityRAT.repository.RequirementSkeletonRepository;
import org.appsec.securityRAT.repository.search.OptColumnContentSearchRepository;
import org.appsec.securityRAT.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
 * REST controller for managing OptColumnContent.
 */
@RestController
@RequestMapping("/api")
public class OptColumnContentResource {

    private final Logger log = LoggerFactory.getLogger(OptColumnContentResource.class);

    @Inject
    private OptColumnContentRepository optColumnContentRepository;

    @Inject
    private RequirementSkeletonRepository requirementSkeletonRepository;

    @Inject
    private OptColumnContentSearchRepository optColumnContentSearchRepository;

    @Inject
    private ProjectTypeRepository projectTypeRepository;

    @Inject OptColumnRepository optColumnRepository;

    /**
     * POST  /optColumnContents -> Create a new optColumnContent.
     */
    @RequestMapping(value = "/optColumnContents",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumnContent> create(@RequestBody OptColumnContent optColumnContent) throws URISyntaxException {
        log.debug("REST request to save OptColumnContent : {}", optColumnContent);
        if (optColumnContent.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new optColumnContent cannot already have an ID").body(null);
        }
        OptColumnContent result = optColumnContentRepository.save(optColumnContent);
        optColumnContentSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/optColumnContents/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("optColumnContent", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /optColumnContents -> Updates an existing optColumnContent.
     */
    @RequestMapping(value = "/optColumnContents",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumnContent> update(@RequestBody OptColumnContent optColumnContent) throws URISyntaxException {
        log.debug("REST request to update OptColumnContent : {}", optColumnContent);
        if (optColumnContent.getId() == null) {
            return create(optColumnContent);
        }
        OptColumnContent result = optColumnContentRepository.save(optColumnContent);
        optColumnContentSearchRepository.save(optColumnContent);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("optColumnContent", optColumnContent.getId().toString()))
                .body(result);
    }

    /**
     * GET  /optColumnContents -> get all the optColumnContents.
     */
    @RequestMapping(value = "/optColumnContents",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<OptColumnContent> getAll() {
        log.debug("REST request to get all OptColumnContents");
        return optColumnContentRepository.findAll();
    }

    /**
     * GET  /optColumnContents/:id -> get the "id" optColumnContent.
     */
    @RequestMapping(value = "/optColumnContents/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<OptColumnContent> get(@PathVariable Long id) {
        log.debug("REST request to get OptColumnContent : {}", id);
        return Optional.ofNullable(optColumnContentRepository.findOne(id))
            .map(optColumnContent -> new ResponseEntity<>(
                optColumnContent,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET  /optColumnContents/getRequirement/:id -> get the information for a specific requirement.
     */
    @RequestMapping(value = "/optColumnContents/getRequirement/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Set<OptColumnContent>> getRequirement(@PathVariable Long id) {
        log.debug("REST request to get OptColumnContent for Requirement: {}", id);
        ;
        return Optional.ofNullable(requirementSkeletonRepository.findOne(id).getOptColumnContents())
            .map(optColumnContent -> new ResponseEntity<>(
                optColumnContent,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }



    /**
     * GET /optColumnContents/filter?projectTypeId=x&requirementId=y
     * returns list of only option column contents for a requirement, which are relevant for a specified project type
     *
     */
    @RequestMapping(value="/optColumnContents/filter",
    		method = RequestMethod.GET,
    		produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Transactional
    public List<OptColumnContent> foo(
    		@RequestParam("projectTypeId") Long projectTypeId,
    		@RequestParam("requirementId") Long requirementSkeletonId) {
    	return optColumnContentRepository.findOptColumnsForRequirementIdAndProjectTypeId(requirementSkeletonId, projectTypeId);
    }

    /**
     * GET /optColumnContents/byOptColumnAndRequirement/{optColumnId}/{requirementId}
     * returns the optionColumnContent for a specific optColumn id and requirementSkeleton id
     *
     */
    @RequestMapping(value="/optColumnContents/byOptColumnAndRequirement/{optColumnId}/{requirementId}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Transactional
    public OptColumnContent getOptColumnContentByOptColumnAndRequirement(
        @PathVariable("optColumnId") Long optColumnId,
        @PathVariable("requirementId") Long requirementId) {
        log.debug("REST request to get OptColumnContent with RequirementSkeleton id : {} and OptColumn id : {}", requirementId, optColumnId);
        OptColumn optColumn = optColumnRepository.findOne(optColumnId);
        RequirementSkeleton skeleton = requirementSkeletonRepository.findOne(requirementId);
        List<OptColumnContent> result = optColumnContentRepository.getOptColumnContentByOptColumnAndRequirement(skeleton, optColumn);
        if(result != null && result.size() > 0) {
            return result.get(0);
        } else {
            return null;
        }
    }


    /**
     * DELETE  /optColumnContents/:id -> delete the "id" optColumnContent.
     */
    @RequestMapping(value = "/optColumnContents/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete OptColumnContent : {}", id);
        return Optional.ofNullable(optColumnContentRepository.findOne(id))
                .map(optColumnContent -> {
                	optColumnContentRepository.delete(id);
                    optColumnContentSearchRepository.delete(id);
                    return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("optColumnContent", id.toString())).build();
                }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * SEARCH  /_search/optColumnContents/:query -> search for the optColumnContent corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/optColumnContents/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<OptColumnContent> search(@PathVariable String query) {
        return StreamSupport
            .stream(optColumnContentSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
