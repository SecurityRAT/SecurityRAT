package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.TrainingCustomSlideNode;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for the TrainingCustomSlideNode entity.
 */
public interface TrainingCustomSlideNodeRepository extends JpaRepository<TrainingCustomSlideNode,Long> {

    @Query("select distinct trainingCustomSlideNode from TrainingCustomSlideNode trainingCustomSlideNode where trainingCustomSlideNode.node = :node")
    TrainingCustomSlideNode getTrainingCustomSlideNodeByTrainingTreeNode(@Param("node") TrainingTreeNode node);

}
