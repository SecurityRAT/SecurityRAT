package org.appsec.securityrat.api.test;

import org.appsec.securityrat.api.endpoint.rest.SimpleResource;
import org.appsec.securityrat.api.provider.PersistentStorage;
import org.appsec.securityrat.api.provider.SecurityContext;
import org.appsec.securityrat.api.provider.SystemInfo;
import org.appsec.securityrat.api.provider.advanced.OptColumnContentProvider;
import org.appsec.securityrat.api.provider.advanced.RequirementSkeletonProvider;
import org.appsec.securityrat.api.provider.advanced.StatusColumnValueProvider;
import org.appsec.securityrat.api.provider.advanced.TagInstanceProvider;
import org.appsec.securityrat.api.provider.advanced.UserManager;
import org.appsec.securityrat.api.test.mock.OptColumnContentProviderMock;
import org.appsec.securityrat.api.test.mock.PersistentStorageMock;
import org.appsec.securityrat.api.test.mock.RequirementSkeletonProviderMock;
import org.appsec.securityrat.api.test.mock.SecurityContextMock;
import org.appsec.securityrat.api.test.mock.StatusColumnValueProviderMock;
import org.appsec.securityrat.api.test.mock.SystemInfoMock;
import org.appsec.securityrat.api.test.mock.TagInstanceProviderMock;
import org.appsec.securityrat.api.test.mock.UserManagerMock;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

@TestConfiguration
@ComponentScan(basePackageClasses = SimpleResource.class)
public class GeneralTestConfiguration {
    @Bean
    public PersistentStorage persistentStorageMock() {
        return new PersistentStorageMock();
    }
    
    @Bean
    public OptColumnContentProvider optColumnContentProviderMock() {
        return new OptColumnContentProviderMock();
    }
    
    @Bean
    public RequirementSkeletonProvider requirementSkeletonProviderMock() {
        return new RequirementSkeletonProviderMock();
    }
    
    @Bean
    public SecurityContext securityContextMock() {
        return new SecurityContextMock();
    }
    
    @Bean
    public StatusColumnValueProvider statusColumnValueProviderMock() {
        return new StatusColumnValueProviderMock();
    }
    
    @Bean
    public SystemInfo systemInfoMock() {
        return new SystemInfoMock();
    }
    
    @Bean
    public TagInstanceProvider tagInstanceProviderMock() {
        return new TagInstanceProviderMock();
    }
    
    @Bean
    public UserManager userManagerMock() {
        return new UserManagerMock();
    }
}
