package org.appsec.securityrat.api.provider.advanced;

import java.util.Set;
import org.appsec.securityrat.api.dto.rest.StatusColumnValueDto;
import org.appsec.securityrat.api.provider.IdentifiableProvider;

public interface StatusColumnValueProvider
        extends IdentifiableProvider<Long, StatusColumnValueDto> {
    
    /**
     * Returns all {@link StatusColumnValueDto} instances that are associated
     * with the specified <code>statusColumnId</code>.
     * 
     * @param statusColumnId The identifier of the status column.
     * 
     * @return Either a collection of all associated
     *         {@link StatusColumnValueDto} instances or <code>null</code>, if
     *         either an error occurred or if the specified
     *         <code>statusColumnId</code> does not exist.
     */
    Set<StatusColumnValueDto> findByStatusColumn(Long statusColumnId);
}
