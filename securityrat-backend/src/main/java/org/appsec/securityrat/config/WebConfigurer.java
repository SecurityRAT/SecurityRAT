package org.appsec.securityrat.config;

import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.web.filter.CachingHttpHeadersFilter;
import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.inject.Inject;
import javax.servlet.*;
import java.util.Arrays;
import java.util.EnumSet;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.core.env.Profiles;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
@AutoConfigureAfter(CacheConfiguration.class)
@Slf4j
public class WebConfigurer implements ServletContextInitializer,
        WebServerFactoryCustomizer<WebServerFactory> {
    
    @Inject
    private Environment env;
    
    @Inject
    private JHipsterProperties jHipsterProperties;

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        log.info("Web application configuration, using profiles: {}", Arrays.toString(env.getActiveProfiles()));
        
        EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC);
        
        if (env.acceptsProfiles(Profiles.of(JHipsterConstants.SPRING_PROFILE_PRODUCTION))) {
            initCachingHttpHeadersFilter(servletContext, disps);
        }
        
        log.info("Web application fully configured");
    }

    /**
     * Customize the Servlet engine: Mime types, the document root, the cache.
     */
    @Override
    public void customize(WebServerFactory factory) {
        ConfigurableServletWebServerFactory configurableFactory = null;
        
        if (factory instanceof ConfigurableServletWebServerFactory) {
            configurableFactory = (ConfigurableServletWebServerFactory) factory;
        }
        
        // Mime types
        
        if (configurableFactory != null) {
            MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
            // IE issue, see https://github.com/jhipster/generator-jhipster/pull/711
            mappings.add("html", "text/html;charset=utf-8");
            // CloudFoundry issue, see https://github.com/cloudfoundry/gorouter/issues/64
            mappings.add("json", "text/html;charset=utf-8");
            configurableFactory.setMimeMappings(mappings);
        }
        
        // Document root
        
        /*
        if (configurableFactory != null) {
            URL indexHtmlUrl = WebConfigurer.class.getResource(
                    "/webapp/index.html");
            
            log.debug("Located index.html at {}", indexHtmlUrl);
            
            try {
                configurableFactory.setDocumentRoot(
                        new File(indexHtmlUrl.toURI()).getParentFile());
            } catch (URISyntaxException ex) {
                log.error("Cannot set document root", ex);
            }
        }
        */
    }
    
    /**
     * Initializes the caching HTTP Headers Filter.
     */
    private void initCachingHttpHeadersFilter(ServletContext servletContext,
                                              EnumSet<DispatcherType> disps) {
        log.debug("Registering Caching HTTP Headers Filter");
        FilterRegistration.Dynamic cachingHttpHeadersFilter =
                servletContext.addFilter("cachingHttpHeadersFilter",
                        new CachingHttpHeadersFilter(this.jHipsterProperties));

        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/assets/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/scripts/*");
        cachingHttpHeadersFilter.setAsyncSupported(true);
    }
}
