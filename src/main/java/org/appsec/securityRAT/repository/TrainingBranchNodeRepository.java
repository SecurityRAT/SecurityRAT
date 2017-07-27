package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.TrainingBranchNode;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingBranchNode entity.
 */
public interface TrainingBranchNodeRepository extends JpaRepository<TrainingBranchNode,Long> {

}
