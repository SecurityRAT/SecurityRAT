package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.domain.ReqCategory;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Spring Data JPA repository for the RequirementSkeleton entity.
 */
public interface RequirementSkeletonRepository extends JpaRepository<RequirementSkeleton,Long>, RequirementSkeletonRepositoryCustom {

    @Query("select distinct requirementSkeleton from RequirementSkeleton requirementSkeleton left join fetch requirementSkeleton.tagInstances left join fetch requirementSkeleton.collectionInstances left join fetch requirementSkeleton.projectTypes")
    List<RequirementSkeleton> findAllWithEagerRelationships();

    @Query("select distinct requirementSkeleton from RequirementSkeleton requirementSkeleton "
    		+ "left join fetch requirementSkeleton.tagInstances tg "
    		+ "left join fetch requirementSkeleton.collectionInstances coll "
    		+ "left join fetch requirementSkeleton.projectTypes pt "
    		+ "where requirementSkeleton.active=true "
    		+ "and pt.active=true "
    		+ "and coll.collectionCategory.active=true and coll.active=true")
    List<RequirementSkeleton> findAllActiveWithEagerRelationships();

    @Query("select requirementSkeleton from RequirementSkeleton requirementSkeleton left join fetch requirementSkeleton.tagInstances left join fetch requirementSkeleton.collectionInstances left join fetch requirementSkeleton.projectTypes where requirementSkeleton.id =:id")
    RequirementSkeleton findOneWithEagerRelationships(@Param("id") Long id);


    @Query("select distinct requirementSkeleton from RequirementSkeleton requirementSkeleton "
    		+ "left join fetch requirementSkeleton.projectTypes pt "
    		+ "left join fetch requirementSkeleton.collectionInstances col "
		+ "where requirementSkeleton.reqCategory=:reqCategory "
    		+ "and requirementSkeleton.active=true "
    		+ "and pt in :projectTypes")
    Set<RequirementSkeleton> findActiveReqsForCategoryAndProjectTypes(@Param("reqCategory") ReqCategory reqCategory, @Param("projectTypes") List<ProjectType> projectTypes);

    /*
     * just for testing purposes
     */
    @Query("select requirementSkeleton from RequirementSkeleton requirementSkeleton where requirementSkeleton.reqCategory.name like %:shortName%")
    @Transactional
    List<RequirementSkeleton> findByShortName(@Param("shortName") String shortName);
    //List<RequirementSkeleton> findFooBar();
    //test end

}
