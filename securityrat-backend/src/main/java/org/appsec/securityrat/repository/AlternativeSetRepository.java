package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.AlternativeSet;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the AlternativeSet entity.
 */
public interface AlternativeSetRepository extends JpaRepository<AlternativeSet,Long> {

}
