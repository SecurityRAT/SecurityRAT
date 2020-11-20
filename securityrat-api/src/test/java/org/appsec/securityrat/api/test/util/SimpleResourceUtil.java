package org.appsec.securityrat.api.test.util;

import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.appsec.securityrat.api.dto.SimpleDto;
import org.appsec.securityrat.api.endpoint.rest.SimpleResource;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SimpleResourceUtil {
    @Builder
    public static final class Endpoint {
        @Getter
        private final SimpleResource instance;
        
        @Getter
        private final Class<? extends SimpleResource> instanceClass;
        
        @Getter
        private final Class<? extends SimpleDto> dtoClass;
        
        @Getter
        private final Class<?> identifierClass;
        
        private final Method createHandler;
        private final Method deleteHandler;
        private final Method getHandler;
        private final Method getAllHandler;
        private final Method searchHandler;
        private final Method updateHandler;
        
        public ResponseEntity<?> create(Object dto) {
            return (ResponseEntity<?>) this.invoke(this.createHandler, dto);
        }
        
        public ResponseEntity<?> delete(Long id) {
            return (ResponseEntity<?>) this.invoke(this.deleteHandler, id);
        }
        
        public ResponseEntity<?> get(Long id) {
            return (ResponseEntity<?>) this.invoke(this.getHandler, id);
        }
        
        public ResponseEntity<?> getAll() {
            return (ResponseEntity<?>) this.invoke(this.getAllHandler);
        }
        
        public ResponseEntity<?> search(String query) {
            return (ResponseEntity<?>) this.invoke(this.searchHandler, query);
        }
        
        public ResponseEntity<?> update(Object dto) {
            return (ResponseEntity<?>) this.invoke(this.updateHandler, dto);
        }
        
        private Object invoke(Method method, Object... params) {
            try {
                return method.invoke(this.instance, params);
            } catch (IllegalAccessException | InvocationTargetException ex) {
                throw new IllegalStateException(String.format(
                        "Cannot invoke method %s of %s",
                        method.getName(), this.getClass().getName()), ex);
            }
        }
    }
    
    public static Endpoint getEndpoint(SimpleResource inst) {
        Class<? extends SimpleResource> instClass = inst.getClass();
        Class<? extends SimpleDto> dtoClass = inst.getDtoClass();
        
        // The most simple way of retrieving the DTO identifier type is
        // instancing the DTO object (it is always required to provide a
        // parameterless constructor) and to invoke the 'getIdentifierClass'
        // method.
        
        Class<?> idClass;
        
        try {
            idClass = dtoClass.getDeclaredConstructor()
                    .newInstance()
                    .getIdentifierClass();
        } catch (NoSuchMethodException |
                InstantiationException |
                IllegalAccessException |
                InvocationTargetException ex) {
            throw new IllegalStateException(String.format(
                    "Invalid implementation of dto: %s; cannot invoke default "
                            + "constructor",
                    dtoClass.getName()));
        }
        
        Endpoint.EndpointBuilder builder = Endpoint.builder()
                .instance(inst)
                .instanceClass(instClass)
                .dtoClass(dtoClass)
                .identifierClass(idClass);
        
        // Handler resolution
        
        Arrays.stream(instClass.getMethods()).forEach(method -> {
            if (SimpleResourceUtil.hasSignature(
                    method,
                    PostMapping.class,
                    dtoClass)) {
                builder.createHandler(method);
                return;
            }
            
            if (SimpleResourceUtil.hasSignature(
                    method,
                    DeleteMapping.class,
                    idClass)) {
                builder.deleteHandler(method);
                return;
            }
            
            if (SimpleResourceUtil.hasSignature(
                    method,
                    GetMapping.class,
                    idClass)) {
                builder.getHandler(method);
                return;
            }
            
            if (SimpleResourceUtil.hasSignature(method, GetMapping.class)) {
                builder.getAllHandler(method);
                return;
            }
            
            if (SimpleResourceUtil.hasSignature(
                    method,
                    GetMapping.class,
                    String.class)) {
                builder.searchHandler(method);
                return;
            }
            
            if (SimpleResourceUtil.hasSignature(
                    method,
                    PutMapping.class,
                    dtoClass)) {
                builder.updateHandler(method);
                return;
            }
        });
        
        // Asserting that all methods are available
        
        Assert.notNull(builder.createHandler, String.format(
                "%s does not provide a create handler",
                instClass.getName()));
        
        Assert.notNull(builder.deleteHandler, String.format(
                "%s does not provide a delete handler",
                instClass.getName()));
        
        Assert.notNull(builder.getHandler, String.format(
                "%s does not provide a get handler",
                instClass.getName()));
        
        Assert.notNull(builder.getAllHandler, String.format(
                "%s does not provide a get all handler",
                instClass.getName()));
        
        Assert.notNull(builder.searchHandler, String.format(
                "%s does not provide a search handler",
                instClass.getName()));
        
        Assert.notNull(builder.updateHandler, String.format(
                "%s does not provide a update handler",
                instClass.getName()));
        
        return builder.build();
    }
    
    private static boolean hasSignature(
            Method method,
            Class<? extends Annotation> annotationType,
            Class<?>... parameters) {
        if (method.getAnnotation(annotationType) == null) {
            return false;
        }
        
        return Arrays.equals(method.getParameterTypes(), parameters);
    }
}
