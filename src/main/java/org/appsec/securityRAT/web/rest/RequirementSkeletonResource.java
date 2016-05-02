package org.appsec.securityRAT.web.rest;

import com.codahale.metrics.annotation.Timed;








import org.appsec.securityRAT.domain.CollectionCategory;
import org.appsec.securityRAT.domain.CollectionInstance;
import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.domain.RequirementSkeleton;
import org.appsec.securityRAT.repository.CollectionInstanceRepository;
import org.appsec.securityRAT.repository.ProjectTypeRepository;
import org.appsec.securityRAT.repository.RequirementSkeletonRepository;
import org.appsec.securityRAT.repository.search.RequirementSkeletonSearchRepository;
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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing RequirementSkeleton.
 */
@RestController
@RequestMapping("/api")
public class RequirementSkeletonResource {

    private final Logger log = LoggerFactory.getLogger(RequirementSkeletonResource.class);

    @Inject
    private RequirementSkeletonRepository requirementSkeletonRepository;

    @Inject
    private ProjectTypeRepository projectTypeRepository;

    @Inject
    private CollectionInstanceRepository collectionInstanceRepository;

    @Inject
    private RequirementSkeletonSearchRepository requirementSkeletonSearchRepository;

    /**
     * POST  /requirementSkeletons -> Create a new requirementSkeleton.
     */
    @RequestMapping(value = "/requirementSkeletons",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<RequirementSkeleton> create(@RequestBody RequirementSkeleton requirementSkeleton) throws URISyntaxException {
        log.debug("REST request to save RequirementSkeleton : {}", requirementSkeleton);
        if (requirementSkeleton.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new requirementSkeleton cannot already have an ID").body(null);
        }
        RequirementSkeleton result = requirementSkeletonRepository.save(requirementSkeleton);
        requirementSkeletonSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/requirementSkeletons/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("requirementSkeleton", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /requirementSkeletons -> Updates an existing requirementSkeleton.
     */
    @RequestMapping(value = "/requirementSkeletons",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<RequirementSkeleton> update(@RequestBody RequirementSkeleton requirementSkeleton) throws URISyntaxException {
        log.debug("REST request to update RequirementSkeleton : {}", requirementSkeleton);
        if (requirementSkeleton.getId() == null) {
            return create(requirementSkeleton);
        }
        RequirementSkeleton result = requirementSkeletonRepository.save(requirementSkeleton);
        requirementSkeletonSearchRepository.save(requirementSkeleton);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("requirementSkeleton", requirementSkeleton.getId().toString()))
                .body(result);
    }

    /**
     * GET  /requirementSkeletons -> get all the requirementSkeletons.
     */
    @RequestMapping(value = "/requirementSkeletons",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<RequirementSkeleton> getAll() {
        log.debug("REST request to get all RequirementSkeletons");
        return requirementSkeletonRepository.findAllWithEagerRelationships();
    }

    /**
     * GET  /requirementSkeletons/:id -> get the "id" requirementSkeleton.
     */
    @RequestMapping(value = "/requirementSkeletons/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<RequirementSkeleton> get(@PathVariable Long id) {
        log.debug("REST request to get RequirementSkeleton : {}", id);
        return Optional.ofNullable(requirementSkeletonRepository.findOneWithEagerRelationships(id))
            .map(requirementSkeleton -> new ResponseEntity<>(
                requirementSkeleton,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET /requirementSkeletons/getSelected --> get category and project type specific requirementSkeletons.
     * @author dkefer
     * @param collections: list of ids of collectionInstances
     * @param projecttypes: list of ids of project types
     *
     *
     */
    @RequestMapping(value="/requirementSkeletons/getSelected",
    		method=RequestMethod.GET,
    		produces = MediaType.APPLICATION_JSON_VALUE)
    //public ResponseEntity<Set<RequirementSkeleton>> get(@RequestParam Map<String,String> allRequestParams) {
    public List<RequirementSkeleton> get(@RequestParam("collections") Long[] collections, @RequestParam("projecttypes") Long[] projectTypes) {
    	/**
    	 * @author dkefer
    	 * @ToDo: this should be implemented in requirementSkeletonRepository -> best way to be found
    	 * @ToDo: implement "or" within particular collections and project types if more get selected
    	 */
    	//getting list of collection categories for which collection instances have been requested in order to perform OR within them
    	List<CollectionCategory> collectionCategories = new ArrayList<CollectionCategory>();
    	for (Long collectionId:collections) {
    		CollectionInstance collectionInstance = collectionInstanceRepository.findOne(collectionId);
    		if (!collectionCategories.contains(collectionInstance.getCollectionCategory()))
    			collectionCategories.add(collectionInstance.getCollectionCategory());
    	}



    	List<RequirementSkeleton> skeletons = (requirementSkeletonRepository.findAllWithEagerRelationships());
    	// Walking through the list of all skeletons, if a skeleton is not in all collections and projecttypes, it gets marked for deletion
    	for (Iterator<RequirementSkeleton> iterator = skeletons.iterator(); iterator.hasNext();) {
    		RequirementSkeleton skeleton = iterator.next();
    		boolean toDelete = false;

    		for (CollectionCategory collectionCategory:collectionCategories) {
    			boolean atLeastInOneCollection = false;
    			for (Long collectionId:collections) {
    				CollectionInstance collectionInstance = collectionInstanceRepository.findOne(collectionId);
    				if (collectionInstance.getCollectionCategory().equals(collectionCategory))
    					if (collectionInstance.getRequirementSkeletons().contains(skeleton))
    						atLeastInOneCollection = true;
    			}
    			if (!atLeastInOneCollection)
    				toDelete = true;
    		}
      		for (Long projectTypeId:projectTypes) {
    			ProjectType projectType = projectTypeRepository.findOne(projectTypeId);

    			if (!projectType.getRequirementSkeletons().contains(skeleton))
    				toDelete = true;
    		}
    	if (toDelete) iterator.remove();
    	}
    	return skeletons;

    }

    /**
     * DELETE  /requirementSkeletons/:id -> delete the "id" requirementSkeleton.
     */
    @RequestMapping(value = "/requirementSkeletons/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("REST request to delete RequirementSkeleton : {}", id);
        requirementSkeletonRepository.delete(id);
        requirementSkeletonSearchRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("requirementSkeleton", id.toString())).build();
    }

    /**
     * SEARCH  /_search/requirementSkeletons/:query -> search for the requirementSkeleton corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/requirementSkeletons/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<RequirementSkeleton> search(@PathVariable String query) {
        return StreamSupport
            .stream(requirementSkeletonSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }



    /**
     * just for testing the repository
     *
     */
    @RequestMapping(value = "/requirementSkeletons/foo/{shortName}",
    		method = RequestMethod.GET,
    		produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<RequirementSkeleton> foo(@PathVariable String shortName) {
    //public List<RequirementSkeleton> foo() {
    //log.debug(shortName);
    	return requirementSkeletonRepository.findByShortName(shortName);
    }
}
