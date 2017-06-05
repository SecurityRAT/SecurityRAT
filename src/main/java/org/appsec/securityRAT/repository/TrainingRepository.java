package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.Training;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the Training entity.
 */
public interface TrainingRepository extends JpaRepository<Training,Long> {

}
