package org.appsec.securityrat.config;

import java.net.URL;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Security RAT.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
@Data
public class ApplicationProperties {
    public enum AuthenticationType {
        CAS,
        FORM
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
    
    private Authentication authentication;
    private Cas cas;
}
