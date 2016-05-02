package org.appsec.securityRAT.repository;

import java.util.List;

import org.appsec.securityRAT.domain.ProjectType;

public interface ProjectTypeRepositoryCustom {

	List<ProjectType>findAllActiveWithEagerActiveRelationships();

}
