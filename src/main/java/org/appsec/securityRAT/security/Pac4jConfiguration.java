package org.appsec.securityRAT.security;

import org.pac4j.cas.client.CasClient;
import org.pac4j.core.client.Clients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Pac4jConfiguration {

	  @Value("${cas.casLoginUrl}")
	  private String casLoginUrl;

	  @Value("${cas.callbackUrl}")
	  private String callbackUrl;

	  @Bean(initMethod = "init")
	  public Clients clients() {
		return new Clients(callbackUrl, casClient());
	  }

	  @Bean
	  public CasClient casClient() {
		  CasClient client = new CasClient();
		  client.setCasLoginUrl(casLoginUrl);
		  return client;
	  }

}
