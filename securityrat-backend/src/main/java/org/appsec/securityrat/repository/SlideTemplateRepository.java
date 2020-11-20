package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.SlideTemplate;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the SlideTemplate entity.
 */
public interface SlideTemplateRepository extends JpaRepository<SlideTemplate,Long> {

}
