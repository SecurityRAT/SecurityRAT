package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import lombok.Getter;
import org.appsec.securityrat.api.dto.SimpleDto;
import org.appsec.securityrat.api.provider.PersistentStorage;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Provides a generic implementation of a REST endpoint that handles a single
 * implementation of {@link SimpleDto}.
 * 
 * @param <TId> The type of <code>TSimpleDto</code>'s identifier.
 * 
 * @param <TSimpleDto> The type of the data transfer object that this resource
 *                     handles.
 */
public abstract class SimpleResource<TId, TSimpleDto extends SimpleDto<TId>> {
    private static HttpHeaders createAlert(String message, String params) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-sdlctoolApp-alert", message);
        headers.add("X-sdlctoolApp-params", params);
        return headers;
    }
    
    public static HttpHeaders createEntityCreationAlert(
            String entityName,
            Object identifier) {
        String message = String.format(
                "A new %s is created with identifier %s",
                entityName,
                identifier.toString());
        
        return SimpleResource.createAlert(message, identifier.toString());
    }
    
    public static HttpHeaders createEntityUpdateAlert(
            String entityName,
            Object identifier) {
        String message = String.format(
                "A %s is updated with identifier %s",
                entityName,
                identifier.toString());
        
        return SimpleResource.createAlert(message, identifier.toString());
    }
    
    public static HttpHeaders createEntityDeletionAlert(
            String entityName,
            Object identifier) {
        String message = String.format(
                "A %s is deleted with identifier %s",
                entityName,
                identifier.toString());
        
        return SimpleResource.createAlert(message, identifier.toString());
    }
    
    @Getter
    private final Class<TSimpleDto> dtoClass;
    private final String entityName;
    
    /**
     * The persistent storage that is used for storing and querying the data
     * transfer object instances.
     */
    @Inject
    protected PersistentStorage storage;
    
    protected SimpleResource(Class<TSimpleDto> dtoClass) {
        this.dtoClass = dtoClass;
        
        // Deriving the name of the entity by its class. (By default, we just
        // need to convert the first character to lowercase.)
        
        String simpleName = this.dtoClass.getSimpleName();
        
        this.entityName = String.format("%s%s",
                simpleName.substring(0, 1).toLowerCase(),
                simpleName.substring(1));
    }
    
    protected SimpleResource(Class<TSimpleDto> dtoClass, String entityName) {
        this.dtoClass = dtoClass;
        this.entityName = entityName;
    }
    
    protected ResponseEntity<TSimpleDto> create(TSimpleDto dto) {
        // The client is not allowed to choose a unique identifier for the new
        // data transfer object.
        
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.storage.create(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        this.entityName,
                        dto.getId()))
                .body(dto);
    }
    
    protected ResponseEntity<TSimpleDto> update(TSimpleDto dto) {
        // It is required that the data transfer object provides a non-null
        // unique identifier. Otherwise the PersistentStorage will not know what
        // to update.
        
        if (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.storage.update(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        this.entityName,
                        dto.getId()))
                .body(dto);
    }
    
    protected ResponseEntity<Void> delete(TId id) {
        // id is not allowed to be null.
        
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.storage.delete(id, this.dtoClass)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        this.entityName,
                        id))
                .build();
    }
    
    protected ResponseEntity<TSimpleDto> get(TId id) {
        // id is not allowed to be null.
        
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        TSimpleDto dto = this.storage.find(id, this.dtoClass);
        
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(dto);
    }
    
    protected ResponseEntity<Set<TSimpleDto>> getAll() {
        Set<TSimpleDto> dtoSet = this.storage.findAll(this.dtoClass);
        
        if (dtoSet == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(dtoSet);
    }
    
    protected ResponseEntity<List<TSimpleDto>> search(String query) {
        List<TSimpleDto> dtoList = this.storage.search(query, this.dtoClass);
        
        if (dtoList == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(dtoList);
    }
}
