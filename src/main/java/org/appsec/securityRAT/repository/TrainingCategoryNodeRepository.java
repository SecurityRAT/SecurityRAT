package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.TrainingCategoryNode;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingCategoryNode entity.
 */
public interface TrainingCategoryNodeRepository extends JpaRepository<TrainingCategoryNode,Long> {

}
