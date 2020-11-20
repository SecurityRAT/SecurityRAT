package org.appsec.securityrat.api.test;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.stream.Collectors;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.SimpleDto;
import org.appsec.securityrat.api.endpoint.rest.SimpleResource;
import org.appsec.securityrat.api.test.mock.PersistentStorageMock;
import org.appsec.securityrat.api.test.util.SimpleResourceUtil;
import org.appsec.securityrat.api.test.util.SimpleResourceUtil.Endpoint;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@Import(GeneralTestConfiguration.class)
public class SimpleResourceTest {
    @Inject
    private List<SimpleResource> simpleResources;
    
    @Inject
    private PersistentStorageMock storage;
    
    private List<Endpoint> endpoints;
    
    @Before
    public void initialize() {
        this.endpoints = this.simpleResources.stream()
                .map(SimpleResourceUtil::getEndpoint)
                .collect(Collectors.toList());
    }
    
    @Test
    public void testCreate() throws Exception {
        this.endpoints.forEach(endpoint -> {
            SimpleDto dto;
            
            try {
                dto = endpoint.getDtoClass()
                        .getDeclaredConstructor()
                        .newInstance();
            } catch (NoSuchMethodException |
                    InstantiationException |
                    IllegalAccessException |
                    InvocationTargetException ex) {
                throw new IllegalStateException("Cannot initialize DTO", ex);
            }
            
            // TODO: Fuzzing
            
            endpoint.create(dto);
            
            // TODO: Check result
            
            Assert.assertTrue(this.storage.getStorage(endpoint.getDtoClass())
                    .contains(dto));
        });
    }
}
