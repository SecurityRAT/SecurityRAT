package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.OptColumn;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Set;

/**
 * Spring Data JPA repository for the OptColumn entity.
 */
public interface OptColumnRepository extends JpaRepository<OptColumn,Long> {

	@Query("select distinct optColumn from OptColumn optColumn left join fetch optColumn.projectTypes pt "
			+ "where pt.id=:projectTypeId and optColumn.active=true")
	Set<OptColumn> getActiveRelevantOptcolumnsForProjectType(@Param("projectTypeId") Long projectTypeId);


	@Query("select distinct optColumn from OptColumn optColumn "
			+ "left join fetch optColumn.alternativeSets altSet "
			+ "where optColumn.active=true "
			+ "and altSet.active=true")
	Set<OptColumn> getActiveOptColumnsWithActiveAlternativeSets();

	String text = "select distinct requirementSkeleton from RequirementSkeleton requirementSkeleton left join fetch requirementSkeleton.tagInstances "
			+ "left join fetch requirementSkeleton.collectionInstances "
			+ "left join fetch requirementSkeleton.projectTypes "
			+ "where requirementSkeleton.active=true";

}
