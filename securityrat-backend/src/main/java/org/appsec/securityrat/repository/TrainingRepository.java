package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.Training;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the Training entity.
 */
public interface TrainingRepository extends JpaRepository<Training,Long> {

    @Query("select distinct training from Training training left join fetch training.optColumns left join fetch training.collections left join fetch training.projectTypes")
    List<Training> findAllWithEagerRelationships();

    @Query("select training from Training training left join fetch training.optColumns left join fetch training.collections left join fetch training.projectTypes where training.id =:id")
    Training findOneWithEagerRelationships(@Param("id") Long id);

}
