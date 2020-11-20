package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.Training;
import org.appsec.securityrat.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingTreeNode entity.
 */
public interface TrainingTreeNodeRepository extends JpaRepository<TrainingTreeNode,Long> {

    @Query("select distinct trainingTreeNode from TrainingTreeNode trainingTreeNode where trainingTreeNode.training_id = :training and trainingTreeNode.parent_id is null")
    TrainingTreeNode getTrainingRoot(@Param("training") Training training);

    @Query("select distinct trainingTreeNode from TrainingTreeNode trainingTreeNode where trainingTreeNode.parent_id = :parent_node order by trainingTreeNode.sort_order")
    List<TrainingTreeNode> getChildrenOf(@Param("parent_node") TrainingTreeNode parentNode);

    @Query("update TrainingTreeNode set parent_id = null where training_id = :training ")
    @Modifying
    @Transactional
    void removeParentRelationsForTraining(@Param("training") Training training);

    @Query("update TrainingTreeNode set parent_id = null where training_id = null ")
    @Modifying
    @Transactional
    void removeParentRelationsForNull();

    @Query("delete from TrainingTreeNode where training_id = null and parent_id = null ")
    @Modifying
    @Transactional
    void deleteAllNullified();

    @Query("select distinct trainingTreeNode from TrainingTreeNode trainingTreeNode where trainingTreeNode.training_id = :training ")
    List<TrainingTreeNode> getAllByTraining(@Param("training") Training training);

    @Query(value = "select max(sort_order) from TRAININGTREENODE where parent_id_id = ?1", nativeQuery = true)
    Integer getHighestSortOrder(Long id);
}
