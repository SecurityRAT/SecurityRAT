package org.appsec.securityrat.provider.frontend;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.persistence.EntityManagerFactory;
import javax.persistence.metamodel.EntityType;
import org.appsec.securityrat.domain.Authority;
import org.appsec.securityrat.domain.ConfigConstant;
import org.appsec.securityrat.domain.PersistentAuditEvent;
import org.appsec.securityrat.domain.PersistentToken;
import org.appsec.securityrat.domain.User;
import org.appsec.securityrat.web.dto.importer.FrontendAttributeDto;
import org.appsec.securityrat.web.dto.importer.FrontendAttributeValueDto;
import org.appsec.securityrat.web.dto.importer.FrontendAttributeValueType;
import org.appsec.securityrat.web.dto.importer.FrontendObjectDto;
import org.appsec.securityrat.web.dto.importer.FrontendReplaceRule;
import org.appsec.securityrat.web.dto.importer.FrontendTypeDto;
import org.appsec.securityrat.web.dto.importer.FrontendTypeReferenceDto;

/**
 * A wrapper for dealing with the import assistant objects via Java's reflection
 * interface.
 */
final class ImporterReflectionWrapper {
    /**
     * All entity classes that are not allowed to be exposed or modified by the
     * {@link ImporterProviderImpl}, because they provide classified information
     * for example.
     */
    private static final Set<Class<?>> IGNORED_CLASSES =
            new HashSet<>(Arrays.asList(
                    Authority.class, ConfigConstant.class,
                    PersistentAuditEvent.class, PersistentToken.class,
                    User.class));
    
    private static boolean isReferenceType(Class<?> type) {
        return !PrimitiveHelper.PRIMITIVE_CLASSES.contains(type);
    }
    
    private static List<Class<?>> getAvailableTypes(
            EntityManagerFactory entityManagerFactory) {
        // Resolving the entity classes using Hibernate
        
        Set<Class<?>> entityClasses =
                entityManagerFactory.getMetamodel()
                        .getEntities()
                        .stream()
                        .map(EntityType::getJavaType)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
        
        // Removing those classes that should not be mappable
        
        entityClasses.removeAll(ImporterReflectionWrapper.IGNORED_CLASSES);
        
        // We need a copy of the entityClasses set without the ignored classes
        // because we need to know which types are actual entities. (And since
        // we modify the entityClasses set later on, we need to make a copy.)
        
        Set<Class<?>> knownTypes = new HashSet<>(entityClasses);
        
        // Sorting them by their references to other entity types (smaller
        // index -> less references to other entity classes, greater index ->
        // more references to other entity classes).
        //
        // NOTE: Circular references are not supported and will be ignored.
        
        List<Class<?>> result = new ArrayList<>();
        
        while (!entityClasses.isEmpty()) {
            for (Class<?> cls : entityClasses) {
                boolean dependenciesSatisfied =
                        Stream.of(cls.getDeclaredFields())
                                .filter(fd -> !fd.isAnnotationPresent(
                                        JsonIgnore.class))
                                .map(Field::getType)
                                .filter(ImporterReflectionWrapper::isReferenceType)
                                .filter(knownTypes::contains)
                                .allMatch(result::contains);
                
                if (!dependenciesSatisfied) {
                    continue;
                }
                
                result.add(cls);
            }
            
            if (!entityClasses.removeAll(result)) {
                // Since no entry of the unorderedTypes set has been moved to
                // the availableTypes list, there must be a circular reference.
                
                break;
            }
        }
        
        return result;
    }
    
    private static String getInstanceIdentifier(Object entity) {
        Class<?> entityClass = entity.getClass();
        Object idValue;
        
        Field idField = PersistenceHelper.getIdField(entityClass);
        idField.setAccessible(true);
        
        try {
            idValue = idField.get(entity);
        } catch (IllegalAccessException ex) {
            throw new IllegalStateException(ex);
        }
        
        return String.format(
                "s/%s/%s",
                entityClass.getName(),
                idValue.toString());
    }
    
    /**
     * A list that contains all entity types that are allowed to be accessed by
     * the {@link ImporterProviderImpl} in their dependency order.
     * 
     * (Index 0 = No dependencies on other entities, Index n = May have
     * dependencies on previous entity types)
     */
    private final List<Class<?>> availableTypes;
    private final PersistenceHelper persistenceHelper;
    
    ImporterReflectionWrapper(EntityManagerFactory entityManagerFactory,
            PersistenceHelper persistenceHelper) {
        this.availableTypes = ImporterReflectionWrapper.getAvailableTypes(
                entityManagerFactory);
        
        this.persistenceHelper = persistenceHelper;
    }
    
    List<FrontendTypeDto> getAvailableTypes() {
        return this.availableTypes.stream().map(cls -> {
            Set<FrontendAttributeDto> attrDtos = this.getMappableFields(cls)
                    .stream()
                    .map(fd -> {
                        Class<?> type = fd.getType();
                        FrontendTypeReferenceDto typeRefDto =
                                new FrontendTypeReferenceDto();
                        
                        if (ImporterReflectionWrapper.isReferenceType(type)) {
                            typeRefDto.setReference(true);
                            typeRefDto.setReferenceIdentifier(type.getName());
                        } else {
                            typeRefDto.setReference(false);
                            typeRefDto.setReferenceIdentifier(null);
                        }
                        
                        FrontendAttributeDto attrDto =
                                new FrontendAttributeDto();
                        
                        attrDto.setIdentifier(fd.getName());
                        attrDto.setDisplayName(fd.getName());
                        attrDto.setType(typeRefDto);
                        
                        return attrDto;
                    }).collect(Collectors.toSet());
            
            FrontendTypeDto typeDto = new FrontendTypeDto();
            
            typeDto.setIdentifier(cls.getName());
            typeDto.setDisplayName(cls.getSimpleName());
            typeDto.setAttributes(attrDtos);
            
            return typeDto;
        }).collect(Collectors.toList());
    }
    
    Object deserializeEntity(FrontendObjectDto dto, ObjectPool pool) {
        return this.deserializeEntity(dto, pool, null);
    }
    
    Object deserializeEntity(
            FrontendObjectDto dto,
            ObjectPool pool,
            Object existingEntity) {
        Class<?> entityClass = this.resolveEntityClass(dto.getTypeIdentifier());
        final Object entity;
        
        // Creating a new instance, if we do not modify an existing instance.
        
        if (existingEntity == null) {
            try {
                entity = entityClass.getConstructor().newInstance();
            } catch (NoSuchMethodException |
                    InstantiationException |
                    IllegalAccessException |
                    InvocationTargetException ex) {
                throw new IllegalArgumentException(ex);
            }
        } else {
            entity = existingEntity;
        }
        
        // Only modifying those fields that have been specified in the dto and
        // are allowed to access (mappable).
        
        this.getMappableFields(entityClass)
                .stream()
                .filter(field -> dto.getAttributes()
                        .stream()
                        .anyMatch(attr -> Objects.equals(
                                field.getName(),
                                attr.getAttributeIdentifier())))
                .forEach(field -> {
                    field.setAccessible(true);
                    
                    // Resolving the corresponding attribute from the dto
                    
                    FrontendAttributeValueDto attrDto = dto.getAttributes()
                            .stream()
                            .filter(attr -> Objects.equals(
                                    field.getName(),
                                    attr.getAttributeIdentifier()))
                            .findAny()
                            .orElse(null);
                    
                    // Depending on the attribute value, we have to execute
                    // different operations
                    
                    Object resolvedValue = null;
                    String refId;
                    Object refObj;
                    
                    switch (attrDto.getValueType()) {
                        case Value:
                            // NOTE: Also if "null" is not valid for a value
                            // type, we ignore it silently to make things more
                            // robust.
                            
                            String value = attrDto.getValue();
                            
                            if (value == null) {
                                return;
                            }
                            
                            resolvedValue = PrimitiveHelper.parsePrimitive(
                                    value, field.getType());
                            break;
                            
                        case PoolReference:
                            refId = attrDto.getValue();
                            
                            if (refId == null) {
                                return;
                            }
                            
                            refObj = pool.find(refId);
                            
                            if (refObj == null) {
                                throw new IllegalArgumentException(
                                        "Invalid reference!");
                            }
                            
                            resolvedValue = refObj;
                            break;
                            
                        case ExistingReference:
                            refId = attrDto.getValue();
                            
                            if (refId == null) {
                                return;
                            }
                            
                            refObj = this.resolveExistingReference(refId);
                            
                            if (refObj == null) {
                                throw new IllegalArgumentException(
                                        "Invalid reference!");
                            }
                            
                            resolvedValue = refObj;
                            break;
                    }
                    
                    try {
                        field.set(entity, resolvedValue);
                    } catch (IllegalAccessException ex) {
                        throw new IllegalArgumentException(ex);
                    }
                });
        
        return entity;
    }
    
    FrontendObjectDto serializeEntity(Object entity) {
        Set<FrontendAttributeValueDto> attrDtos =
                this.getMappableFields(entity.getClass())
                        .stream()
                        .map(field -> {
                            FrontendAttributeValueDto attrDto =
                                    new FrontendAttributeValueDto();
                            
                            attrDto.setAttributeIdentifier(field.getName());
                            attrDto.setKeyComponent(false);
                            
                            Class<?> fieldType = field.getType();
                            field.setAccessible(true);
                            
                            Object value;
                            
                            try {
                                value = field.get(entity);
                            } catch (IllegalAccessException ex) {
                                throw new IllegalStateException(ex);
                            }
                            
                            if (ImporterReflectionWrapper.isReferenceType(fieldType)) {
                                attrDto.setValue(ImporterReflectionWrapper.getInstanceIdentifier(value));
                                attrDto.setValueType(FrontendAttributeValueType.ExistingReference);
                            } else {
                                attrDto.setValue(Objects.toString(value));
                                attrDto.setValueType(FrontendAttributeValueType.Value);
                            }
                            
                            return attrDto;
                        })
                        .collect(Collectors.toSet());
        
        FrontendObjectDto dto = new FrontendObjectDto();
        
        dto.setIdentifier(ImporterReflectionWrapper.getInstanceIdentifier(
                entity));
        
        dto.setTypeIdentifier(entity.getClass().getName());
        dto.setAttributes(attrDtos);
        dto.setReplaceRule(FrontendReplaceRule.Ignore);
        
        return dto;
    }
    
    Object findDuplicate(
            FrontendObjectDto dto,
            Collection<?> duplicatePool,
            ObjectPool pool) {
        Class<?> entityClass = this.resolveEntityClass(dto.getTypeIdentifier());
        
        // Since resolving fields with Java's reflection API is considered to be
        // slow, we do this only once at the beginning for all key component
        // attributes.
        // (The assigned value is the expected value.)
        
        Map<Field, Object> fields = new HashMap<>();
        
        for (FrontendAttributeValueDto attr : dto.getAttributes()) {
            if (!attr.isKeyComponent()) {
                continue;
            }
            
            Field field;
            
            try {
                field = entityClass.getDeclaredField(
                        attr.getAttributeIdentifier());
            } catch (NoSuchFieldException ex) {
                throw new IllegalArgumentException(ex);
            }
            
            field.setAccessible(true);
            
            // Resolving the reference or the primitive value
            
            String value = attr.getValue();
            Object fieldValue = null;
            
            if (value != null) {
                switch (attr.getValueType()) {
                    case Value:
                        fieldValue = PrimitiveHelper.parsePrimitive(
                                value,
                                field.getType());
                        break;
                        
                    case PoolReference:
                        fieldValue = pool.find(value);
                        
                        if (fieldValue == null) {
                            throw new IllegalArgumentException(
                                    "Invalid reference!");
                        }
                        break;
                        
                    case ExistingReference:
                        fieldValue = this.resolveExistingReference(value);
                        
                        if (fieldValue == null) {
                            throw new IllegalArgumentException(
                                    "Invalid reference!");
                        }
                        break;
                }
            }
            
            // Putting the entry together
            
            fields.put(field, fieldValue);
        }
        
        // If there is no key component, we cannot perform a duplicate check
        
        if (fields.isEmpty()) {
            return null;
        }
        
        // Performing the lookup for duplicates
        
        return duplicatePool.stream()
                .filter(obj -> fields.entrySet()
                        .stream()
                        .allMatch(entry -> {
                            try {
                                return Objects.equals(
                                    entry.getKey().get(obj),
                                    entry.getValue());
                            } catch (IllegalAccessException ex) {
                                throw new IllegalArgumentException(ex);
                            }
                        }))
                .findAny()
                .orElse(null);
    }
    
    Class<?> resolveEntityClass(String typeIdentifier) {
        return this.availableTypes.stream()
                .filter(type -> Objects.equals(type.getName(), typeIdentifier))
                .findAny()
                .orElse(null);
    }
    
    private Set<Field> getMappableFields(Class<?> entityClass) {
        // We only include those attributes that match the following rules:
        //
        //  - Not annotated with @JsonIgnore
        //  - Type needs to be either primitive (including strings) or
        //    of another entity type (that is allowed)
        
        return Stream.of(entityClass.getDeclaredFields())
                .filter(fd -> !fd.isAnnotationPresent(JsonIgnore.class))
                .filter(fd -> {
                    Class<?> type = fd.getType();
                    
                    if (PrimitiveHelper.PRIMITIVE_CLASSES.contains(type)) {
                        return true;
                    }
                    
                    return this.availableTypes.contains(type);
                })
                .collect(Collectors.toSet());
    }
    
    private Object resolveExistingReference(String instanceIdentifier) {
        // The instanceIdentifier format is the following:
        //
        // s/{entityClassName}/{idAttributeValue}
        //
        // Parsing the identifier
        
        if (!instanceIdentifier.startsWith("s/")) {
            return null;
        }
        
        String[] components = instanceIdentifier.substring(2).split("/");
        
        if (components.length != 2) {
            return null;
        }
        
        String entityClassName = components[0];
        String idAttributeValue = components[1];
        
        // Resolving the entity class by its name
        
        Class<?> entityClass = this.availableTypes.stream()
                .filter(type -> Objects.equals(type.getName(), entityClassName))
                .findAny()
                .orElse(null);
        
        if (entityClass == null) {
            return null;
        }
        
        // Converting the identifier to the correct data type
        
        Object idValue = PrimitiveHelper.parsePrimitive(
                idAttributeValue,
                PersistenceHelper.getIdClass(entityClass));
        
        // Resolving the reference from the database
        
        return this.persistenceHelper.getRepo(entityClass)
                .findById(idValue)
                .orElse(null);
    }
}
