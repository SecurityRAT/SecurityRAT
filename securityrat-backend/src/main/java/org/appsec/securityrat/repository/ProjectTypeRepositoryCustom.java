package org.appsec.securityrat.repository;

import java.util.List;

import org.appsec.securityrat.domain.ProjectType;

public interface ProjectTypeRepositoryCustom {

	List<ProjectType>findAllActiveWithEagerActiveRelationships();

}
