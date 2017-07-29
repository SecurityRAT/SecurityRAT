package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.TrainingGeneratedSlideNode;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the TrainingGeneratedSlideNode entity.
 */
public interface TrainingGeneratedSlideNodeRepository extends JpaRepository<TrainingGeneratedSlideNode,Long> {

}
