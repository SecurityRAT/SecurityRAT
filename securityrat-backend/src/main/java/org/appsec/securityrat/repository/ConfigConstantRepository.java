package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.ConfigConstant;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the OptColumnType entity.
 */
public interface ConfigConstantRepository extends JpaRepository<ConfigConstant,Long> {

}
