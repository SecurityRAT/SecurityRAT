package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.TrainingCategoryNode;
import org.appsec.securityrat.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingCategoryNode entity.
 */
public interface TrainingCategoryNodeRepository extends JpaRepository<TrainingCategoryNode,Long> {

    @Query("select distinct trainingCategoryNode from TrainingCategoryNode trainingCategoryNode where trainingCategoryNode.node = :node")
    TrainingCategoryNode getTrainingCategoryNodeByTrainingTreeNode(@Param("node") TrainingTreeNode node);

}
