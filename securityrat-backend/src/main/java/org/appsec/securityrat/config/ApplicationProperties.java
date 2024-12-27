package org.appsec.securityrat.config;

import java.net.URL;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to SecurityRAT.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
@Data
public class ApplicationProperties {
    public enum AuthenticationType {
        CAS,
        FORM,
        AZURE,
        LDAP
    }

    @Data
    public static class Authentication {
        private AuthenticationType type;
        private boolean registration;
    }

    @Data
    public static class Cas {
        private URL loginUrl;
        private URL logoutUrl;
        private URL callbackUrl;
    }

    @Data
    public static class Ldap {
        private String url;
      	private String managerDN;
      	private String managerPassword;
      	private String userBaseDN = "";
      	private String userSearchFilter;
      	private String groupRoleAttribute = "cn";
      	private String groupBaseDN = "";
      	private String groupSearchFilter = "(uniqueMember={0})";
      	private String groupOfAdmins;
      	private String groupOfTrainers;
      	private String groupOfUsers;
    }

    private Authentication authentication;
    private Cas cas;
    private Ldap ldap;
}
