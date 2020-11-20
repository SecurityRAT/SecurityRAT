package org.appsec.securityrat.repository;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.appsec.securityrat.domain.CollectionCategory;
import org.appsec.securityrat.domain.CollectionInstance;
import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.springframework.beans.factory.annotation.Autowired;

public class RequirementSkeletonRepositoryImpl implements RequirementSkeletonRepositoryCustom {

	@Inject
	RequirementSkeletonRepository requirementSkeletonRepository;

	// @PersistenceContext
	// private EntityManager em;

	@Override
	public List<RequirementSkeleton> findSkeletonsByCollectionsAndProjectType(List<CollectionInstance> collectionInstances, List<ProjectType> projectTypes) {
		// TODO Auto-generated method stub
		//em.createQuery(arg0)
		List<RequirementSkeleton> requirementSkeletons = new ArrayList<RequirementSkeleton>();
		List<CollectionCategory> collectionCategories = new ArrayList<CollectionCategory>();

    	//getting list of collection categories for which collection instances have been requested in order to perform OR within them
    	for (CollectionInstance collectionInstance : collectionInstances) {
    		if (!collectionCategories.contains(collectionInstance.getCollectionCategory()))
    			collectionCategories.add(collectionInstance.getCollectionCategory());
    	}


    	/**
    	 * TODO: To be implemented properly
    	 */

    	List<RequirementSkeleton> skeletons = (requirementSkeletonRepository.findAllWithEagerRelationships());
    	// Walking through the list of all skeletons, if a skeleton is not in all collections and projecttypes, it gets marked for deletion
    	for (Iterator<RequirementSkeleton> iterator = skeletons.iterator(); iterator.hasNext();) {
    		RequirementSkeleton skeleton = iterator.next();
    		boolean toDelete = false;

    		for (CollectionCategory collectionCategory:collectionCategories) {
    			boolean atLeastInOneCollection = false;
    			for (CollectionInstance collectionInstance : collectionInstances) {
    				if (collectionInstance.getCollectionCategory().equals(collectionCategory))
    					if (collectionInstance.getRequirementSkeletons().contains(skeleton))
    						atLeastInOneCollection = true;
    			}
    			if (!atLeastInOneCollection)
    				toDelete = true;
    		}
      		for (ProjectType projectType : projectTypes) {
    			if (!projectType.getRequirementSkeletons().contains(skeleton))
    				toDelete = true;
    		}
    	if (toDelete) iterator.remove();
    	}
    	return skeletons;

	}


}
