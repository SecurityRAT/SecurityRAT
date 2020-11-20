package org.appsec.securityrat.repository;

import java.util.List;

import javax.inject.Inject;

import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.domain.StatusColumn;
import org.springframework.beans.factory.annotation.Autowired;

public class ProjectTypeRepositoryImpl implements ProjectTypeRepositoryCustom {

	@Inject
	ProjectTypeRepository projectTypeRepository;

	@Inject
	OptColumnRepository optColumnRepository;

	@Inject
	StatusColumnRepository statusColumnRepository;

	@Inject
	StatusColumnValueRepository statusColumnValueRepository;


	@Override
	public List<ProjectType> findAllActiveWithEagerActiveRelationships() {
		// TODO Auto-generated method stub

		List<ProjectType> allProjectTypes = projectTypeRepository.findAllActiveProjectTypes();
		for (ProjectType projectType : allProjectTypes) {
			projectType.setOptColumns(optColumnRepository.getActiveRelevantOptcolumnsForProjectType(projectType.getId()));
			projectType.setStatusColumns(statusColumnRepository.getActiveStatusColumnsForProjectType(projectType));
			for (StatusColumn statusColumn : projectType.getStatusColumns()) {
				if (statusColumn.getIsEnum()) {
					statusColumn.setStatusColumnValues(statusColumnValueRepository.getActiveValuesForStatusColumn(statusColumn));
				}
			}
		}
		return allProjectTypes;
	}

}
