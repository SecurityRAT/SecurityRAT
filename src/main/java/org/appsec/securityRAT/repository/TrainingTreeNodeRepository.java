package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingTreeNode entity.
 */
public interface TrainingTreeNodeRepository extends JpaRepository<TrainingTreeNode,Long> {

}
