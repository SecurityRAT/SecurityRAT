package org.appsec.securityRAT.repository;

import java.util.List;

import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.domain.StatusColumn;
import org.springframework.beans.factory.annotation.Autowired;

public class ProjectTypeRepositoryImpl implements ProjectTypeRepositoryCustom {

	@Autowired
	ProjectTypeRepository projectTypeRepository;

	@Autowired
	OptColumnRepository optColumnRepository;

	@Autowired
	StatusColumnRepository statusColumnRepository;

	@Autowired
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
