package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.ConfigConstant;
import org.springframework.data.jpa.repository.*;

/**
 * Spring Data JPA repository for the OptColumnType entity.
 */
public interface ConfigConstantRepository extends JpaRepository<ConfigConstant,Long> {

}
