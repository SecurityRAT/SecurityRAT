package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.TrainingBranchNode;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the TrainingBranchNode entity.
 */
public interface TrainingBranchNodeRepository extends JpaRepository<TrainingBranchNode,Long> {

    @Query("select distinct trainingBranchNode from TrainingBranchNode trainingBranchNode where trainingBranchNode.node = :node")
    TrainingBranchNode getTrainingBranchNodeByTrainingTreeNode(@Param("node") TrainingTreeNode node);

}
