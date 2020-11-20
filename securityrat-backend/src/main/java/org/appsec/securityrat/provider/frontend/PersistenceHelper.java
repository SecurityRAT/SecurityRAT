package org.appsec.securityrat.provider.frontend;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Optional;
import javax.persistence.Id;
import org.springframework.context.ApplicationContext;
import org.springframework.core.ResolvableType;
import org.springframework.data.jpa.repository.JpaRepository;

final class PersistenceHelper {
    static Field getIdField(Class<?> entityClass) {
        return Arrays.stream(entityClass.getDeclaredFields())
                .filter(field -> field.isAnnotationPresent(Id.class))
                .findAny()
                .orElse(null);
    }
    
    static Class<?> getIdClass(Class<?> entityClass) {
        return Optional.ofNullable(PersistenceHelper.getIdField(entityClass))
                .map(Field::getType)
                .orElse(null);
    }
    
    private final ApplicationContext appContext;
    
    PersistenceHelper(ApplicationContext appContext) {
        this.appContext = appContext;
    }
    
    JpaRepository getRepo(Class<?> entityClass) {
        // Before we are able to resolve the repository from the Spring
        // application context, we determine the type of the entity's
        // identifier.
        
        Class<?> idClass = PersistenceHelper.getIdClass(entityClass);
        
        if (idClass == null) {
            return null;
        }
        
        return (JpaRepository) this.appContext.getBeanProvider(
                ResolvableType.forClassWithGenerics(
                        JpaRepository.class, entityClass, idClass)).getObject();
    }
}
