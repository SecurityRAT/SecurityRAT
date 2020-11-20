package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.OptColumn;
import org.appsec.securityrat.domain.OptColumnContent;
import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Spring Data JPA repository for the OptColumnContent entity.
 */
public interface OptColumnContentRepository extends JpaRepository<OptColumnContent,Long> {

	/* the native query left in the comment for the moment, might be useful for future references
	@Query(value = "select * from OPTCOLUMNCONTENT left join OPTCOLUMN on OPTCOLUMNCONTENT.optcolumn_id = OPTCOLUMN.id "
			+ "left join PROJECTTYPE_OPTCOLUMN on OPTCOLUMN.id = PROJECTTYPE_OPTCOLUMN.optcolumns_id "
			+ "where OPTCOLUMNCONTENT.requirementskeleton_id = ?1 "
			+ "and PROJECTTYPE_OPTCOLUMN.projecttypes_id = ?2", nativeQuery = true)*/
	@Query("select optColumnContent from OptColumnContent optColumnContent "
			+ "left join optColumnContent.optColumn.projectTypes pt "
			+ "where optColumnContent.requirementSkeleton.id = :requirementId "
			+ "and pt.id = :projectTypeId")
	@Transactional
	List<OptColumnContent> findOptColumnsForRequirementIdAndProjectTypeId (
			@Param("requirementId") Long requirementSkeletonId,
			@Param("projectTypeId") Long projectTypeId);

	@Query("select distinct optColumnContent from OptColumnContent optColumnContent "
			+ "left join optColumnContent.optColumn.projectTypes pt "
			+ "left join optColumnContent.requirementSkeleton skeleton "
			+ "where skeleton = :skeleton "
			+ "and pt in :projectTypes "
			+ "and optColumnContent.optColumn.active = true")
	@Transactional
	Set<OptColumnContent> findOptColumnsForSkeletonAndProjectTypes (
			@Param("skeleton") RequirementSkeleton skeleton,
			@Param("projectTypes") List<ProjectType> projectTypes);

	@Query("select distinct optColumnContent from OptColumnContent optColumnContent "
            + "where optColumnContent.optColumn = :optColumn "
            + "and optColumnContent.requirementSkeleton = :skeleton")
    @Transactional
    List<OptColumnContent> getOptColumnContentByOptColumnAndRequirement(
        @Param("skeleton") RequirementSkeleton skeleton,
        @Param("optColumn")OptColumn optColumn);

}
