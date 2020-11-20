package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.CollectionCategory;
import org.appsec.securityrat.domain.CollectionInstance;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the CollectionCategory entity.
 */
public interface CollectionCategoryRepository extends JpaRepository<CollectionCategory,Long> {


	/**
	 * @author: dkefer
	 * Getting all ACTIVE collection categories with all respective ACTIVE collection instances
	 */
    @Query("select distinct collectionCategory, collectionInstance from CollectionCategory collectionCategory "
    		+ "left join fetch collectionCategory.collectionInstances collectionInstance "
    		+ "where collectionCategory.active=true and collectionInstance.active=true")
    List<CollectionCategory> findAllActiveWithEagerActiveRelationships();

    @Query("select distinct collectionCategory from CollectionCategory collectionCategory "
    		+ "left join fetch collectionCategory.collectionInstances collectionInstance "
    		+ "where collectionInstance in :collectionInstances")
    List<CollectionCategory> findCollectionCategoriesForInstances(@Param("collectionInstances") List<CollectionInstance> collectionInstances);

}
