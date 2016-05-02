package org.appsec.securityRAT.config;

import javax.inject.Inject;





import org.appsec.securityRAT.security.AuthoritiesConstants;
//import org.appsec.securityRAT.security.;
import org.appsec.securityRAT.web.filter.CsrfCookieGeneratorFilter;
import org.pac4j.cas.client.CasClient;
import org.pac4j.core.client.Clients;
import org.pac4j.springframework.security.authentication.ClientAuthenticationProvider;
import org.pac4j.springframework.security.authentication.ClientAuthenticationToken;
import org.pac4j.springframework.security.web.ClientAuthenticationEntryPoint;
import org.pac4j.springframework.security.web.ClientAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

	private final Logger log = LoggerFactory.getLogger(SecurityConfiguration.class);

	  @Inject
      private AuthenticationUserDetailsService<ClientAuthenticationToken> userDetailsService;

	  @Autowired
	  private Clients clients;
//
	  @Autowired
	  private CasClient casClient;

	  /**
	   * TODO: authorize requests to be enhanced according to the final design before rollout
	   */
	  @Override
	  protected void configure(final HttpSecurity http) throws Exception {
	    final ClientAuthenticationFilter clientFilter = new ClientAuthenticationFilter("/callback");
	    clientFilter.setClients(clients);
	    clientFilter.setAuthenticationManager(authenticationManager());
	    final ClientAuthenticationEntryPoint casEntryPoint = new ClientAuthenticationEntryPoint();
	    casEntryPoint.setClient(casClient);
	    http
	    	.csrf()
	    .and()
	    	.addFilterAfter(new CsrfCookieGeneratorFilter(), CsrfFilter.class)
	    	.exceptionHandling().authenticationEntryPoint(casEntryPoint)
	    .and()
	    	.authorizeRequests()
	    	.antMatchers(HttpMethod.GET, "/frontend-api/**").hasAuthority(AuthoritiesConstants.FRONTEND_USER)
	    	.antMatchers(HttpMethod.GET, "/api/account**").hasAuthority(AuthoritiesConstants.FRONTEND_USER)
	    	.antMatchers("/api/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER)
	    	.antMatchers("/admin-api/**").hasAnyAuthority(AuthoritiesConstants.ADMIN)
	    	//.antMatchers(HttpMethod.POST, "/api/**").hasAuthority(AuthoritiesConstants.ADMIN)
	    	//.antMatchers(HttpMethod.PUT, "/api/**").hasAuthority(AuthoritiesConstants.ADMIN)
	    	//.antMatchers(HttpMethod.DELETE, "/api/**").hasAuthority(AuthoritiesConstants.ADMIN)
	    	.antMatchers("/**").authenticated()
	    .and()
	      .addFilterBefore(clientFilter, AnonymousAuthenticationFilter.class).exceptionHandling()
	      .authenticationEntryPoint(casEntryPoint).and();
	  }

	  @Inject
	  public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		  final ClientAuthenticationProvider clientProvider = new ClientAuthenticationProvider();
		  clientProvider.setClients(clients);
		  clientProvider.setUserDetailsService(userDetailsService);
		  auth.authenticationProvider(clientProvider);
	  }
}



//@Configuration
//@EnableWebSecurity
//@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
//public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
//
//    @Inject
//    private Environment env;
//
//    @Inject
//    private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;
//
//    @Inject
//    private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;
//
//    @Inject
//    private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;
//
//    @Inject
//    private Http401UnauthorizedEntryPoint authenticationEntryPoint;
//
//    @Inject
//    private UserDetailsService userDetailsService;
//
//    @Inject
//    private RememberMeServices rememberMeServices;
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Inject
//    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
//        auth
//            .userDetailsService(userDetailsService)
//                .passwordEncoder(passwordEncoder());
//    }
//
//    @Override
//    public void configure(WebSecurity web) throws Exception {
//        web.ignoring()
//            .antMatchers("/scripts/**/*.{js,html}")
//            .antMatchers("/bower_components/**")
//            .antMatchers("/i18n/**")
//            .antMatchers("/assets/**")
//            .antMatchers("/swagger-ui/index.html")
//            .antMatchers("/test/**");
//    }
//
//    @Override
//    protected void configure(HttpSecurity http) throws Exception {
//        http
//            .csrf()
//            .ignoringAntMatchers("/websocket/**")
//        .and()
//            .addFilterAfter(new CsrfCookieGeneratorFilter(), CsrfFilter.class)
//            .exceptionHandling()
//            .authenticationEntryPoint(authenticationEntryPoint)
//        .and()
//            .rememberMe()
//            .rememberMeServices(rememberMeServices)
//            .rememberMeParameter("remember-me")
//            .key(env.getProperty("jhipster.security.rememberme.key"))
//        .and()
//            .formLogin()
//            .loginProcessingUrl("/api/authentication")
//            .successHandler(ajaxAuthenticationSuccessHandler)
//            .failureHandler(ajaxAuthenticationFailureHandler)
//            .usernameParameter("j_username")
//            .passwordParameter("j_password")
//            .permitAll()
//        .and()
//            .logout()
//            .logoutUrl("/api/logout")
//            .logoutSuccessHandler(ajaxLogoutSuccessHandler)
//            .deleteCookies("JSESSIONID")
//            .permitAll()
//        .and()
//            .headers()
//            .frameOptions()
//            .disable()
//        .and()
//            .authorizeRequests()
//            .antMatchers(HttpMethod.GET , "/api/**").permitAll() //TODO: To be removed once CAS works!
//            .antMatchers("/api/register").permitAll()
//            .antMatchers("/api/activate").permitAll()
//            .antMatchers("/api/authenticate").permitAll()
//            .antMatchers("/api/account/reset_password/init").permitAll()
//            .antMatchers("/api/account/reset_password/finish").permitAll()
//            .antMatchers("/api/logs/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/api/audits/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/api/**").authenticated()
//            .antMatchers("/metrics/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/health/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/dump/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/shutdown/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/beans/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/configprops/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/info/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/autoconfig/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/env/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/v2/api-docs/**").permitAll()
//            .antMatchers("/configuration/security").permitAll()
//            .antMatchers("/configuration/ui").permitAll()
//            .antMatchers("/swagger-ui/index.html").hasAuthority(AuthoritiesConstants.ADMIN)
//            .antMatchers("/protected/**").authenticated() ;
//
//    }
//
//    @Bean
//    public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
//        return new SecurityEvaluationContextExtension();
//    }
//}
