package org.appsec.securityrat.provider.frontend;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import javax.persistence.EntityManagerFactory;
import org.appsec.securityrat.domain.Authority;
import org.appsec.securityrat.domain.ConfigConstant;
import org.appsec.securityrat.domain.PersistentAuditEvent;
import org.appsec.securityrat.domain.PersistentToken;
import org.appsec.securityrat.domain.User;
import org.appsec.securityrat.web.dto.importer.FrontendObjectDto;
import org.appsec.securityrat.web.dto.importer.FrontendReplaceRule;
import org.appsec.securityrat.web.dto.importer.FrontendTypeDto;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImporterProviderImpl implements ImporterProvider {
    private static final Set<Class<?>> PRIMITIVE_CLASSES =
            new HashSet<>(Arrays.asList(
                    Byte.class, byte.class, Short.class, short.class,
                    Integer.class, int.class, Long.class, long.class,
                    Float.class, float.class, Double.class, double.class,
                    Character.class, char.class, String.class, Boolean.class,
                    boolean.class));
    
    private static final Set<Class<?>> IGNORED_CLASSES =
            new HashSet<>(Arrays.asList(
                    Authority.class, ConfigConstant.class,
                    PersistentAuditEvent.class, PersistentToken.class,
                    User.class));

    private final PersistenceHelper persistenceHelper;
    private final ImporterReflectionWrapper reflectionWrapper;
    
    public ImporterProviderImpl(
            EntityManagerFactory entityManagerFactory,
            ApplicationContext appContext) {
        this.persistenceHelper = new PersistenceHelper(appContext);
        this.reflectionWrapper = new ImporterReflectionWrapper(
                entityManagerFactory,
                this.persistenceHelper);
    }
    
    @Override
    public Set<FrontendTypeDto> getAvailableTypes() {
        return new HashSet<>(this.reflectionWrapper.getAvailableTypes());
    }

    @Override
    @Transactional
    public boolean applyObjects(Set<FrontendObjectDto> objects) {
        List<String> availableTypes = this.reflectionWrapper.getAvailableTypes()
                .stream()
                .map(e -> e.getIdentifier())
                .collect(Collectors.toList());
        
        // Separating the objects by their entity classes and discarding those
        // which are not part of the availableTypes set
        
        Map<String, Set<FrontendObjectDto>> objectsByEntity = new HashMap<>();
        
        for (String typeName : availableTypes) {
            Set<FrontendObjectDto> typeObjects =
                    objects.stream()
                            .filter(obj -> Objects.equals(
                                    typeName,
                                    obj.getTypeIdentifier()))
                            .collect(Collectors.toSet());
            
            if (typeObjects.isEmpty()) {
                continue;
            }
            
            objectsByEntity.put(typeName, typeObjects);
        }
        
        // The following pool will store all instances of types that have been
        // created, linked with their instance identifier that may be referenced
        // by another instance.
        
        ObjectPool objectPool = new ObjectPool();
        
        // Since availableTypes is guaranteed to be in the right dependency
        // order, we simply iterate through the availableTypes and store the
        // new/modified objects in the database.
        //
        // NOTE: The reason that we do this in another loop is the readability
        //       of the code.
        
        for (String typeIdentifier : availableTypes) {
            // Skip this type, if there is no objectsByEntity entry for it
            
            if (!objectsByEntity.containsKey(typeIdentifier)) {
                continue;
            }
            
            // Resolving the entity type by its fully-qualified class name
            
            Class<?> entityClass;
            
            try {
                entityClass = Class.forName(typeIdentifier);
            } catch (ClassNotFoundException ex) {
                return false;
            }
            
            // We need the JPA repository to access the persistent storage of
            // the current entity type.
            
            JpaRepository repo = this.persistenceHelper.getRepo(entityClass);
            
            if (repo == null) {
                // No repository?!
                return false;
            }
            
            // For the duplicate check, we need to get all entities that have
            // been stored previously.
            
            List<Object> existingEntities = repo.findAll();
            
            // We need to create valid instances of the entityClass for each
            // FrontendObjectDto of this FrontendTypeDto.
            //
            // At the same time we perform the duplicate check.
            
            Map<String, Object> newEntities = new HashMap<>();
            
            for (FrontendObjectDto objDto :
                    objectsByEntity.get(typeIdentifier)) {
                Object duplicate = null;
                
                // Depending on the settings, we perform a duplicate check
                
                if (objDto.getReplaceRule() != FrontendReplaceRule.Duplicate) {
                    // First, we look in the objectPool
                    
                    duplicate = this.reflectionWrapper.findDuplicate(
                            objDto,
                            existingEntities,
                            objectPool);
                    
                    // If there is no duplicate entry in the objectPool, maybe
                    // there is one in the newEntities map.
                    //
                    // This may be the case, if the same object has been
                    // submitted multiple times with different instance
                    // identifiers.
                    
                    if (duplicate == null) {
                        duplicate = this.reflectionWrapper.findDuplicate(
                                objDto,
                                newEntities.values(),
                                objectPool);
                    }
                }
                
                // If we're preserving existing duplicates, we do not need to
                // construct a new instance, if the object exists already.
                
                if (objDto.getReplaceRule() == FrontendReplaceRule.Ignore &&
                        duplicate != null) {
                    objectPool.add(objDto.getIdentifier(), duplicate);
                    continue;
                }
                
                Object instance = this.reflectionWrapper.deserializeEntity(
                        objDto,
                        objectPool,
                        duplicate);
                
                newEntities.put(objDto.getIdentifier(), instance);
            }
            
            // Storing the result in the persistent storage and copying the new
            // entities to the pool.
            
            repo.saveAll(newEntities.values());
            objectPool.addAll(newEntities);
        }
        
        return true;
    }

    @Override
    @Transactional
    public Set<FrontendObjectDto> getExistingInstances(String typeIdentifier) {
        // Resolving the entity class via reflection
        
        Class<?> entityClass = this.reflectionWrapper.resolveEntityClass(
                typeIdentifier);
        
        if (entityClass == null) {
            return null;
        }
        
        // Resolving the entity's repository
        
        JpaRepository<?, ?> repo = this.persistenceHelper.getRepo(entityClass);
        
        if (repo == null) {
            return null;
        }
        
        // Retrieving all instances of the entityClass and mapping them to their
        // corresponding FrontedObject instance
        
        return repo.findAll()
                .stream()
                .map(this.reflectionWrapper::serializeEntity)
                .collect(Collectors.toSet());
    }
}
