package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.TagInstanceDto;
import org.appsec.securityrat.api.provider.advanced.TagInstanceProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TagInstanceResource {
    private static final String ENTITY_NAME = "tagInstance";
    
    @Inject
    private TagInstanceProvider provider;
    
    @PostMapping("/tagInstances")
    public ResponseEntity<TagInstanceDto> create(
            @RequestBody TagInstanceDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.create(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        TagInstanceResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/tagInstances")
    public ResponseEntity<TagInstanceDto> update(
            @RequestBody TagInstanceDto dto) {
        if  (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.update(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        TagInstanceResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/tagInstances")
    public ResponseEntity<Set<TagInstanceDto>> getAll() {
        Set<TagInstanceDto> result = this.provider.findAll();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/tagInstances/{id}")
    public ResponseEntity<TagInstanceDto> get(@PathVariable Long id) {
        TagInstanceDto dto = this.provider.find(id);
        
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/tagInstances/tagCategory/{id}")
    public ResponseEntity<Set<TagInstanceDto>> getAllByCategory(
            @PathVariable Long id) {
        Set<TagInstanceDto> result = this.provider.findByCategoryId(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/tagInstances/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.delete(id)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        TagInstanceResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/tagInstances/{query}")
    public ResponseEntity<List<TagInstanceDto>> search(
            @PathVariable String query) {
        List<TagInstanceDto> result = this.provider.search(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
