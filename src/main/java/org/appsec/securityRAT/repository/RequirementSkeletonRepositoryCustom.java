package org.appsec.securityRAT.repository;

import java.util.List;

import org.appsec.securityRAT.domain.CollectionInstance;
import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.domain.RequirementSkeleton;

public interface RequirementSkeletonRepositoryCustom {

	List<RequirementSkeleton> findSkeletonsByCollectionsAndProjectType(List<CollectionInstance> collections, List<ProjectType> projectTypes);
}
