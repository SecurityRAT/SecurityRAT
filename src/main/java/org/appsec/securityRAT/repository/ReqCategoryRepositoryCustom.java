package org.appsec.securityRAT.repository;

import java.util.List;

import org.appsec.securityRAT.domain.CollectionInstance;
import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.domain.ReqCategory;

public interface ReqCategoryRepositoryCustom {

	List<ReqCategory> findEagerlyCategoriesWithRequirements(List<CollectionInstance> collectionInstances, List<ProjectType> projectTypes);

}
