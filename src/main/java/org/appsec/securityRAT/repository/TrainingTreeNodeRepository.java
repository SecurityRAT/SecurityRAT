package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.Training;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingTreeNode entity.
 */
public interface TrainingTreeNodeRepository extends JpaRepository<TrainingTreeNode,Long> {

    @Query("select distinct trainingTreeNode from TrainingTreeNode trainingTreeNode where trainingTreeNode.training_id = :training and trainingTreeNode.parent_id is null")
    TrainingTreeNode getTrainingRoot(@Param("training") Training training);

    @Query("select distinct trainingTreeNode from TrainingTreeNode trainingTreeNode where trainingTreeNode.parent_id = :parent_node order by trainingTreeNode.sort_order")
    List<TrainingTreeNode> getChildrenOf(@Param("parent_node") TrainingTreeNode parentNode);
}
