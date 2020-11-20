package org.appsec.securityrat.repository;

import org.appsec.securityrat.domain.TagCategory;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the TagCategory entity.
 */
public interface TagCategoryRepository extends JpaRepository<TagCategory,Long> {

	/**
	 * @author: dkefer
	 * Getting all ACTIVE tag categories with all respective ACTIVE tag instances
	 */
    @Query("select distinct tagCategory, tagInstance from TagCategory tagCategory "
    		+ "left join fetch tagCategory.tagInstances tagInstance "
    		+ "where tagCategory.active=true and tagInstance.active=true")
	List<TagCategory> findAllActiveWithEagerActiveRelationships();

}
