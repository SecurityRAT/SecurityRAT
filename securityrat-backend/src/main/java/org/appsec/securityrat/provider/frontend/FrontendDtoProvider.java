package org.appsec.securityrat.provider.frontend;

import java.util.Set;
import org.appsec.securityrat.web.dto.FrontendAlternativeInstanceDto;
import org.appsec.securityrat.web.dto.FrontendCategoryDto;
import org.appsec.securityrat.web.dto.FrontendCollectionCategoryDto;
import org.appsec.securityrat.web.dto.FrontendOptionColumnAlternativeDto;
import org.appsec.securityrat.web.dto.FrontendProjectTypeDto;
import org.appsec.securityrat.web.dto.FrontendTagCategoryDto;

/**
 * An interface that provides access to frontend-specific DTOs.
 */
public interface FrontendDtoProvider {
    /**
     * Returns all active CollectionCategory instances in their frontend
     * representation.
     * 
     * @return Either all known CollectionCategory instances or
     *         <code>null</code>, if an error occurred.
     */
    Set<FrontendCollectionCategoryDto> getActiveFrontendCollectionCategories();
    
    /**
     * Returns all active ProjectType instances in their frontend
     * representation.
     * 
     * @return Either all known ProjectType instances or <code>null</code>, if
     *         an error occurred.
     */
    Set<FrontendProjectTypeDto> getActiveProjectTypes();
    
    /**
     * Returns all active TagCategory instances in their frontend
     * representation.
     * 
     * @return Either all known TagCategory instances or <code>null</code>, if
     *         an error occurred.
     */
    Set<FrontendTagCategoryDto> getActiveTagCategories();
    
    /**
     * Returns all active OptColumn instances in their frontend representation.
     * 
     * @return Either all knonw OptColumn instances or <code>null</code>, if an
     *         error occurred.
     */
    Set<FrontendOptionColumnAlternativeDto> getActiveOptionColumnAlternatives();
    
    /**
     * Returns a collection of all active RequirementCategory instances, but
     * they only include those RequirementSkeleton instances that are both, part
     * of one of the specified CollectionInstance instances and part of one of
     * the specified ProjectType instances.
     * 
     * Invalid identifiers of CollectionInstances or ProjectTypes will be
     * ignored silently.
     * 
     * @param collectionInstanceIds All includes collection instances.
     * @param projectTypeIds All included project types.
     * 
     * @return Either a collection of all active RequirementCategories and a
     *         subset of their corresponding RequirementSkeletons or
     *         <code>null</code>, if an error occurred.
     */
    Set<FrontendCategoryDto> getCategoriesByCollectionInstancesAndProjectTypes(
            Long[] collectionInstanceIds,
            Long[] projectTypeIds);
    
    /**
     * Returns all active AlternativeInstance instances that are associated with
     * the specified AlternativeSet identifier.
     * 
     * @param alternativeSetId The identifier of the AlternativeSet whose
     *                         associated AlternativeInstance instances will be
     *                         returned.
     * 
     * @return Either the corresponding AlternativeInstance instances or
     *         <code>null</code>, if an error occurred or if the
     *         <code>alternativeSetId</code> is invalid.
     */
    Set<FrontendAlternativeInstanceDto> getAlternativeInstancesByAlternativetSet(
            Long alternativeSetId);
}
