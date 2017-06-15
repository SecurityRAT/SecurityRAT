package org.appsec.securityRAT.repository;

import org.appsec.securityRAT.domain.Training;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the Training entity.
 */
public interface TrainingRepository extends JpaRepository<Training,Long> {

    @Query("select training from Training training where training.author.login = ?#{principal.username}")
    List<Training> findByAuthorIsCurrentUser();

    @Query("select training from Training training where training.last_modified_by.login = ?#{principal.username}")
    List<Training> findByLast_modified_byIsCurrentUser();

}
