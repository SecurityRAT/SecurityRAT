package org.appsec.securityrat.repository;

import java.util.List;

import org.appsec.securityrat.domain.CollectionInstance;
import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.domain.ReqCategory;

public interface ReqCategoryRepositoryCustom {

	List<ReqCategory> findEagerlyCategoriesWithRequirements(List<CollectionInstance> collectionInstances, List<ProjectType> projectTypes);

}
