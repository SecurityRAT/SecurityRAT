package org.appsec.securityrat.repository;

import java.util.List;

import org.appsec.securityrat.domain.CollectionInstance;
import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.domain.RequirementSkeleton;

public interface RequirementSkeletonRepositoryCustom {

	List<RequirementSkeleton> findSkeletonsByCollectionsAndProjectType(List<CollectionInstance> collections, List<ProjectType> projectTypes);
}
