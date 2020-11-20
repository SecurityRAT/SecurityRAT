package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.ProjectType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Data JPA repository for the ProjectType entity.
 */
@Transactional
public interface ProjectTypeRepository extends JpaRepository<ProjectType,Long>, ProjectTypeRepositoryCustom {

    @Query("select distinct projectType from ProjectType projectType left join fetch projectType.statusColumns left join fetch projectType.optColumns")
    List<ProjectType> findAllWithEagerRelationships();

    @Query("select projectType from ProjectType projectType left join fetch projectType.statusColumns left join fetch projectType.optColumns where projectType.id =:id")
    ProjectType findOneWithEagerRelationships(@Param("id") Long id);

    /*
    @Query("select distinct pt from ProjectType pt "
    		+ "left join fetch pt.optColumns oc "
    		+ "left join fetch pt.statusColumns sc "
    		+ "left join fetch sc.statusColumnValues scv "
    		+ "where pt.active=true and sc.active=true")
    List<ProjectType>findAllActiveWithEagerActiveRelationships();
	*/

    @Query("select distinct pt from ProjectType pt where pt.active=true")
    List<ProjectType>findAllActiveProjectTypes();
}
