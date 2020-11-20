package org.appsec.securityrat.api.provider.advanced;

import java.util.Set;
import org.appsec.securityrat.api.dto.rest.OptColumnContentDto;
import org.appsec.securityrat.api.provider.IdentifiableProvider;

public interface OptColumnContentProvider
        extends IdentifiableProvider<Long, OptColumnContentDto> {
    
    /**
     * Returns all {@link OptColumnContentDto} that are associated with the
     * specified <code>requirementSkeletonId</code>.
     * 
     * @param requirementSkeletonId The identifier of the requirement skeleton
     *                              whose associated {@link OptColumnContentDto}
     *                              instances you want to retrieve.
     * 
     * @return Either a list of all associated requirement skeleton instances or
     *         <code>null</code>, if an error occurs or if the requirement
     *         skeleton does not exist.
     */
    Set<OptColumnContentDto> findByRequirementSkeleton(
            Long requirementSkeletonId);
    
    // TODO [luis.felger@bosch.com]: Find out what the following method really
    //                               does and document it.
    
    Set<OptColumnContentDto> findByRequirementSkeletonAndProjectType(
            Long requirementSkeletonId,
            Long projectTypeId);
    
    // TODO [luis.felger@bosch.com]: Find out what the following method really
    //                               does and document it.
    
    OptColumnContentDto findByOptColumnAndRequirementSkeleton(
            Long optColumnId,
            Long requirementSkeletonId);
}
