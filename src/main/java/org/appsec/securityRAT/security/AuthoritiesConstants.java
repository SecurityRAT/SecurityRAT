package org.appsec.securityRAT.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    private AuthoritiesConstants() {
    }

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String FRONTEND_USER = "ROLE_FRONTEND_USER";

    public static final String TRAINER = "ROLE_TRAINER";
}
