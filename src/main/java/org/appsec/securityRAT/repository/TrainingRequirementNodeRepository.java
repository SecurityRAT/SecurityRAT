package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.TrainingRequirementNode;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingRequirementNode entity.
 */
public interface TrainingRequirementNodeRepository extends JpaRepository<TrainingRequirementNode,Long> {

}
