package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.AlternativeInstance;
import org.appsec.securityRAT.domain.AlternativeSet;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Set;

/**
 * Spring Data JPA repository for the AlternativeInstance entity.
 */
public interface AlternativeInstanceRepository extends JpaRepository<AlternativeInstance,Long> {

	@Query("select distinct alternativeInstance from AlternativeInstance alternativeInstance "
			+ "left join fetch alternativeInstance.requirementSkeleton rs "
			+ "where alternativeInstance.alternativeSet=:alternativeSet")
	public Set<AlternativeInstance> getActiveAlternativeInstancesForAlternativeSet(@Param("alternativeSet") AlternativeSet alternativeSet);
}
