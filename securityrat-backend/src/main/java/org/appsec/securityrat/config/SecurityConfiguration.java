package org.appsec.securityrat.config;

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.security.AjaxAuthenticationFailureHandler;
import io.github.jhipster.security.AjaxAuthenticationSuccessHandler;
import io.github.jhipster.security.AjaxLogoutSuccessHandler;

import javax.inject.Inject;

import lombok.extern.slf4j.Slf4j;
import org.appsec.securityrat.security.AuthoritiesConstants;
import org.appsec.securityrat.security.Http401UnauthorizedEntryPoint;
import org.appsec.securityrat.web.filter.CsrfCookieGeneratorFilter;

import org.pac4j.core.config.Config;
import org.pac4j.springframework.security.web.CallbackFilter;
import org.pac4j.springframework.security.web.Pac4jEntryPoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.ExceptionHandlingConfigurer;
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer.AuthorizedUrl;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
@Slf4j
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Inject
    private JHipsterProperties jHipsterProperties;

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

    @Inject
    private ApplicationProperties appConfig;

    @Autowired
    private Config pac4jConfig;

    @Autowired
    private OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public SecurityConfiguration(OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService) {
        this.oidcUserService = oidcUserService;
    }

    @Override
    public void configure(WebSecurity web) {
        web.ignoring()
            .antMatchers("/scripts/**/*.{js,html}")
            .antMatchers("/bower_components/**").antMatchers("/i18n/**")
            .antMatchers("/assets/**")
            .antMatchers("/swagger-ui/index.html").antMatchers("/test/**");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        final String registerApiUri = "/api/register";
        ExceptionHandlingConfigurer<HttpSecurity> base =
            http.headers()
                .frameOptions()
                .sameOrigin()
                .and()
                .csrf()
                .ignoringAntMatchers("/websocket/**")
                .and()
                .addFilterAfter(
                    new CsrfCookieGeneratorFilter(),
                    CsrfFilter.class)
                .exceptionHandling();

        switch (this.appConfig.getAuthentication().getType()) {
            case CAS:
                CallbackFilter callbackFilter = new CallbackFilter(this.pac4jConfig);
                callbackFilter.setMultiProfile(true);
                AuthenticationEntryPoint authEntryPoint = new Pac4jEntryPoint(this.pac4jConfig, "CasClient");

                base
                    .and()
                    .exceptionHandling().authenticationEntryPoint(authEntryPoint)
                    .and()
                    .addFilterBefore(callbackFilter, BasicAuthenticationFilter.class)
                    .logout()
                    .logoutUrl("/api/logout")
                    .logoutSuccessHandler(ajaxLogoutSuccessHandler)
                    .deleteCookies("JSESSIONID")
                    .permitAll()
                    .and()
                    .authorizeRequests()
                    .antMatchers(registerApiUri).denyAll()
                    .antMatchers("/api/account/reset_password/init").denyAll()
                    .antMatchers("/api/account/reset_password/finish").denyAll()
                    .antMatchers("/api/activate").denyAll()
                    .antMatchers("/api/authenticate").denyAll()
                    .antMatchers("/robots.txt").permitAll()
                    .antMatchers("/api/authentication_config").permitAll()
                    .antMatchers("/**").authenticated();
                break;

            case FORM:
                boolean registrationEnabled =
                    this.appConfig.getAuthentication().isRegistration();

                base.authenticationEntryPoint(this.authenticationEntryPoint)
                    .and()
                    .rememberMe()
                    .rememberMeServices(this.rememberMeServices)
                    .rememberMeParameter("remember-me")
                    .key(this.jHipsterProperties.getSecurity().getRememberMe().getKey())
                    .and()
                    .formLogin()
                    .loginPage("/login")
                    .loginProcessingUrl("/api/authentication")
                    .successHandler(this.ajaxAuthenticationSuccessHandler)
                    .failureHandler(this.ajaxAuthenticationFailureHandler)
                    .usernameParameter("j_username")
                    .passwordParameter("j_password")
                    .permitAll()
                    .and()
                    .logout()
                    .logoutUrl("/api/logout")
                    .logoutSuccessHandler(this.ajaxLogoutSuccessHandler)
                    .deleteCookies("JSESSIONID")
                    .permitAll();

                AuthorizedUrl registerMatcher = http.authorizeRequests()
                    .antMatchers(registerApiUri);

                if (registrationEnabled) {
                    registerMatcher.permitAll();
                } else {
                    registerMatcher.denyAll();
                }

                http.authorizeRequests()
                    .antMatchers(registerApiUri).permitAll() // Why is this line necessary?
                    .antMatchers("/api/activate").permitAll()
                    .antMatchers("/api/authenticate").permitAll()
                    .antMatchers("/api/account/reset_password/init").permitAll()
                    .antMatchers("/api/account/reset_password/finish").permitAll();

                break;
	    case AZURE:
		http
                .authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .oauth2Login()
                .userInfoEndpoint()
                .oidcUserService(oidcUserService);
            default:
                throw new UnsupportedOperationException();
        }

        http.authorizeRequests()
            .antMatchers("/robots.txt").permitAll()
            .antMatchers("/api/authentication_config").permitAll()
            .antMatchers("/api/account").authenticated()
            .antMatchers("/api/account/**").authenticated()
            // Import Assistant API
            .antMatchers("/frontend-api/importer/**").hasAuthority(AuthoritiesConstants.ADMIN)
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
            .antMatchers("/configuration/security").permitAll()
            .antMatchers("/configuration/ui").permitAll()
            .antMatchers("/swagger-ui/index.html").hasAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/protected/**").authenticated();
    }

    @Inject
    public void configureGlobal(AuthenticationManagerBuilder auth)
        throws Exception {

        switch (this.appConfig.getAuthentication().getType()) {
            case CAS:
                auth.userDetailsService(this.userDetailsService);
                break;

            case FORM:
                auth.userDetailsService(this.userDetailsService)
                    .passwordEncoder(this.passwordEncoder());

                break;
	    case AZURE:
		auth.userDetailsService(this.userDetailsService);
                break;

            default:
                throw new UnsupportedOperationException();
        }
    }

    @Bean
    public SecurityEvaluationContextExtension securityEvaluationContextExtension() {

        return new SecurityEvaluationContextExtension();
    }

    @Bean
    public AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler() {
        return new AjaxAuthenticationSuccessHandler();
    }

    @Bean
    public AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler() {
        return new AjaxAuthenticationFailureHandler();
    }

    @Bean
    public AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler() {
        return new AjaxLogoutSuccessHandler();
    }
}
