package org.appsec.securityrat.api.provider;

import java.time.Instant;
import java.util.List;
import org.appsec.securityrat.api.dto.AuditEventDto;
import org.appsec.securityrat.api.dto.AuthenticationConfigDto;
import org.appsec.securityrat.api.dto.AuthorityDto;
import org.appsec.securityrat.api.dto.LoggerDto;

public interface SystemInfo {
    /**
     * Returns all authorities that exist and may be assigned to a user.
     * 
     * @return All authority instances
     */
    List<AuthorityDto> getAuthorities();
    
    /**
     * Returns the current authentication configuration.
     * 
     * @return The authentication configuration.
     */
    AuthenticationConfigDto getAuthenticationConfig();
    
    /**
     * Returns all loggers.
     * 
     * @return All loggers
     */
    List<LoggerDto> getLoggers();
    
    /**
     * Updates the level of the logger.
     * 
     * @param logger The updated logger configuration.
     */
    void updateLogger(LoggerDto logger);
    
    /**
     * Returns all audit events.
     * 
     * @return All audit events.
     */
    List<AuditEventDto> getAuditEvents();
    
    /**
     * Return all audit events that have been logged between the specified
     * <code>fromDate</code> and <code>toDate</code>.
     * 
     * @param fromDate The earliest date
     * @param toDate The latest date
     * 
     * @return All events that have been logged in the specified time span.
     */
    List<AuditEventDto> getAuditEvents(Instant fromDate, Instant toDate);
}
