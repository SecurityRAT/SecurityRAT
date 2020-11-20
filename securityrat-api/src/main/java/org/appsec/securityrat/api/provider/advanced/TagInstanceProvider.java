package org.appsec.securityrat.api.provider.advanced;

import java.util.Set;
import org.appsec.securityrat.api.dto.rest.TagInstanceDto;
import org.appsec.securityrat.api.provider.IdentifiableProvider;

public interface TagInstanceProvider
        extends IdentifiableProvider<Long, TagInstanceDto> {
    
    /**
     * Returns a collection of all {@link TagInstanceDto} instances that are
     * part of the {@link org.appsec.securityrat.api.dto.rest.TagCategoryDto}
     * with the specified <code>tagCategoryId</code>.
     * 
     * @param tagCategoryId The unique identifier the category whose instances
     *                      will be returned.
     * 
     * @return Either a collection of all instances that are part of the
     *         category or <code>null</code>, if there is no category with that
     *         identifier.
     */
    Set<TagInstanceDto> findByCategoryId(Long tagCategoryId);
}
