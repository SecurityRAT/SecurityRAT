package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.AlternativeSet;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the AlternativeSet entity.
 */
public interface AlternativeSetRepository extends JpaRepository<AlternativeSet,Long> {

}
