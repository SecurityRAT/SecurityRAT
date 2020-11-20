package org.appsec.securityrat.api.provider.advanced;

import java.util.Set;
import org.appsec.securityrat.api.dto.rest.RequirementSkeletonDto;
import org.appsec.securityrat.api.provider.IdentifiableProvider;

public interface RequirementSkeletonProvider
        extends IdentifiableProvider<Long, RequirementSkeletonDto> {
    
    /**
     * Returns all {@link RequirementSkeletonDto}s that are part of at least one
     * of the specified
     * {@link org.appsec.securityrat.api.dto.rest.CollectionInstanceDto}s and
     * part of at least one of the specified
     * {@link org.appsec.securityrat.api.dto.rest.ProjectTypeDto}s.
     * 
     * If one or multiple identifiers of collection instances or project types
     * are invalid/unknown, they will be ignored.
     * 
     * @param collectionInstanceIds The identifiers of all included collection
     *                              instances
     * 
     * @param projectTypeIds The identifiers of all included project types.
     * 
     * @return The requirement skeletons that match the parameters or
     *         <code>null</code>, if an error occurred.
     */
    Set<RequirementSkeletonDto> getIntersection(
            Long[] collectionInstanceIds,
            Long[] projectTypeIds);
    
    /**
     * Returns all {@link RequirementSkeletonDto}s whose
     * {@link RequirementSkeletonDto#shortName} is <code>shortName</code>.
     * 
     * @param shortName The short name that is looked for.
     * 
     * @return All matching requirement skeletons or <code>null</code>, if an
     *         error occurred.
     */
    Set<RequirementSkeletonDto> findByShortName(String shortName);
}
