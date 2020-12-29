package org.appsec.securityrat.security;

import org.pac4j.cas.client.CasClient;
import org.pac4j.cas.config.CasConfiguration;
import org.pac4j.core.client.Clients;
import org.pac4j.core.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Pac4jConfig {

    @Value("${application.cas.loginUrl}")
    private String casLoginUrl;

    @Value("${application.cas.callbackUrl}")
    private String callbackUrl;

    @Bean
    public Config config() {
        final CasConfiguration casConfiguration = new CasConfiguration(casLoginUrl);
        final CasClient casClient = new CasClient(casConfiguration);

        final Clients clients = new Clients(callbackUrl, casClient);
        return new Config(clients);
    }
}
