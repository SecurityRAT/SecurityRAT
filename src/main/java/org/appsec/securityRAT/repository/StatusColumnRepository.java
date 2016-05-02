package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.domain.StatusColumn;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Set;

/**
 * Spring Data JPA repository for the StatusColumn entity.
 */
public interface StatusColumnRepository extends JpaRepository<StatusColumn,Long> {

	@Query("select distinct statusColumn from StatusColumn statusColumn "
			+ "left join fetch statusColumn.projectTypes pt "
			+ "where statusColumn.active=true "
			+ "and pt=:projectType")
	Set<StatusColumn> getActiveStatusColumnsForProjectType(@Param("projectType") ProjectType projectType);

}
