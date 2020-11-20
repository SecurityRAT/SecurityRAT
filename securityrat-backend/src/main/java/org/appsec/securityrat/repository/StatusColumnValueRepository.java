package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.StatusColumn;
import org.appsec.securityrat.domain.StatusColumnValue;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Set;

/**
 * Spring Data JPA repository for the StatusColumnValue entity.
 */
public interface StatusColumnValueRepository extends JpaRepository<StatusColumnValue,Long> {

	@Query("select distinct value from StatusColumnValue value "
			+ "left join fetch value.statusColumn sc "
			+ "where value.active=true "
			+ "and sc=:statusColumn")
	Set<StatusColumnValue> getActiveValuesForStatusColumn(@Param("statusColumn") StatusColumn statusColumn);

}
