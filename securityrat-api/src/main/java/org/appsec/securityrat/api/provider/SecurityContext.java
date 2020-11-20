package org.appsec.securityrat.api.provider;

import org.appsec.securityrat.api.dto.user.InternalUserDto;

/**
 * Access to the current session information.
 */
public interface SecurityContext {
    /**
     * Returns the user that initiated the current request.
     * 
     * @return Either the instance of a user or <code>null</code>, if the
     *         requester has not been authenticated.
     */
    InternalUserDto getCurrentUser();
}
