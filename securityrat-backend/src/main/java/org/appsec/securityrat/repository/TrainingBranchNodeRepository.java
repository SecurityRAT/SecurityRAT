package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.TrainingBranchNode;
import org.appsec.securityrat.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the TrainingBranchNode entity.
 */
public interface TrainingBranchNodeRepository extends JpaRepository<TrainingBranchNode,Long> {

    @Query("select distinct trainingBranchNode from TrainingBranchNode trainingBranchNode where trainingBranchNode.node = :node")
    TrainingBranchNode getTrainingBranchNodeByTrainingTreeNode(@Param("node") TrainingTreeNode node);

}
