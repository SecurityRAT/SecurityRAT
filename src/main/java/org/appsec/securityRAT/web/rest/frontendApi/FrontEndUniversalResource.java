package org.appsec.securityRAT.web.rest.frontendApi;

import java.util.*;
import java.util.stream.Collectors;

import javax.inject.Inject;

import org.appsec.securityRAT.domain.AlternativeInstance;
import org.appsec.securityRAT.domain.AlternativeSet;
import org.appsec.securityRAT.domain.CollectionCategory;
import org.appsec.securityRAT.domain.CollectionInstance;
import org.appsec.securityRAT.domain.OptColumn;
import org.appsec.securityRAT.domain.OptColumnContent;
import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.domain.ReqCategory;
import org.appsec.securityRAT.domain.RequirementSkeleton;
import org.appsec.securityRAT.domain.TagCategory;
import org.appsec.securityRAT.repository.AlternativeInstanceRepository;
import org.appsec.securityRAT.repository.AlternativeSetRepository;
import org.appsec.securityRAT.repository.CollectionCategoryRepository;
import org.appsec.securityRAT.repository.CollectionInstanceRepository;
import org.appsec.securityRAT.repository.OptColumnContentRepository;
import org.appsec.securityRAT.repository.OptColumnRepository;
import org.appsec.securityRAT.repository.ProjectTypeRepository;
import org.appsec.securityRAT.repository.ReqCategoryRepository;
import org.appsec.securityRAT.repository.RequirementSkeletonRepository;
import org.appsec.securityRAT.repository.TagCategoryRepository;
import org.appsec.securityRAT.web.rest.dto.FEAlternativeInstanceDTO;
import org.appsec.securityRAT.web.rest.dto.FECategoryDTO;
import org.appsec.securityRAT.web.rest.dto.FECollectionCategoryDTO;
import org.appsec.securityRAT.web.rest.dto.FEOptionColumnAlternativeDTO;
import org.appsec.securityRAT.web.rest.dto.FEProjectTypeDTO;
import org.appsec.securityRAT.web.rest.dto.FETagCategoryDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;


/**
 *
 * @author dkefer
 * REST controller for getting data for a frontend user
 */
@RestController
@RequestMapping("/frontend-api")
public class FrontEndUniversalResource {

	private final Logger log = LoggerFactory.getLogger(FrontEndUniversalResource.class);

    @Inject
    private CollectionCategoryRepository collectionCategoryRepository;

    @Inject
    private ReqCategoryRepository reqCategoryRepository;

    @Inject
    private CollectionInstanceRepository collectionInstanceRepository;

    @Inject
    private TagCategoryRepository tagCategoryRepository;

    @Inject
    private RequirementSkeletonRepository requirementSkeletonRepository;

    @Inject
    private ProjectTypeRepository projectTypeRepository;

    @Inject
    private OptColumnRepository optColumnRepository;
    
    @Inject
    private OptColumnContentRepository optColumnContentRepository;

    @Inject
    private AlternativeInstanceRepository alternativeInstanceRepository;

    @Inject
    private AlternativeSetRepository alternativeSetRepository;

	/**
     * GET  /collections
     * returns all active collection categories and their active collection instances
     */
    @RequestMapping(value = "/collections",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<FECollectionCategoryDTO> getCollections() {
        log.debug("REST request to get all collection catetories and their collection instances");
        List<CollectionCategory> collectionCategories = collectionCategoryRepository.findAllActiveWithEagerActiveRelationships();
        List<FECollectionCategoryDTO> feCollectionCategoryDTOs = new ArrayList<FECollectionCategoryDTO>();
        for (CollectionCategory collectionCategory : collectionCategories) {
        	feCollectionCategoryDTOs.add(new FECollectionCategoryDTO(collectionCategory));
        }
        return feCollectionCategoryDTOs;
    }


    /**
     * GET /projectTypes
     * returns all active project types with all respective active objects (option columns, status columns with values)
     *
     */
    @RequestMapping(value = "/projectTypes",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public Set<FEProjectTypeDTO> getProjectTypes() {
    	log.debug("REST request to get project types");
    	List<ProjectType> projectTypes = projectTypeRepository.findAllActiveWithEagerActiveRelationships();
    	Set<FEProjectTypeDTO> feProjectTypeDTOs = new LinkedHashSet<FEProjectTypeDTO>();
    	for (ProjectType projectType : projectTypes) {
    		feProjectTypeDTOs.add(new FEProjectTypeDTO(projectType));
    	}
    	return feProjectTypeDTOs;
    }

	/**
     * GET  /collections
     * returns all active collection categories and their active collection instances
     */
    @RequestMapping(value = "/tags",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<FETagCategoryDTO> getTags() {
        log.debug("REST request to get all tag catetories and their tag instances");
        List<TagCategory> tagCategories = tagCategoryRepository.findAllActiveWithEagerActiveRelationships();
        List<FETagCategoryDTO> feTagCategoryDTOs = new ArrayList<FETagCategoryDTO>();
        for (TagCategory tagCategory : tagCategories) {
        	feTagCategoryDTOs.add(new FETagCategoryDTO(tagCategory));
        }
        return feTagCategoryDTOs;
    }

    /**
     * GET  /reqCategorys -> get all active requirement categories.
     */
    @RequestMapping(value = "/requirementCategories",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<ReqCategory> getAllActiveReqCategories() {
        log.debug("REST request to get all ReqCategories");
        return reqCategoryRepository.findAllActive();
    }
    
    /**
     * return all active requirement skeletons.
     * @return
     */
    @RequestMapping(value = "/requirementSkeletons",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<RequirementSkeleton> getAllActiveRequirements() {
        log.debug("REST request to get all Requirements");
        return requirementSkeletonRepository.findAllActiveWithEagerRelationships();
    }
    
    @RequestMapping(value = "/alternativeinstances",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<AlternativeInstance> alternativeInstances() {
        log.debug("REST request to get all active alternative instances");
        List<AlternativeInstance> instances = new ArrayList<AlternativeInstance>();
        for (AlternativeInstance instance : alternativeInstanceRepository.findAll()) {
			if(instance.getAlternativeSet().getActive()) {
				instances.add(instance);
			}
		}
        return instances;
    }
    
    @RequestMapping(value = "/optColumnContents",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<OptColumnContent> getAll() {
        log.debug("REST request to get all active OptColumnContents");
        List<OptColumnContent> contents = new ArrayList<OptColumnContent>();
        for (OptColumnContent element : optColumnContentRepository.findAll()) {
			if(element.getOptColumn().getActive()) {
				contents.add(element);
			}
		};
		return contents;
    }
    
    /**
     * Get active requirement by id
     * @param id
     * @return
     */
    @RequestMapping(value = "/requirementSkeletons/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<RequirementSkeleton> getActiveRequirement(@PathVariable Long id) {
        log.debug("REST request requirement {}", id);
        for (RequirementSkeleton requirement : requirementSkeletonRepository.findAllActiveWithEagerRelationships()) {
			if(requirement.getId() == id) {
				return new ResponseEntity<RequirementSkeleton>(requirement, HttpStatus.OK);
			}
		};
        return new ResponseEntity<RequirementSkeleton>(HttpStatus.NOT_FOUND);
    }

    /**
     * GET /requirementSkeletons/getSelected --> get category and project type specific requirementSkeletons.
     * @author dkefer
     * @param collections: list of ids of collectionInstances
     * @param projecttypes: list of ids of project types
     * @TODO: return categories with appropriate skeletons
     *
     *
     */
    @RequestMapping(value="/categoriesWithRequirements/filter",
    		method=RequestMethod.GET,
    		produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    //public ResponseEntity<Set<RequirementSkeleton>> get(@RequestParam Map<String,String> allRequestParams) {
    public Set<FECategoryDTO> getCategoriesWithSkeletons(@RequestParam("collections") Long[] collectionIds, @RequestParam("projectTypes") Long[] projectTypeIds) {
    	/**
    	 * @author dkefer
    	 */

    	List<CollectionInstance> collectionInstances = new ArrayList<CollectionInstance>();
    	for (Long colId : collectionIds) {
    		collectionInstances.add(collectionInstanceRepository.findOne(colId));
    	}
    	List<ProjectType> projectTypes = new ArrayList<ProjectType>();
    	for (Long projectTypeId : projectTypeIds) {
    		projectTypes.add(projectTypeRepository.findOne(projectTypeId));
    	}

    	List<ReqCategory> reqCategories = reqCategoryRepository.findEagerlyCategoriesWithRequirements(collectionInstances, projectTypes);
    	Set<FECategoryDTO> categoryDTOs = new HashSet<FECategoryDTO>();
    	/*
    	List<CollectionInstance> collectionInstances = new ArrayList<CollectionInstance>();
    	for (Long colId : collectionIds) {
    		collectionInstances.add(collectionInstanceRepository.findOne(colId));
    	}
    	List<ProjectType> projectTypes = new ArrayList<ProjectType>();
    	for (Long projectTypeId : projectTypeIds) {
    		projectTypes.add(projectTypeRepository.findOne(projectTypeId));
    	}
    	List<ReqCategory> reqCategories = reqCategoryRepository.findAllActive();
    	List<RequirementSkeleton> skeletons = requirementSkeletonRepository.findSkeletonsByCollectionsAndProjectType(collectionInstances, projectTypes);
    	Set<FERequirementDTO> feRequirementDTOs = new HashSet<FERequirementDTO>();
    	for (RequirementSkeleton skeleton: skeletons) {
    		feRequirementDTOs.add(new FERequirementDTO(skeleton));
    	}
    	return feRequirementDTOs;
		*/
        for (ReqCategory reqCategory : reqCategories) {
        	categoryDTOs.add(new FECategoryDTO(reqCategory));
        }
        return categoryDTOs;
    }

    @RequestMapping(value="/categoriesWithRequirementsSorted/filter",
        method=RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    //public ResponseEntity<Set<RequirementSkeleton>> get(@RequestParam Map<String,String> allRequestParams) {
    public List<FECategoryDTO> getCategoriesWithSkeletonsSorted(@RequestParam("collections") Long[] collectionIds, @RequestParam("projectTypes") Long[] projectTypeIds) {

        List<CollectionInstance> collectionInstances = new ArrayList<CollectionInstance>();
        for (Long colId : collectionIds) {
            collectionInstances.add(collectionInstanceRepository.findOne(colId));
        }
        List<ProjectType> projectTypes = new ArrayList<ProjectType>();
        for (Long projectTypeId : projectTypeIds) {
            projectTypes.add(projectTypeRepository.findOne(projectTypeId));
        }

        List<ReqCategory> reqCategories = reqCategoryRepository.findEagerlyCategoriesWithRequirements(collectionInstances, projectTypes);

        List<FECategoryDTO> categoryDTOs = reqCategories.stream().map(reqCategory -> new FECategoryDTO(reqCategory)).collect(Collectors.toList());
        Collections.sort(categoryDTOs, Comparator.comparingInt(FECategoryDTO::getShowOrder));

        return categoryDTOs;
    }
    /*
    @RequestMapping(value = "/testOptColumns/{projectTypeId}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Set<OptColumn> optColumns(@PathVariable Long projectTypeId) {
    	//ProjectType projectType = projectTypeRepository.findOne(projectTypeId);
    	Set<OptColumn> optColumns = optColumnRepository.getActiveRelevantOptcolumnsForProjectType(projectTypeId);
    	return optColumns;
    }*/

    //get alternative instances for given alternative set
    @RequestMapping(value = "/alternativeInstances/filter",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Set<FEAlternativeInstanceDTO> getAlternativeInstancesForAlternativeSet(@RequestParam("alternativeSet") Long alternativeSetId) {
    	AlternativeSet alternativeSet = alternativeSetRepository.findOne(alternativeSetId);
    	Set<AlternativeInstance> alternativeInstances = alternativeInstanceRepository.getActiveAlternativeInstancesForAlternativeSet(alternativeSet);
    	Set<FEAlternativeInstanceDTO> alternativeInstanceDTOs = new HashSet<FEAlternativeInstanceDTO>();
    	for (AlternativeInstance alternativeInstance : alternativeInstances) {
    		alternativeInstanceDTOs.add(new FEAlternativeInstanceDTO(alternativeInstance));
    	}
    	return alternativeInstanceDTOs;
    }

    //get list of active option columns with relevant active alternative sets
    @RequestMapping(value = "/optionColumnsWithAlternativeSets",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Set<FEOptionColumnAlternativeDTO> getOptionColumnsWithAlternativeSets() {
    	Set<OptColumn> optColumns = optColumnRepository.getActiveOptColumnsWithActiveAlternativeSets();
    	Set<FEOptionColumnAlternativeDTO> optColumnDTOs = new HashSet<FEOptionColumnAlternativeDTO>();
    	for (OptColumn optColumn : optColumns) {
    		optColumnDTOs.add(new FEOptionColumnAlternativeDTO(optColumn));
    	}
    	return optColumnDTOs;
    }
}
