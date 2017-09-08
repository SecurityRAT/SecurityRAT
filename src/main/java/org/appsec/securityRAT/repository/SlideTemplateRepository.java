package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.SlideTemplate;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the SlideTemplate entity.
 */
public interface SlideTemplateRepository extends JpaRepository<SlideTemplate,Long> {

}
