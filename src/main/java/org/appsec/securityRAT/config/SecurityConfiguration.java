package org.appsec.securityRAT.config;

import javax.inject.Inject;

import org.appsec.securityRAT.security.AjaxAuthenticationFailureHandler;
import org.appsec.securityRAT.security.AjaxAuthenticationSuccessHandler;
import org.appsec.securityRAT.security.AjaxLogoutSuccessHandler;
import org.appsec.securityRAT.security.AuthoritiesConstants;
import org.appsec.securityRAT.security.Http401UnauthorizedEntryPoint;
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
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

	private final Logger log = LoggerFactory
			.getLogger(SecurityConfiguration.class);

	@Inject
	private AuthenticationUserDetailsService<ClientAuthenticationToken> casUserDetailsService;

	@Autowired
	private Clients clients;
	//
	@Autowired
	private CasClient casClient;
	
	@Inject
	private Environment env;
	
	@Inject
	private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;

	@Inject
	private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;

	@Inject
	private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;
	
	@Inject
	private Http401UnauthorizedEntryPoint authenticationEntryPoint;

	@Inject
	private UserDetailsService userDetailsService;

	@Inject
	private RememberMeServices rememberMeServices;
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Override
	@ConditionalOnExpression("#{environment.getProperty('authentication.type').equals('FORM')}")
	public void configure(WebSecurity web) throws Exception {
		web.ignoring().antMatchers("/scripts/**/*.{js,html}")
				.antMatchers("/bower_components/**").antMatchers("/i18n/**")
				.antMatchers("/assets/**")
				.antMatchers("/swagger-ui/index.html").antMatchers("/test/**");
	}
	
	@Override
	protected void configure(final HttpSecurity http) throws Exception {
		final boolean registration = env.getProperty("authentication.registration", Boolean.class);
		if(env.getProperty("authentication.type").equals("CAS")) {
			final ClientAuthenticationFilter clientFilter = new ClientAuthenticationFilter("/callback");
			clientFilter.setClients(clients);
			clientFilter.setAuthenticationManager(authenticationManager());
			final ClientAuthenticationEntryPoint casEntryPoint = new ClientAuthenticationEntryPoint();
			casEntryPoint.setClient(casClient);
			
			http
                .headers().frameOptions().sameOrigin()
            .and()
				.csrf()
			.and()
				.addFilterAfter(new CsrfCookieGeneratorFilter(),CsrfFilter.class).exceptionHandling()
				.authenticationEntryPoint(casEntryPoint)
			.and()
				.logout()
				.logoutUrl("/api/logout")
				.logoutSuccessHandler(ajaxLogoutSuccessHandler)
				.deleteCookies("JSESSIONID")
				.permitAll()
			.and()
				.authorizeRequests()
				.antMatchers("/api/register").denyAll()
				.antMatchers("/api/account/reset_password/init").denyAll()
				.antMatchers("/api/account/reset_password/finish").denyAll()
				.antMatchers("/api/activate").denyAll()
				.antMatchers("/api/authenticate").denyAll()
				.antMatchers("/api/authentication_config").permitAll()
				.antMatchers(HttpMethod.GET, "/frontend-api/**").hasAnyAuthority(AuthoritiesConstants.FRONTEND_USER, AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER)
				.antMatchers(HttpMethod.GET, "/api/account").hasAuthority(AuthoritiesConstants.FRONTEND_USER)
				.antMatchers("/api/training/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainings/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingBranchNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingCategoryNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingCustomSlideNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingGeneratedSlideNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingRequirementNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNodeUpdate/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNodesWithPreparedContent/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNode/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/slideTemplates/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER)
				.antMatchers(HttpMethod.GET, "/admin-api/configConstants").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.FRONTEND_USER, AuthoritiesConstants.USER)
				.antMatchers("/admin-api/**").hasAnyAuthority(AuthoritiesConstants.ADMIN)
//				.antMatchers(HttpMethod.POST,"/admin-api/configConstants").denyAll()
//				.antMatchers(HttpMethod.DELETE,"/admin-api/configConstants").denyAll()
				.antMatchers("/**").authenticated()
			.and()
				.addFilterBefore(clientFilter, AnonymousAuthenticationFilter.class).exceptionHandling()
				.authenticationEntryPoint(casEntryPoint).and();
		} 
		//Security configuration for Form login. The difference is needed because no all ant Matchers are permitted in both form of Authentication. 
		else if(env.getProperty("authentication.type").equals("FORM")){
			http
            .headers().frameOptions().sameOrigin()
            .and()
			.csrf()
			.ignoringAntMatchers("/websocket/**")
			.and()
				.addFilterAfter(new CsrfCookieGeneratorFilter(),CsrfFilter.class)
					.exceptionHandling()
					.authenticationEntryPoint(authenticationEntryPoint)
			.and()
				.rememberMe()
				.rememberMeServices(rememberMeServices)
				.rememberMeParameter("remember-me")
				.key(env.getProperty("jhipster.security.rememberme.key"))
			.and()
				.formLogin()
				.loginPage("/login")
				.loginProcessingUrl("/api/authentication")
				.successHandler(ajaxAuthenticationSuccessHandler)
				.failureHandler(ajaxAuthenticationFailureHandler)
				.usernameParameter("j_username")
				.passwordParameter("j_password")
				.permitAll()
			.and()
				.logout()
				.logoutUrl("/api/logout")
				.logoutSuccessHandler(ajaxLogoutSuccessHandler)
				.deleteCookies("JSESSIONID")
				.permitAll();
			if(registration)
				http.authorizeRequests().antMatchers("/api/register").permitAll(); 
			else
				http.authorizeRequests().antMatchers("/api/register").denyAll();
			http
				.authorizeRequests()
				.antMatchers("/api/register").permitAll()
				.antMatchers("/api/activate").permitAll()
				.antMatchers("/api/authenticate").permitAll()
				.antMatchers("/api/authentication_config").permitAll()
				.antMatchers("/api/account/reset_password/init").permitAll()
				.antMatchers("/api/account/reset_password/finish").permitAll()
				.antMatchers("/api/account").authenticated()
				.antMatchers("/api/account/**").authenticated()
				.antMatchers(HttpMethod.GET, "/frontend-api/**").hasAnyAuthority(AuthoritiesConstants.FRONTEND_USER, AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER)
				.antMatchers("/api/training/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainings/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingBranchNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingCategoryNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingCustomSlideNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingGeneratedSlideNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingRequirementNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNodes/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNodeUpdate/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNodesWithPreparedContent/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/trainingTreeNode/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/slideTemplates/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.TRAINER)
				.antMatchers("/api/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER)
				.antMatchers(HttpMethod.GET, "/admin-api/configConstants").permitAll()
				.antMatchers("/admin-api/**").hasAuthority(AuthoritiesConstants.ADMIN)
	//			.antMatchers("/v2/api-docs/**").permitAll()
				.antMatchers("/configuration/security").permitAll()
				.antMatchers("/configuration/ui").permitAll()
				.antMatchers("/swagger-ui/index.html").hasAuthority(AuthoritiesConstants.ADMIN)
				.antMatchers("/protected/**").authenticated();
		}
	}

	@Inject
	public void configureGlobal(AuthenticationManagerBuilder auth)
			throws Exception {
		if(env.getProperty("authentication.type").equals("CAS")) {
			final ClientAuthenticationProvider clientProvider = new ClientAuthenticationProvider();
			clientProvider.setClients(clients);
			clientProvider.setUserDetailsService(casUserDetailsService);
	
			auth.authenticationProvider(clientProvider);
		} else if(env.getProperty("authentication.type").equals("FORM")){
			auth.userDetailsService(userDetailsService).passwordEncoder(
					passwordEncoder());
		}
	}

	@Bean
	@ConditionalOnExpression("#{environment.getProperty('authentication.type').equals('FORM')}")
	public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
		return new SecurityEvaluationContextExtension();
	}
}
