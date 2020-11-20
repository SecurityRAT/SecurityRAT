package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.StatusColumnValueDto;
import org.appsec.securityrat.api.provider.advanced.StatusColumnValueProvider;
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
public class StatusColumnValueResource {
    private static final String ENTITY_NAME = "statusColumnValue";
    
    @Inject
    private StatusColumnValueProvider provider;
    
    @PostMapping("/statusColumnValues")
    public ResponseEntity<StatusColumnValueDto> create(
            @RequestBody StatusColumnValueDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.create(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        StatusColumnValueResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/statusColumnValues")
    public ResponseEntity<StatusColumnValueDto> update(
            @RequestBody StatusColumnValueDto dto) {
        if  (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.update(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        StatusColumnValueResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/statusColumnValues")
    public ResponseEntity<Set<StatusColumnValueDto>> getAll() {
        Set<StatusColumnValueDto> result = this.provider.findAll();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/statusColumnValues/{id}")
    public ResponseEntity<StatusColumnValueDto> get(@PathVariable Long id) {
        StatusColumnValueDto dto = this.provider.find(id);
        
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/statusColumnValues/statusColumn/{id}")
    public ResponseEntity<Set<StatusColumnValueDto>> getByStatusColumn(
            @PathVariable Long id) {
        Set<StatusColumnValueDto> result = this.provider.findByStatusColumn(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/statusColumnValues/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.delete(id)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        StatusColumnValueResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/statusColumnValues/{query}")
    public ResponseEntity<List<StatusColumnValueDto>> search(
            @PathVariable String query) {
        List<StatusColumnValueDto> result = this.provider.search(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
