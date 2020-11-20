package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.RequirementSkeleton;
import org.appsec.securityrat.domain.TagInstance;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Set;

/**
 * Spring Data JPA repository for the TagInstance entity.
 */
public interface TagInstanceRepository extends JpaRepository<TagInstance,Long> {

	@Query("select distinct tagInstance from TagInstance tagInstance "
			+ "left join tagInstance.requirementSkeletons rs "
			+ "where :skeleton in rs "
			+ "and tagInstance.active=true")
	Set<TagInstance> getTagInstancesForSkeleton(@Param("skeleton") RequirementSkeleton skeleton);

}
