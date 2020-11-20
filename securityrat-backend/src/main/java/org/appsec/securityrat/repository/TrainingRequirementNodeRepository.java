package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.TrainingRequirementNode;
import org.appsec.securityrat.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the TrainingRequirementNode entity.
 */
public interface TrainingRequirementNodeRepository extends JpaRepository<TrainingRequirementNode,Long> {

    @Query("select distinct trainingRequirementNode from TrainingRequirementNode trainingRequirementNode where trainingRequirementNode.node = :node")
    TrainingRequirementNode getTrainingRequirementNodeByTrainingTreeNode(@Param("node") TrainingTreeNode node);

}
