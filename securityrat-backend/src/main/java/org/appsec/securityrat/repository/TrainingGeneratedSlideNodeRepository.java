package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.TrainingGeneratedSlideNode;
import org.appsec.securityrat.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the TrainingGeneratedSlideNode entity.
 */
public interface TrainingGeneratedSlideNodeRepository extends JpaRepository<TrainingGeneratedSlideNode,Long> {

    @Query("select distinct trainingGeneratedSlideNode from TrainingGeneratedSlideNode trainingGeneratedSlideNode where trainingGeneratedSlideNode.node = :node")
    TrainingGeneratedSlideNode getTrainingGeneratedSlideNodeByTrainingTreeNode(@Param("node") TrainingTreeNode node);

}
